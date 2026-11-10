// =========================================================
// GUÍA COMPLETA DEL PANEL ADMINISTRATIVO — IGLESIA EL ANCLA
// Visita cada opción del menú sin ejecutar ninguna acción.
// =========================================================
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, GraduationCap, X } from "lucide-react";
import "../../../styles/components/administration/layout/AdminTour.css";

// La elección se recuerda por navegador y tipo de panel.
const STORAGE_PREFIX = "el-ancla:admin-tour:v2:";

// Helper que crea pasos dirigidos a enlaces individuales del sidebar.
const item = (label, text, example, tip) => ({
  title: label, text, example, tip, item: label,
});

// Todos estos elementos aparecen en ambos menús según AdminSidebar.jsx.
const COMMON_STEPS = [
  { title: "¡Bienvenido a tu panel! ⚓", text: "Vamos a conocer las herramientas de Iglesia El Ancla. Cada paso destacará una opción real de tu interfaz y te explicará para qué sirve.", example: "Usa Siguiente y Anterior para avanzar a tu ritmo. Puedes saltar el recorrido cuando quieras.", tip: "Esta guía no abrirá formularios, enviará datos ni cambiará configuraciones.", target: ".admin-layout__content" },
  { title: "Menú lateral", text: "Este menú agrupa las herramientas por área. Puedes desplazarte hacia abajo para encontrar más funciones. En pantallas pequeñas se abre desde el botón de menú.", example: "Las opciones de Comunidad, Contenidos y Finanzas están organizadas en grupos fáciles de reconocer.", target: ".admin-sidebar__navigation" },
  item("Inicio", "Regresa al resumen general del panel administrativo. Desde aquí encontrarás accesos rápidos a las herramientas de la iglesia.", "Si necesitas orientarte después de visitar otro módulo, selecciona Inicio."),
  item("Mi espacio", "Abre tu espacio de miembro de la comunidad, independiente de tus tareas administrativas.", "Puedes consultar las funciones personales disponibles para ti."),
  item("Mi cuenta", "Permite consultar y administrar los datos de tu propia cuenta y las opciones de seguridad disponibles.", "Revisa tus datos personales cuando necesites actualizarlos.", "No compartas las credenciales de tu cuenta."),
  item("Mis actividades", "Consulta las actividades de la comunidad en las que participas y la información asociada a ellas.", "Comprueba tus reuniones o confirmaciones de asistencia."),
  item("Mis peticiones de oración", "Accede a las peticiones de oración que tú mismo has compartido desde tu perfil de miembro.", "Revisa tus propias solicitudes y su información."),
  item("Gestión de actividades", "Organiza las actividades internas de la comunidad y consulta sus participaciones o confirmaciones.", "Revisa qué personas asistirán a una reunión programada.", "Comprueba la fecha y los datos de cada actividad antes de modificarlos."),
  item("Peticiones de oración", "Esta es la sección administrativa para revisar y acompañar las peticiones de oración de la comunidad, según tus permisos.", "Consulta las peticiones que requieren seguimiento.", "Trata las solicitudes con discreción; pueden contener información sensible."),
  item("Miembros", "Permite consultar información de las personas registradas en la iglesia, de acuerdo con los permisos de tu cuenta.", "Busca los datos necesarios para una gestión de la comunidad.", "Usa la información personal solo para tareas autorizadas."),
  item("Voluntarios", "Ayuda a organizar a las personas que colaboran en los equipos y actividades de la iglesia.", "Consulta a los voluntarios y sus funciones disponibles."),
  item("Gestión de eventos", "Administra los contenidos de eventos que se muestran en la plataforma y en la información pública correspondiente.", "Actualiza los detalles de un evento especial de la iglesia.", "Verifica lugar, fecha y horario antes de publicar."),
  item("Recursos", "Gestiona los estudios, guías y materiales de apoyo destinados al crecimiento y aprendizaje de la comunidad.", "Consulta o administra un recurso bíblico disponible."),
  item("Recomendados", "Administra las recomendaciones de libros, música, películas, series u otros contenidos disponibles para la comunidad.", "Revisa las recomendaciones que aparecen en la plataforma.", "Utiliza contenidos adecuados y respeta los derechos de autor."),
  item("Páginas informativas", "Mantén actualizados los contenidos institucionales y las páginas informativas de la iglesia.", "Corrige información de una página pública cuando cambie."),
  item("Resumen financiero", "Ofrece una vista general de la información financiera registrada: ingresos, gastos y principales indicadores.", "Consulta el estado financiero antes de elaborar un informe.", "La información financiera debe manejarse con responsabilidad."),
  item("Ingresos", "Permite registrar y consultar las entradas de dinero vinculadas con la iglesia.", "Revisa registros de diezmos, ofrendas o donaciones, según las categorías disponibles.", "Confirma los montos y conceptos antes de guardar."),
  item("Gastos", "Permite registrar y consultar pagos y salidas de dinero de la organización.", "Registra un gasto relacionado con una actividad o necesidad de la iglesia.", "Revisa fechas, montos y documentos de respaldo antes de guardar."),
  item("Insumos básicos", "Organiza artículos de uso cotidiano, materiales y existencias necesarios para las actividades de la iglesia.", "Consulta cuántos insumos de una categoría están disponibles."),
  item("Inventario de Bienes", "Permite administrar los registros de los bienes de la iglesia, como equipos, mobiliario e instrumentos.", "Revisa la información de un equipo registrado."),
  item("Ver inventario", "Presenta la consulta del inventario registrado para conocer los bienes disponibles y sus características.", "Busca un bien por su información registrada."),
  item("Movimientos de bienes", "Permite consultar y administrar los movimientos asociados a los bienes registrados.", "Revisa la trazabilidad de un traslado o cambio de ubicación.", "Registra movimientos que correspondan a situaciones reales."),
  item("Gestión de usuarios", "Ayuda a consultar y administrar las cuentas de usuario de la plataforma, según las atribuciones de tu rol.", "Busca una cuenta para revisar su información y estado.", "Verifica la autorización antes de modificar cuentas ajenas."),
  item("Registrar usuario", "Es el acceso para registrar nuevas personas y crear sus cuentas de acceso mediante el formulario correspondiente.", "Utilízalo cuando debas incorporar a un nuevo usuario autorizado.", "Comprueba los datos y permisos asignados antes de completar el registro."),
  item("Historial de actividad", "Permite consultar acciones registradas en el sistema para facilitar el seguimiento y la auditoría.", "Revisa quién realizó una operación y cuándo, si esos datos están disponibles.", "Estos registros deben utilizarse de forma responsable."),
  item("Gestión de Martín", "Aquí puedes configurar y supervisar a Martín, el asistente virtual de Iglesia El Ancla, su base de conocimiento y sus medidas de protección.", "Revisa sus límites diarios o actualiza una respuesta institucional aprobada.", "Antes de cambiar la configuración, evalúa cómo afectará a los miembros."),
];

// Estas opciones no se muestran en el panel administrativo normal.
const SUPER_STEPS = [
  item("Administradores", "Consulta y administra las cuentas administrativas y sus atribuciones, de acuerdo con las funciones del sistema.", "Revisa las cuentas que tienen responsabilidades administrativas.", "Los accesos elevados requieren especial cuidado."),
  item("Roles y permisos", "Permite consultar y gestionar los niveles de acceso y los permisos asociados a cada rol.", "Comprueba qué acciones puede realizar cada categoría de usuario.", "Concede únicamente los permisos necesarios para cada responsabilidad."),
  item("Configuración", "Reúne ajustes generales y opciones sensibles de funcionamiento de la plataforma.", "Consulta una configuración antes de decidir si debe modificarse.", "Evita cambios sin revisar su impacto en la seguridad y operación."),
];

// Opciones de ayuda y acciones del pie del menú.
const END_STEPS = [
  { title: "Guía del panel", text: "Puedes volver a realizar este recorrido en cualquier momento desde la opción Guía del panel del menú lateral.", example: "Si olvidas para qué sirve una sección, reinicia la guía aquí.", action: "guide" },
  { title: "Ver sitio público", text: "Este enlace abre la página pública de Iglesia El Ancla en una pestaña nueva para que puedas consultar lo que ven los visitantes.", example: "Úsalo para revisar el contenido público de la iglesia.", action: "public" },
  { title: "Cerrar sesión", text: "Esta opción finaliza tu sesión de administrador y te devuelve a la página de acceso.", example: "Utilízala al terminar de trabajar, especialmente en computadores compartidos.", tip: "El tutorial no presionará este botón ni cerrará tu sesión.", action: "logout" },
  { title: "Notificaciones 🔔", text: "La campana de la parte superior permite consultar tus notificaciones. Al presionarla podrás revisar los avisos que el sistema tenga disponibles para tu cuenta.", example: "Cuando veas un aviso, abre la campana para conocer sus detalles.", selector: '[data-admin-tour="notifications"], [data-admin-tour-action="notifications"], .admin-header__notifications button, .admin-header__notification-button, button[aria-label*="notific" i], button[title*="notific" i]' },
  { title: "Lectura asistida 🔊", text: "El botón con forma de oreja activa las opciones de lectura asistida. Puedes escuchar textos al pasar el cursor o al navegar con el teclado, ajustar la velocidad de voz y pedir que Martín lea sus respuestas.", example: "Cuando termines esta guía, pulsa la oreja que aparece debajo de Martín y selecciona «Activar lectura».", tip: "La voz está apagada inicialmente. Puedes pausarla o detenerla en cualquier momento; evita usarla para información privada en lugares públicos.", selector: '[data-el-ancla-reader="launcher"]' },
  { title: "Conoce a Martín ⚓", text: "Martín es el asistente virtual de la iglesia. Desde su botón flotante puedes consultar información de la comunidad, leer versículos de la Biblia y, si tienes una sesión habilitada, hacer preguntas relacionadas con la fe.", example: "Pulsa «¿Te ayudo?» para abrirlo cuando termines el tutorial.", tip: "Martín complementa la atención de la comunidad, pero no reemplaza el acompañamiento de sus líderes.", selector: '.martin-widget__launcher, .martin-widget__minimized, .martin-widget__toggle, .martin-widget button[aria-label*="martín" i], [data-admin-tour="martin"]' },
  { title: "¡Terminaste el recorrido! 💙", text: "Ya conoces las opciones del menú, la campana de notificaciones y a Martín. Puedes comenzar a explorar el panel y trabajar con las herramientas que correspondan a tus permisos.", example: "Si quieres repetir este aprendizaje, encontrarás Guía del panel en la barra lateral.", target: ".admin-layout__content" },
];

// Conservamos una referencia al viewport sin depender de una altura fija.
function readViewport() {
  return { width: window.innerWidth, height: window.innerHeight };
}

// =========================================================
// POSICIONAMIENTO INTELIGENTE
// Calcula la ubicación con la altura REAL de la tarjeta.
// Prioriza posiciones que no oculten la herramienta señalada.
// =========================================================
function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getOverlapArea(first, second) {
  if (!second) return 0;

  // Calculamos cuántos píxeles coinciden horizontal y verticalmente.
  const width = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
  const height = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));

  return width * height;
}

function getTourPosition(target, viewport, dialogWidth, dialogHeight) {
  const margin = 16;
  const separation = 18;
  const maxLeft = Math.max(margin, viewport.width - dialogWidth - margin);
  const maxTop = Math.max(margin, viewport.height - dialogHeight - margin);

  // Si el objetivo no está visible, ubicamos la tarjeta en un lugar seguro.
  if (!target) {
    return { left: clamp(viewport.width - dialogWidth - 22, margin, maxLeft), top: maxTop };
  }

  const centerX = (target.left + target.right) / 2;
  const centerY = (target.top + target.bottom) / 2;

  // Probamos derecha, izquierda, arriba, abajo y esquinas de la ventana.
  const candidates = [
    { left: target.right + separation, top: centerY - dialogHeight / 2 },
    { left: target.left - dialogWidth - separation, top: centerY - dialogHeight / 2 },
    { left: centerX - dialogWidth / 2, top: target.top - dialogHeight - separation },
    { left: centerX - dialogWidth / 2, top: target.bottom + separation },
    { left: margin, top: margin },
    { left: maxLeft, top: margin },
    { left: margin, top: maxTop },
    { left: maxLeft, top: maxTop },
  ];

  let best = null;

  for (const [position, candidate] of candidates.entries()) {
    // Evitamos posiciones por fuera de la pantalla.
    const left = clamp(candidate.left, margin, maxLeft);
    const top = clamp(candidate.top, margin, maxTop);
    const box = {
      left,
      top,
      right: left + dialogWidth,
      bottom: top + dialogHeight,
    };

    // Penalización fuerte si la tarjeta cubre la sección destacada.
    const overlap = getOverlapArea(box, target);

    // Si hay una posición libre, preferimos la más cercana al objetivo.
    const boxCenterX = left + dialogWidth / 2;
    const boxCenterY = top + dialogHeight / 2;
    const distance = Math.hypot(boxCenterX - centerX, boxCenterY - centerY);
    const score = overlap * 1000 + distance + position * 0.01;

    if (!best || score < best.score) {
      best = { left, top, score };
    }
  }

  return { left: best.left, top: best.top };
}

function AdminTour({ basePath, requestId, openSidebar, closeSidebar }) {
  const navigate = useNavigate();
  const isSuper = basePath === "/super-admin";
  const storageKey = `${STORAGE_PREFIX}${isSuper ? "super-admin" : "admin"}`;

  const steps = useMemo(
    () => [...COMMON_STEPS, ...(isSuper ? SUPER_STEPS : []), ...END_STEPS],
    [isSuper]
  );

  // El tutorial es voluntario; una vez saltado o terminado no reaparece solo.
  const [active, setActive] = useState(() => {
    try { return !window.localStorage.getItem(storageKey); }
    catch { return true; }
  });
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [viewport, setViewport] = useState(readViewport);
  const dialogRef = useRef(null);
  // Se mide la tarjeta para no suponer alturas fijas (antes se tapaba a Martín).
  const [dialogHeight, setDialogHeight] = useState(420);
  const firstRequestRef = useRef(requestId);
  const step = steps[Math.min(index, steps.length - 1)];

  // Indica al lector si el recorrido está activo para evitar
  // que su botón cubra los enlaces y textos destacados.
  useEffect(() => {
    if (!active) return undefined;
    document.body.dataset.elAnclaTour =
      step.selector?.includes('data-el-ancla-reader') ? "reader" : "other";
    return () => { delete document.body.dataset.elAnclaTour; };
  }, [active, step]);

  // Reinicia el tutorial cuando se pulsa «Guía del panel».
  useEffect(() => {
    if (requestId === firstRequestRef.current) return;
    firstRequestRef.current = requestId;
    setIndex(0);
    setActive(true);
    navigate(basePath);
  }, [requestId, basePath, navigate]);

  // Guarda estados diferentes para admin y superadmin.
  useEffect(() => {
    try { setActive(!window.localStorage.getItem(storageKey)); }
    catch { setActive(true); }
    setIndex(0);
  }, [storageKey]);

  // Mide la altura real después de mostrar cada etapa y cuando cambia
  // el tamaño de la tarjeta (ejemplo: textos largos o pantallas pequeñas).
  useLayoutEffect(() => {
    if (!active || !dialogRef.current) return undefined;

    const dialog = dialogRef.current;
    const updateHeight = () => {
      const height = dialog.getBoundingClientRect().height;
      if (height > 0) {
        setDialogHeight((previous) => Math.abs(previous - height) > 1 ? height : previous);
      }
    };

    updateHeight();

    // ResizeObserver evita calcular posiciones basadas en una altura inventada.
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(updateHeight);
    observer.observe(dialog);
    return () => observer.disconnect();
  }, [active, index]);

  // Busca el enlace exacto; no se activan enlaces durante el tutorial.
  const findTarget = useCallback(() => {
    if (step.item) {
      return Array.from(document.querySelectorAll("[data-admin-tour-item]"))
        .find((node) => node.getAttribute("data-admin-tour-item") === step.item) || null;
    }
    if (step.action) {
      return document.querySelector(`[data-admin-tour-action="${step.action}"]`);
    }
    return document.querySelector(step.selector || step.target || "#no-tour-target");
  }, [step]);

  // Limita el resaltado a la zona visible, evitando cuadros fuera de pantalla.
  const updatePosition = useCallback(() => {
    const el = findTarget();
    const vp = readViewport();
    setViewport(vp);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    const top = Math.max(0, r.top);
    const left = Math.max(0, r.left);
    const right = Math.min(vp.width, r.right);
    const bottom = Math.min(vp.height, r.bottom);
    setRect(right > left && bottom > top ? {
      top, left, right, bottom, width: right - left, height: bottom - top,
    } : null);
  }, [findTarget]);

  useEffect(() => {
    if (!active) return undefined;
    const el = findTarget();
    // En móviles, mostramos las opciones que pertenecen al menú.
    const isSidebarStep = Boolean(step.item || step.action || step.target === ".admin-sidebar__navigation");
    if (isSidebarStep && window.innerWidth <= 850) openSidebar();
    else closeSidebar();
    // Desplazamos el menú lateral hacia el elemento mostrado.
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    updatePosition();
    const refresh = () => updatePosition();
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);
    const animation = window.requestAnimationFrame(refresh);
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
      window.cancelAnimationFrame(animation);
    };
  }, [active, step, findTarget, updatePosition, openSidebar, closeSidebar]);

  const finish = useCallback(() => {
    try { window.localStorage.setItem(storageKey, "completed"); }
    catch { /* El tutorial puede cerrarse sin almacenamiento. */ }
    setActive(false);
    setIndex(0);
    closeSidebar();
  }, [storageKey, closeSidebar]);

  useEffect(() => {
    if (!active) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") finish();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [active, finish]);

  if (!active) return null;
  // Calcula el ancho real de la tarjeta según el espacio disponible.
  const panelWidth = Math.min(390, Math.max(0, viewport.width - 32));

  // Nunca usar una altura estimada: se actualiza con ResizeObserver.
  const safeHeight = Math.min(dialogHeight, Math.max(0, viewport.height - 32));

  // Colocamos la tarjeta junto a su objetivo, sin taparlo cuando hay espacio.
  // Esto también se aplica en móvil, donde se intentan las posiciones posibles.
  const position = getTourPosition(rect, viewport, panelWidth, safeHeight);

  const panelStyle = {
    left: position.left,
    top: position.top,
    width: panelWidth,
  };

  return (
    <div className="admin-tour" aria-label="Recorrido guiado del panel administrativo">
      {/* Atenuamos el fondo y destacamos únicamente la opción explicada. */}
      {rect ? (
        <div className="admin-tour__spotlight" aria-hidden="true" style={{
          top: Math.max(0, rect.top - 4),
          left: Math.max(0, rect.left - 4),
          width: Math.min(viewport.width - Math.max(0, rect.left - 4), rect.width + 8),
          height: Math.min(viewport.height - Math.max(0, rect.top - 4), rect.height + 8),
        }} />
      ) : <div className="admin-tour__shade" aria-hidden="true" />}

      <div className="admin-tour__dialog" role="dialog" aria-modal="true" aria-labelledby="admin-tour-title" tabIndex={-1} ref={dialogRef} style={panelStyle}>
        <div className="admin-tour__header">
          <span className="admin-tour__eyebrow"><GraduationCap size={17} /> Tutorial del panel</span>
          <button type="button" className="admin-tour__close" aria-label="Saltar tutorial" onClick={finish}><X size={19} /></button>
        </div>
        <div className="admin-tour__progress" aria-label={`Paso ${index + 1} de ${steps.length}`}>
          <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
        {/* key reinicia el scroll de la explicación en cada nuevo paso. */}
        <div className="admin-tour__body" key={index}>
          <span className="admin-tour__counter">Paso {index + 1} de {steps.length}</span>
          <h2 id="admin-tour-title">{step.title}</h2>
          <p>{step.text}</p>
          {step.example && <div className="admin-tour__example"><strong>💡 Ejemplo práctico</strong><p>{step.example}</p></div>}
          {step.tip && <div className="admin-tour__tip"><strong>✓ Consejo importante</strong><p>{step.tip}</p></div>}
        </div>
        <div className="admin-tour__actions">
          <button type="button" className="admin-tour__skip" onClick={finish}>Saltar tutorial</button>
          <div className="admin-tour__arrows">
            {index > 0 && <button type="button" className="admin-tour__back" onClick={() => setIndex((i) => Math.max(0, i - 1))}><ArrowLeft size={16} /> Anterior</button>}
            <button type="button" className="admin-tour__next" onClick={() => index === steps.length - 1 ? finish() : setIndex((i) => i + 1)}>
              {index === steps.length - 1 ? <>Finalizar <Check size={16}/></> : <>Siguiente <ArrowRight size={16}/></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTour;
