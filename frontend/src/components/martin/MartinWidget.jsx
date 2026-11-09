// Martín: asistente flotante con respuestas guiadas sin consumo de Gemini.
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, BookOpen, Send, Trash2, X } from "lucide-react";

// Reutilizamos el cliente institucional: incluye cookies de sesión HttpOnly.
import api from "../../services/api";

// Conservamos el historial solo durante esta pestaña y hasta 4 horas.
import { clearMartinChat, readMartinChat, saveMartinChat, MARTIN_CHAT_CLEARED_EVENT } from "../../utils/martinChatSession";

// Las dos imágenes existentes en el proyecto son las únicas que necesita Martín.
import martinGif from "../../assets/martin/martin.gif";
import martinMini from "../../assets/martin/martin-mini.png";

// Cargamos los estilos aislados para no modificar otras pantallas.
import "../../styles/components/martin/MartinWidget.css";

// Mensaje seguro disponible incluso cuando el servidor no responde.
const ERROR_MESSAGE = "¡Ups! Hoy tengo un pequeño inconveniente y no puedo conversar contigo. 💙 ¿Te parece si lo intentamos un poquito más tarde? ¡Gracias por tu paciencia! ⚓";

// Conservamos una bienvenida local para los casos en que falle el menú.
const FALLBACK_WELCOME = "¡Hola! Soy Martín ⚓😊. ¡Qué gusto verte! ¿Te gustaría conocer nuestra iglesia?";

// Evitamos que una falla de conectividad exponga mensajes internos de la API.
function friendlyError(error) {
  const code = error?.response?.status;
  if (code === 401) return "Para conversar conmigo sobre otras preguntas, primero inicia sesión. ¡Te espero con gusto! 😊";
  if (code === 429) return "¡Qué bueno que quieras seguir conversando! 💙 Por hoy hemos llegado al límite de mensajes. Podemos seguir mañana.";
  if (code === 403) return "No puedo ayudarte con esa solicitud, pero podemos seguir hablando sobre la Biblia o nuestra comunidad. ⚓";
  return ERROR_MESSAGE;
}

// Convertimos los mensajes en un único formato para mostrarlos en pantalla.
function bubble(from, text) {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, from, text };
}

export default function MartinWidget() {
  // React Router permite abrir páginas sin recargar toda la PWA.
  const navigate = useNavigate();
  const location = useLocation();
  // Controlamos la ventana grande y la versión compacta de Martín.
  const [open, setOpen] = useState(false);
  // El menú llega desde nuestros archivos JSON del backend, nunca desde Gemini.
  const [menu, setMenu] = useState([]);
  // Los mensajes se mantienen solo en memoria: no se guardan en MongoDB.
  const [messages, setMessages] = useState(() => readMartinChat());
  // Guardamos la pregunta escrita únicamente mientras el componente está abierto.
  const [draft, setDraft] = useState("");
  // El menú se recoge al iniciar preguntas libres y puede abrirse manualmente.
  const [choicesExpanded, setChoicesExpanded] = useState(true);
  // La Biblia se consulta desde archivos JSON locales, sin iniciar sesión.
  const [bibleOpen, setBibleOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("1");
  const [verse, setVerse] = useState("1");
  // La sesión permite distinguir invitados y cuentas autorizadas.
  // Estados independientes: comprobando, autenticado, visitante o servicio sin respuesta.
  // No confundimos una falla de red con una sesión cerrada.
  const [sessionStatus, setSessionStatus] = useState("checking");
  // La cuota viene del backend y nunca la decide el navegador.
  const [chatAvailable, setChatAvailable] = useState(false);
  const [remaining, setRemaining] = useState(null);
  // Evitamos que se envíen solicitudes repetidas mientras respondemos.
  const [busy, setBusy] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  // Conservamos los mensajes al minimizar o cambiar de página.
  // sessionStorage pertenece a esta pestaña y no almacena las conversaciones en MongoDB.
  useEffect(() => { saveMartinChat(messages); }, [messages]);

  // Cada minuto comprobamos el plazo del historial, incluso con el chat abierto.
  // No hay solicitudes de red ni consumo de Gemini en esta comprobación.
  useEffect(() => {
    const checkHistoryExpiry = () => {
      if (messages.length > 0 && readMartinChat().length === 0) {
        clearMartinChat();
      }
    };
    const interval = window.setInterval(checkHistoryExpiry, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [messages.length]);

  // Cuando se cierra sesión, el menú de administración o de miembros
  // notifica al asistente para borrar inmediatamente su conversación.
  useEffect(() => {
    const onSessionClosed = () => {
      setMessages([]);
      setDraft("");
      setRemaining(null);
      setChatAvailable(false);
      setSessionStatus("guest");
    };
    window.addEventListener(MARTIN_CHAT_CLEARED_EVENT, onSessionClosed);
    return () => window.removeEventListener(MARTIN_CHAT_CLEARED_EVENT, onSessionClosed);
  }, []);

  // Consultamos la ruta protegida que identifica la sesión y la disponibilidad.
  // Un HTTP 200 demuestra que el backend reconoció la cuenta autorizada.
  // Un HTTP 401 significa que no existe una sesión válida.
  // Otros errores NO significan que la persona haya cerrado su sesión.
  const checkMartinSession = useCallback(async () => {
    setSessionStatus("checking");
    setChatAvailable(false);
    setRemaining(null);

    try {
      // El backend ya indica que esta respuesta no debe guardarse en caché.
      // No enviamos Cache-Control desde el navegador: ese encabezado
      // activaba una comprobación CORS que el servidor rechazaba.
      // Agregamos un parámetro único para evitar reutilizar respuestas anteriores.
      const response = await api.get("/martin/estado", {
        params: { _sessionCheck: Date.now() },
      });

      // El servidor confirma la sesión, aunque Martín esté desactivado.
      if (response.data?.success === true && response.data?.data) {
        const status = response.data.data;
        setSessionStatus("authenticated");
        setChatAvailable(Boolean(status.available));
        setRemaining(typeof status.remaining === "number" ? status.remaining : null);
      } else {
        // Una respuesta incompleta no es prueba de ausencia de sesión.
        setSessionStatus("unavailable");
      }
    } catch (error) {
      // Solo un rechazo explícito 401 identifica a una persona visitante.
      if (error?.response?.status === 401) {
        // No dejamos visible la conversación anterior si la sesión expiró.
        clearMartinChat();
        setMessages([]);
        setDraft("");
        setSessionStatus("guest");
      } else {
        setSessionStatus("unavailable");
      }
    }
  }, []);

  // Las respuestas del menú no usan Gemini y no requieren iniciar sesión.
  const loadMartin = useCallback(async () => {
    // Si ya existe una conversación temporal, la conservamos.
    setMessages((previous) => previous.length ? previous : [bubble("martin", FALLBACK_WELCOME)]);

    // Revisamos el estado por separado: el menú puede fallar sin invalidar sesión.
    void checkMartinSession();

    try {
      const response = await api.get("/martin/menu");
      const data = response.data?.data;
      setMenu(Array.isArray(data?.options) ? data.options : []);
      setMessages((previous) => {
        // Solo reemplazamos la bienvenida provisional si aún no hay conversación.
        if (previous.length === 1 && previous[0].from === "martin" && previous[0].text === FALLBACK_WELCOME) {
          return [bubble("martin", data?.message || FALLBACK_WELCOME)];
        }
        return previous.length ? previous : [bubble("martin", data?.message || FALLBACK_WELCOME)];
      });
    } catch {
      setMenu([]);
      setMessages((previous) => previous.length ? previous : [bubble("martin", ERROR_MESSAGE)]);
    }
  }, [checkMartinSession]);

  // Revalidamos cada vez que se abre Martín; no guardamos tokens en React.
  useEffect(() => {
    if (open) void loadMartin();
  }, [open, loadMartin]);

  // Si una persona inicia/cierra sesión en otra pestaña, se comprueba de nuevo
  // al volver a esta ventana, sin consultar Gemini ni actualizar MongoDB.
  useEffect(() => {
    if (!open) return undefined;
    const recheckOnFocus = () => { void checkMartinSession(); };
    window.addEventListener("focus", recheckOnFocus);
    return () => window.removeEventListener("focus", recheckOnFocus);
  }, [open, checkMartinSession]);

  // Desplazamos el historial visual hasta el último mensaje.
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  // Cerramos el panel al cambiar de página para no tapar el contenido.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Elegir un botón del menú nunca consume la cuota de Gemini.
  async function chooseOption(option) {
    if (busy) return;
    if (option.id === "biblia") {
      setChoicesExpanded(false);
      setBibleOpen(true);
      try {
        const response = await api.get("/martin/biblia/libros");
        const available = response.data?.data?.libros || [];
        setBooks(available);
        setBook((current) => current || available[0]?.id || "");
        setMessages((prev) => [...prev, bubble("martin", "¡Con gusto! 📖 Elige un libro, capítulo y versículo. Lo leeremos juntos aquí mismo, sin gastar tus preguntas del día. 💙")]);
      } catch {
        setMessages((prev) => [...prev, bubble("martin", "¡Ups! Ahora no pude abrir mi Biblia. ¿Lo intentamos más tarde? ⚓")]);
      }
      return;
    }
    setBusy(true);
    setMessages((prev) => [...prev, bubble("user", option.titulo)]);
    try {
      // El identificador procede de la lista controlada del servidor.
      const result = await api.get(`/martin/menu/${encodeURIComponent(option.id)}`);
      const data = result.data?.data;
      // Los datos básicos son públicos; las opciones exclusivas requieren sesión confirmada.
      const hasSession = sessionStatus === "authenticated";
      // Elegimos el mensaje pensado para la persona que está utilizando Martín.
      const answer = hasSession && data?.respuestaAutenticado
        ? data.respuestaAutenticado
        : data?.respuesta || ERROR_MESSAGE;
      // Solo las cuentas autorizadas ven accesos directos a secciones de miembros.
      const link = hasSession && data?.enlaceAutenticado
        ? data.enlaceAutenticado
        : data?.enlace;
      // Conservamos un texto de botón claro y amigable.
      const linkText = hasSession && data?.enlaceAutenticado
        ? data.enlaceTextoAutenticado
        : data?.enlaceTexto;
      // Agregamos la respuesta y su acceso directo sin crear registros en la base de datos.
      setMessages((prev) => [...prev, {
        ...bubble("martin", answer),
        link,
        linkText,
      }]);
    } catch {
      setMessages((prev) => [...prev, bubble("martin", ERROR_MESSAGE)]);
    } finally { setBusy(false); }
  }

  // Leemos un único versículo local. Esta función es pública y nunca usa Gemini.
  async function readBibleVerse(event) {
    event.preventDefault();
    if (busy || !book) return;
    const selected = books.find((item) => item.id === book);
    const c = Number(chapter);
    const v = Number(verse);
    if (!selected || !Number.isInteger(c) || c < 1 || c > selected.capitulos ||
        !Number.isInteger(v) || v < 1 || v > 176) {
      setMessages((prev) => [...prev, bubble("martin", "¿Revisamos juntos el libro, el capítulo y el versículo? Parece que alguno necesita ajustarse. 😊")]);
      return;
    }
    setBusy(true);
    try {
      const result = await api.get(`/martin/biblia/versiculo/${encodeURIComponent(book)}/${c}/${v}`);
      const data = result.data?.data;
      setMessages((prev) => [...prev,
        bubble("user", `📖 ${data.referencia}`),
        bubble("martin", `${data.referencia}\n\n«${data.texto}»\n\n¿Te gustaría leer otro versículo? 💙`),
      ]);
    } catch (error) {
      setMessages((prev) => [...prev, bubble("martin", error?.response?.data?.message || "No pude encontrar esa lectura ahora. ¿Probamos otra? 😊")]);
    } finally { setBusy(false); }
  }

  // Las preguntas personalizadas solo son posibles con sesión y asistente disponible.
  async function sendQuestion(event) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || busy || sessionStatus !== "authenticated" || !chatAvailable) return;
    // Recuperamos solamente preguntas y respuestas libres completadas por Gemini.
    // Jamás enviamos opciones guiadas, datos del navegador o información de la cuenta.
    const recent = messages.filter((item) => item.free === true)
      .slice(-6)
      .map((item) => ({ role: item.from === "user" ? "user" : "model", text: item.text.slice(0, 1600) }));
    setDraft("");
    setChoicesExpanded(false);
    setBibleOpen(false);
    setBusy(true);
    const userMessage = { ...bubble("user", question), free: true };
    setMessages((prev) => [...prev, userMessage]);
    try {
      // El servidor valida los últimos mensajes antes de ofrecerlos como contexto a Gemini.
      const response = await api.post("/martin/chat", { message: question, history: recent });
      const data = response.data?.data;
      setMessages((prev) => [...prev, { ...bubble("martin", data?.answer || ERROR_MESSAGE), free: data?.fromAI === true }]);
      if (data?.fromAI !== true) setMessages((prev) => prev.map((item) => item.id === userMessage.id ? { ...item, free: false } : item));
      if (typeof data?.remaining === "number") setRemaining(data.remaining);
    } catch (error) {
      setMessages((prev) => [...prev.map((item) => item.id === userMessage.id ? { ...item, free: false } : item), bubble("martin", friendlyError(error))]);
      // Si la sesión expiró durante el chat, actualizamos el estado visual.
      if (error?.response?.status === 401) {
        clearMartinChat();
        setMessages([bubble("martin", "Tu sesión terminó. 💙 Si quieres seguir conversando, puedes volver a iniciar sesión.")]);
        setSessionStatus("guest");
      }
      if ([429, 503].includes(error?.response?.status)) setChatAvailable(false);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  // Borramos los mensajes solo cuando la persona lo solicita.
  function resetConversation() {
    // Eliminamos los mensajes sin emitir el evento de cierre de sesión.
    // El usuario permanece autenticado y conserva su cuota diaria.
    clearMartinChat({ notifySessionClosed: false });
    setDraft("");
    setChoicesExpanded(true);
    setBibleOpen(false);
    setMessages([bubble("martin", FALLBACK_WELCOME)]);
  }

  // El menú puede llevar a secciones existentes de la PWA.
  function goTo(url) {
    if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) return;
    setOpen(false);
    navigate(url);
  }

  return (
    <div className="martin-widget">
      {!open ? (
        <button type="button" className="martin-widget__launcher" aria-label="Abrir asistente Martín" onClick={() => setOpen(true)}>
          <img src={martinMini} alt="" />
          <span>¿Te ayudo?</span>
        </button>
      ) : (
        <section className="martin-widget__panel" role="dialog" aria-modal="false" aria-label="Conversar con Martín">
          <header className="martin-widget__header">
            <img className="martin-widget__portrait" src={martinGif} alt="Martín, asistente de Iglesia El Ancla" />
            <div className="martin-widget__heading"><strong>¡Hola, soy Martín! ⚓</strong><small>Tu amigo de Iglesia El Ancla</small></div>
            <button type="button" className="martin-widget__close" aria-label="Cerrar Martín" onClick={() => setOpen(false)}><X size={20} /></button>
          </header>
          <div className="martin-widget__conversation" aria-live="polite">
            {sessionStatus !== "checking" && messages.map((item) => (
              <div key={item.id} className={`martin-widget__bubble martin-widget__bubble--${item.from}`}>
                <span>{item.text}</span>
                {item.link && <button type="button" className="martin-widget__inline-link" onClick={() => goTo(item.link)}>{item.linkText || "Ir a la sección"}<ArrowRight size={15} /></button>}
              </div>
            ))}
            {busy && <p className="martin-widget__busy">Martín está preparando tu respuesta…</p>}
            <div ref={messagesEnd} />
          </div>
          <div className={`martin-widget__choices ${choicesExpanded ? "" : "martin-widget__choices--closed"}`}>
            <button type="button" className="martin-widget__choices-toggle" onClick={() => setChoicesExpanded((value) => !value)} aria-expanded={choicesExpanded}>
              <span>¿Qué te gustaría conocer?</span><ChevronDown size={15} aria-hidden="true" />
            </button>
            {choicesExpanded && <div className="martin-widget__choice-list">
              {menu.filter((option) => option.id !== "acceso").map((option) => (
                <button key={option.id} type="button" disabled={busy} onClick={() => chooseOption(option)}>{option.titulo}</button>
              ))}
            </div>}
          </div>
          {bibleOpen && <form className="martin-widget__bible" onSubmit={readBibleVerse}>
            <div className="martin-widget__bible-heading"><BookOpen size={16} /><strong>Leamos la Biblia 📖</strong><button type="button" onClick={() => setBibleOpen(false)} aria-label="Cerrar lectura bíblica"><X size={15}/></button></div>
            <label>Libro
              <select value={book} onChange={(event) => { setBook(event.target.value); setChapter("1"); setVerse("1"); }} required>
                {books.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
              </select>
            </label>
            <div className="martin-widget__bible-numbers">
              <label>Capítulo <input type="number" min="1" max={books.find((item) => item.id === book)?.capitulos || 150} value={chapter} onChange={(event) => setChapter(event.target.value)} required /></label>
              <label>Versículo <input type="number" min="1" max="176" value={verse} onChange={(event) => setVerse(event.target.value)} required /></label>
              <button type="submit" disabled={busy || !book}>Leer</button>
            </div>
          </form>}
          {sessionStatus === "checking" ? (
            // Evitamos mostrar el login mientras se comprueba una sesión válida.
            <div className="martin-widget__guest martin-widget__guest--status" role="status">
              <span>Un momentito, estoy comprobando si podemos conversar. 😊</span>
            </div>
          ) : sessionStatus === "authenticated" && chatAvailable ? (
            <form className="martin-widget__composer" onSubmit={sendQuestion}>
              <label htmlFor="martin-question">¿Quieres preguntarme algo más?</label>
              <div><input ref={inputRef} id="martin-question" value={draft} maxLength={700} onChange={(event) => setDraft(event.target.value)} placeholder="Escribe tu pregunta aquí…" disabled={busy} /><button type="submit" disabled={busy || !draft.trim()} aria-label="Enviar pregunta"><Send size={18} /></button></div>
              <small>{remaining !== null ? `Te quedan ${remaining} preguntas de hoy. ` : ""}Por tu privacidad, evita compartir información personal.</small>
            </form>
          ) : (
            <div className="martin-widget__guest">
              {sessionStatus === "authenticated" ? (
                <span>Por ahora no puedo recibir preguntas nuevas. 💙 Puedes seguir explorando las opciones de arriba.</span>
              ) : sessionStatus === "unavailable" ? (
                <>
                  <span>¡Ups! No pude comprobar si podemos conversar. ¿Intentamos otra vez? 💙</span>
                  <button type="button" onClick={() => void checkMartinSession()}>Reintentar</button>
                </>
              ) : (
                <>
                  <span>¿Tienes otra pregunta? 💙 Inicia sesión para que conversemos.</span>
                  <button type="button" onClick={() => goTo("/login")}>Iniciar sesión <ArrowRight size={15} /></button>
                </>
              )}
            </div>
          )}
          <footer className="martin-widget__footer">
            <button type="button" onClick={resetConversation} aria-label="Limpiar conversación con Martín"><Trash2 size={14} /> Limpiar conversación</button>
            <button type="button" onClick={() => setOpen(false)}>Minimizar <ChevronDown size={14} /></button>
          </footer>
        </section>
      )}
    </div>
  );
}
