// =========================================================
// EL ANCLA — LECTURA ASISTIDA (SIN SERVICIOS EXTERNOS)
// Lee elementos bajo el cursor, al enfocarlos con teclado y
// las respuestas nuevas de Martín, solo si el usuario lo activa.
// =========================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Ear, Pause, Play, Settings2, Volume2, VolumeX, X } from "lucide-react";
import "../../styles/components/accessibility/AccessibilityReader.css";

// La preferencia de velocidad se guarda localmente; no se almacena audio.
const RATE_KEY = "el-ancla:accessibility:voice-rate:v1";
const AUTO_KEY = "el-ancla:accessibility:martin-auto:v1";
const MARTIN_EVENT = "el-ancla:martin-new-response";

// No intentamos leer texto secreto ni los controles del propio lector.
const PROTECTED_SELECTOR = [
  "input", "textarea", "select", "option", "[contenteditable]",
  "[data-no-read]", "[data-reading-ignore]", "[aria-hidden='true']",
  "[hidden]", ".member-profile__details", ".member-profile__email",
].join(",");

// El selector ordena primero los elementos interactivos y el texto específico.
const READABLE_SELECTOR = [
  "button", "a", "label", "summary", "[role='button']", "[role='link']",
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "dt", "dd",
  "td", "th", "blockquote", ".martin-widget__bubble",
  ".member-activity__body", ".super-admin-member__activity-content",
].join(",");

function readSavedRate() {
  try {
    const stored = Number(window.localStorage.getItem(RATE_KEY));
    return Number.isFinite(stored) && stored >= 0.7 && stored <= 1.3 ? stored : 1;
  } catch { return 1; }
}

function readSavedAutoMartin() {
  try { return window.localStorage.getItem(AUTO_KEY) !== "false"; }
  catch { return true; }
}

// Limpia marcas visuales que se pronunciarían de forma extraña.
function normalizeSpeechText(value) {
  return String(value || "")
    .replace(/https?:\/\/\S+/gi, "enlace")
    .replace(/[*_#`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Obtiene solo una unidad concreta, nunca todo el documento HTML.
function getElementToRead(target) {
  if (!(target instanceof Element)) return null;
  if (target.closest(PROTECTED_SELECTOR)) return null;
  const candidate = target.closest(READABLE_SELECTOR);
  if (!candidate || candidate.closest(PROTECTED_SELECTOR)) return null;
  if (!candidate.getClientRects().length) return null;
  return candidate;
}

function getElementText(element) {
  // Para botones con iconos, el nombre accesible suele ser más claro.
  const label = element.getAttribute("aria-label") || element.getAttribute("title");
  const text = label || element.innerText || element.textContent || "";
  return normalizeSpeechText(text).slice(0, 550);
}

export default function AccessibilityReader() {
  const location = useLocation();
  const supported = typeof window !== "undefined" &&
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  // Iniciamos apagados en cada visita: jamás reproducimos voz sin activación.
  const [enabled, setEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [rate, setRate] = useState(readSavedRate);
  const [autoMartin, setAutoMartin] = useState(readSavedAutoMartin);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");

  // Referencias para controlar la voz entre renders y eventos del documento.
  const hoverTimerRef = useRef(null);
  const activeUtteranceRef = useRef(null);
  const lastElementRef = useRef(null);
  const isMartinSpeakingRef = useRef(false);
  const speakingTokenRef = useRef(0);

  // Cancela la voz anterior y limpia la cola de síntesis.
  const stopReading = useCallback(() => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    speakingTokenRef.current += 1;
    isMartinSpeakingRef.current = false;
    activeUtteranceRef.current = null;
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    setCurrentLabel("");
  }, [supported]);

  // Convierte texto a voz desde el navegador, sin llamadas a nuestra API.
  const speak = useCallback((rawText, source = "page") => {
    if (!supported) return;
    const text = normalizeSpeechText(rawText).slice(0, source === "martin" ? 1600 : 550);
    if (!text) return;

    // Siempre cancelamos antes de hablar: evita voces superpuestas.
    stopReading();
    const token = speakingTokenRef.current;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "es-CL";
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Favorecemos una voz en español chileno y luego cualquier voz en español.
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === "es-cl") ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("es")) || null;

    activeUtteranceRef.current = utterance;
    isMartinSpeakingRef.current = source === "martin";
    setSpeaking(true);
    setCurrentLabel(source === "martin" ? "Leyendo la respuesta de Martín" : text.slice(0, 85));

    // Un evento viejo no debe borrar el estado de una lectura posterior.
    const finish = () => {
      if (speakingTokenRef.current !== token) return;
      activeUtteranceRef.current = null;
      isMartinSpeakingRef.current = false;
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  }, [rate, stopReading, supported]);

  // Encender requiere un clic consciente, para respetar políticas del navegador.
  const toggleEnabled = useCallback(() => {
    if (!supported) return;
    if (enabled) {
      stopReading();
      lastElementRef.current = null;
      setEnabled(false);
    } else {
      setEnabled(true);
      speak("Lectura asistida activada. Pasa el cursor sobre un texto o utiliza el teclado para escucharlo.");
    }
  }, [enabled, speak, stopReading, supported]);

  // Mover el ratón sobre un texto espera un instante para no leer cada pixel.
  useEffect(() => {
    if (!enabled || !supported) return undefined;

    const queueElement = (element, delay) => {
      if (isMartinSpeakingRef.current) return;
      if (!element || lastElementRef.current === element) return;
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = window.setTimeout(() => {
        hoverTimerRef.current = null;
        if (isMartinSpeakingRef.current) return;
        const text = getElementText(element);
        if (!text) return;
        lastElementRef.current = element;
        speak(text);
      }, delay);
    };

    const onPointerOver = (event) => {
      if (event.pointerType === "touch") return;
      queueElement(getElementToRead(event.target), 420);
    };

    const onFocusIn = (event) => {
      queueElement(getElementToRead(event.target), 80);
    };

    // El documento escucha también los componentes añadidos dinámicamente.
    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("focusin", onFocusIn, true);
    return () => {
      document.removeEventListener("pointerover", onPointerOver, true);
      document.removeEventListener("focusin", onFocusIn, true);
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    };
  }, [enabled, speak, supported]);

  // Las respuestas nuevas de Martín se anuncian solo con la opción autorizada.
  useEffect(() => {
    if (!enabled || !autoMartin || !supported) return undefined;
    const onMartinResponse = (event) => {
      if (typeof event.detail?.text === "string") speak(event.detail.text, "martin");
    };
    window.addEventListener(MARTIN_EVENT, onMartinResponse);
    return () => window.removeEventListener(MARTIN_EVENT, onMartinResponse);
  }, [enabled, autoMartin, speak, supported]);

  // Al cambiar de ruta detenemos lo leído para evitar leer la página antigua.
  useEffect(() => {
    stopReading();
    lastElementRef.current = null;
  }, [location.pathname, stopReading]);

  // Al salir de la aplicación detenemos cualquier síntesis pendiente.
  useEffect(() => () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  const handleRateChange = (value) => {
    const next = Number(value);
    setRate(next);
    try { window.localStorage.setItem(RATE_KEY, String(next)); } catch { /* Opcional */ }
  };

  const handleAutoChange = (value) => {
    setAutoMartin(value);
    try { window.localStorage.setItem(AUTO_KEY, String(value)); } catch { /* Opcional */ }
  };

  const togglePause = () => {
    if (!supported || !speaking) return;
    if (paused) window.speechSynthesis.resume();
    else window.speechSynthesis.pause();
    setPaused(!paused);
  };

  return (
    <div className="accessibility-reader" data-reading-ignore="true">
      <button
        type="button"
        className={`accessibility-reader__launcher ${enabled ? "accessibility-reader__launcher--active" : ""}`}
        aria-label="Abrir opciones de lectura asistida"
        data-el-ancla-reader="launcher"
        title="Lectura asistida"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <Ear size={20} aria-hidden="true" />
        <span className="accessibility-reader__launcher-label">Lectura asistida</span>
        {enabled && <span className="accessibility-reader__dot" aria-hidden="true" />}
      </button>

      {expanded && (
        <section className="accessibility-reader__panel" aria-label="Opciones de lectura asistida">
          <div className="accessibility-reader__heading">
            <div><strong>Lectura asistida</strong><p>Escucha el contenido de la página. ⚓</p></div>
            <button type="button" className="accessibility-reader__icon-button" aria-label="Cerrar opciones" onClick={() => setExpanded(false)}><X size={18}/></button>
          </div>

          {!supported ? (
            <p role="status">Este navegador no admite lectura en voz alta. Puedes utilizar el lector de pantalla de tu dispositivo.</p>
          ) : (
            <>
              <button type="button" className="accessibility-reader__main-button" aria-pressed={enabled} onClick={toggleEnabled}>
                {enabled ? <VolumeX size={18}/> : <Volume2 size={18}/>}
                {enabled ? "Desactivar lectura" : "Activar lectura"}
              </button>
              <p className="accessibility-reader__help">{enabled ? "Pasa el cursor sobre un texto o llega a él con Tab." : "Activa el modo antes de comenzar a escuchar."}</p>

              <label className="accessibility-reader__setting" htmlFor="accessibility-reader-rate">
                <span><Settings2 size={16}/> Velocidad de voz</span>
                <select id="accessibility-reader-rate" value={rate} onChange={(event) => handleRateChange(event.target.value)}>
                  <option value={0.8}>Lenta</option>
                  <option value={1}>Normal</option>
                  <option value={1.2}>Rápida</option>
                </select>
              </label>

              <label className="accessibility-reader__checkbox">
                <input type="checkbox" checked={autoMartin} onChange={(event) => handleAutoChange(event.target.checked)} />
                Leer automáticamente las respuestas nuevas de Martín
              </label>

              {enabled && (
                <div className="accessibility-reader__controls">
                  <button type="button" onClick={togglePause} disabled={!speaking}>
                    {paused ? <Play size={16}/> : <Pause size={16}/>}
                    {paused ? "Continuar" : "Pausar"}
                  </button>
                  <button type="button" onClick={stopReading} disabled={!speaking}><VolumeX size={16}/> Detener</button>
                </div>
              )}
              <div className="accessibility-reader__status" role="status">
                {speaking ? currentLabel : enabled ? "Lectura activada" : "Lectura desactivada"}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
