// =========================================================
// GUÍA INTERACTIVA DEL ESPACIO DE MIEMBROS — EL ANCLA ⚓
// Explica funciones existentes, sin navegar ni ejecutar acciones.
// =========================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, GraduationCap, X } from "lucide-react";
import "../../../styles/components/member/layout/MemberTour.css";

// Guardamos únicamente si la persona completó u omitió la guía.
const STORAGE_KEY = "el-ancla:member-tour:v1";

// Utilidad: cada opción del menú personal tiene su propia explicación.
const personal = (title, text, example, tip) => ({
  title, text, example, tip, personalItem: title,
  selector: `[data-member-tour="personal-${title}"]`,
});

// Estas opciones existen en MemberHeader.jsx, para los tres roles.
const STEPS = [
  {
    title: "¡Bienvenido a tu espacio! ⚓",
    text: "Esta es tu zona personal de Iglesia El Ancla. Aquí puedes participar en la comunidad, consultar información y acceder a recursos para crecer en la fe.",
    example: "Te mostraremos dónde encontrar cada herramienta sin modificar ningún dato.",
    selector: ".member-hero",
  },
  {
    title: "El logo de El Ancla",
    text: "En la parte superior encontrarás nuestro logo. Presiónalo cuando quieras regresar al inicio de tu espacio personal.",
    selector: '[data-member-tour="brand"]',
  },
  {
    title: "La navegación principal",
    text: "Esta barra permite visitar las páginas públicas de la iglesia. Puedes hacerlo sin salir definitivamente de tu cuenta.",
    example: "Desde aquí encontrarás información general de nuestra comunidad.",
    selector: ".member-header__navigation",
  },
  {
    title: "Inicio",
    text: "Te lleva a la página principal pública de la iglesia, donde encontrarás una presentación general de nuestra comunidad.",
    selector: '[data-member-tour="public-Inicio"]',
  },
  {
    title: "Nosotros",
    text: "Permite conocer a Iglesia El Ancla, nuestra identidad y la información que compartimos con quienes desean acercarse a la comunidad.",
    selector: '[data-member-tour="public-Nosotros"]',
  },
  {
    title: "Eventos",
    text: "Consulta la información de los encuentros y eventos anunciados por la iglesia.",
    tip: "Revisa la fecha y el horario antes de asistir.",
    selector: '[data-member-tour="public-Eventos"]',
  },
  {
    title: "Donaciones",
    text: "Conoce las alternativas para realizar aportes voluntarios a la comunidad desde la página de donaciones.",
    tip: "Los aportes son voluntarios. Comprueba siempre los datos antes de continuar una operación.",
    selector: '[data-member-tour="public-Donaciones"]',
  },
  {
    title: "Contacto",
    text: "Encuentra las vías para escribir a la iglesia, realizar consultas o solicitar orientación.",
    selector: '[data-member-tour="public-Contacto"]',
  },
  {
    title: "El menú Mi espacio",
    text: "Este botón despliega las herramientas disponibles para tu cuenta. Las visitaremos una por una para que sepas dónde encontrar cada función.",
    example: "Después del tutorial podrás abrirlo presionando «Mi espacio».",
    personalItem: "__menu__",
    selector: '[data-member-tour="personal-toggle"]',
  },
  personal("Panel personal", "Regresa a esta portada privada. Aquí verás un resumen de tu participación, enlaces útiles y datos de tu perfil.", "Úsalo cuando quieras orientarte o volver al inicio de tu espacio."),
  personal("Mis actividades", "Revisa las actividades de la iglesia y la información de tu participación o confirmaciones, cuando corresponda.", "Consulta los próximos encuentros en que quieras participar."),
  personal("Mis turnos de servicio", "Consulta los turnos de voluntariado que te hayan asignado y las confirmaciones asociadas a tu servicio.", "Comprueba la fecha de tu próximo turno antes de acudir.", "Si no puedes asistir a un turno, contacta oportunamente a su responsable."),
  personal("Mis recursos", "Accede a materiales para estudiar, aprender y fortalecer tu vida espiritual, incluidas las secciones de recursos bíblicos.", "Explora las guías, estudios y materiales disponibles."),
  personal("Mis recomendados", "Consulta recomendaciones de materiales y contenidos compartidos por la comunidad.", "Descubre lecturas, música u otros recursos sugeridos."),
  personal("Insumos básicos", "Conoce las necesidades de artículos y materiales de uso cotidiano que tiene la iglesia y cómo puedes colaborar.", "Consulta qué insumos hacen falta antes de ofrecer ayuda."),
  personal("Mis peticiones de oración", "Comparte tus propias peticiones de oración y revisa la información y seguimiento de las solicitudes que hayas enviado.", "Puedes escribir una petición cuando necesites apoyo en oración.", "Evita incluir información sensible de otras personas sin su autorización."),
  personal("Mis donaciones", "Consulta la información de los aportes asociados a tu cuenta que estén disponibles en la plataforma.", "Revisa los registros y estados de tus donaciones."),
  personal("Resumen financiero", "Consulta el resumen financiero que la iglesia pone a disposición de los miembros según sus permisos.", "Revisa los datos generales disponibles sin acceder a operaciones administrativas privadas."),
  personal("Mi cuenta", "Accede a tu información personal y a las opciones disponibles para gestionar tu cuenta y su seguridad.", "Verifica tus datos de contacto si cambian.", "Nunca compartas tu contraseña ni códigos de seguridad."),
  {
    title: "Guía de mi espacio",
    text: "Puedes iniciar nuevamente este recorrido desde la opción «Guía de mi espacio» en el mismo menú, incluso si hoy eliges saltarlo.",
    personalItem: "__guide__",
    selector: '[data-member-tour="guide"]',
  },
  {
    title: "Tu campana de notificaciones 🔔",
    text: "Presiona esta campana para revisar avisos relacionados con tus turnos de servicio y necesidades de insumos de la iglesia. Si aparece un número, tienes avisos disponibles.",
    example: "Al terminar el tutorial, abre la campana para consultar tus avisos.",
    selector: '[data-member-tour="notifications"]',
  },
  {
    title: "Tu nombre y tu cuenta",
    text: "Aquí se muestra el nombre de la persona que inició sesión. Te permite reconocer en qué cuenta estás trabajando.",
    selector: '[data-member-tour="account"]',
  },
  {
    title: "Cerrar sesión con seguridad",
    text: "Usa este botón cuando termines de utilizar tu cuenta, especialmente si compartes un computador o dispositivo.",
    tip: "Durante el tutorial no presionaremos este botón ni cerraremos tu sesión.",
    selector: '[data-member-tour="logout"]',
  },
  {
    title: "Tu próximo compromiso",
    text: "Esta tarjeta te recuerda tus próximos turnos o compromisos de servicio, si tienes alguno asignado.",
    example: "Puedes seguir el acceso «Ver mis turnos» para revisar detalles después del recorrido.",
    selector: ".member-volunteer-notice, .member-volunteer-notice__card, .member-volunteer-notice-card, .member-dashboard__volunteer, .member-hero + *",
  },
  {
    title: "Participa en nuestra comunidad",
    text: "Aquí encontrarás accesos a tus peticiones de oración y actividades. Son formas de mantenerte conectado y participar con otras personas.",
    selector: "#participacion",
  },
  {
    title: "Actividades de la semana",
    text: "Esta sección presenta los horarios habituales de reuniones y encuentros de Iglesia El Ancla.",
    tip: "Para información de una actividad específica, revisa su página correspondiente.",
    selector: "#actividades",
  },
  {
    title: "Recursos para acompañarte",
    text: "Desde estas tarjetas puedes explorar guías de oración, estudios bíblicos y otros recursos para tu crecimiento espiritual.",
    example: "Selecciona «Explorar» cuando quieras visitar un recurso.",
    selector: "#recursos-miembro",
  },
  {
    title: "Tu perfil personal",
    text: "En esta tarjeta puedes consultar los datos básicos de tu perfil, como tu nombre, correo y sucursal principal, cuando estén registrados.",
    tip: "Protege la información de tu cuenta, especialmente en equipos compartidos.",
    selector: "#mi-perfil",
  },
  {
    title: "¿Necesitas conversar?",
    text: "Esta tarjeta te dirige a los canales de contacto de nuestra comunidad para plantear dudas o solicitar orientación.",
    selector: ".member-community",
  },
  {
    title: "Lectura asistida 🔊",
    text: "Este botón con una oreja abre las opciones de lectura asistida. Si la activas podrás escuchar textos de la página al pasar el cursor o utilizar Tab, cambiar la velocidad y escuchar las respuestas de Martín.",
    example: "Al finalizar la guía pulsa la oreja ubicada debajo de Martín y elige «Activar lectura».",
    tip: "La lectura se enciende únicamente cuando tú lo decides; puedes detenerla cuando quieras.",
    selector: '[data-el-ancla-reader="launcher"]',
  },
  {
    title: "Nuestro amigo Martín ⚓",
    text: "Martín es el asistente virtual de El Ancla. Desde «¿Te ayudo?» puedes conocer la iglesia, consultar versículos de la Biblia y realizar preguntas relacionadas con la fe dentro de los límites disponibles para tu cuenta.",
    example: "Presiona «¿Te ayudo?» para conversar con Martín cuando finalices la guía.",
    tip: "Martín acompaña y orienta, pero no reemplaza la atención personal de los líderes.",
    selector: '.martin-widget__launcher, .martin-widget__minimized, .martin-widget__toggle, [data-admin-tour="martin"]',
  },
  {
    title: "¡Ya conoces tu espacio! 💙",
    text: "Ahora puedes explorar las herramientas de la iglesia a tu propio ritmo. Si alguna vez necesitas recordar cómo funciona tu espacio, abre «Guía de mi espacio» desde el menú personal.",
    example: "Elige Finalizar para comenzar a utilizar tu espacio.",
    selector: ".member-hero",
  },
];

// Pasos adicionales exclusivos de cuentas administrativas.
const ADMIN_STEP = {
  title: "Volver al panel administrativo",
  text: "Si también administras la iglesia, este botón te permite regresar a tu panel de administración. No aparece en las cuentas de miembros sin ese rol.",
  example: "Presiónalo cuando quieras continuar con las tareas administrativas.",
  selector: '[data-member-tour="admin-return"]',
};

// Extraemos dimensiones sin acceder a información personal.
const readViewport = () => ({ width: window.innerWidth, height: window.innerHeight });
const limit = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function MemberTour({ requestId, tourItemChange, hasAdminPanel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const steps = useMemo(() => {
    // Insertamos el paso opcional antes del cierre de sesión.
    const all = [...STEPS];
    if (hasAdminPanel) {
      const index = all.findIndex((step) => step.selector === '[data-member-tour="logout"]');
      all.splice(index, 0, ADMIN_STEP);
    }
    return all;
  }, [hasAdminPanel]);

  const [active, setActive] = useState(() => {
    try { return !window.localStorage.getItem(STORAGE_KEY); }
    catch { return true; }
  });
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [viewport, setViewport] = useState(readViewport);
  const [dialogSize, setDialogSize] = useState({ width: 390, height: 330 });
  const dialogRef = useRef(null);
  const seenRequestRef = useRef(requestId);
  const step = steps[Math.min(index, steps.length - 1)];

  // Abrir manualmente «Guía de mi espacio» reinicia desde el paso inicial.
  useEffect(() => {
    if (seenRequestRef.current === requestId) return;
    seenRequestRef.current = requestId;
    setIndex(0);
    setActive(true);
    navigate("/member");
  }, [requestId, navigate]);

  // La portada es el contexto estable de los pasos de contenido.
  useEffect(() => {
    if (active && location.pathname !== "/member") navigate("/member", { replace: true });
  }, [active, location.pathname, navigate]);

  const finish = useCallback(() => {
    try { window.localStorage.setItem(STORAGE_KEY, "completed"); }
    catch { /* Permite finalizar aunque el navegador bloquee el almacenamiento. */ }
    setActive(false);
    setIndex(0);
    setRect(null);
    tourItemChange(null);
  }, [tourItemChange]);

  // Indica al lector si el recorrido está activo para evitar
  // que su botón cubra los enlaces y textos destacados.
  useEffect(() => {
    if (!active) return undefined;
    document.body.dataset.elAnclaTour =
      step.selector?.includes('data-el-ancla-reader') ? "reader" : "other";
    return () => { delete document.body.dataset.elAnclaTour; };
  }, [active, step]);

  // Escape es una salida accesible del recorrido.
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => { if (event.key === "Escape") finish(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, finish]);

  // Mide el elemento que recibe el foco visual.
  const refreshTarget = useCallback(() => {
    const vp = readViewport();
    setViewport((old) => old.width === vp.width && old.height === vp.height ? old : vp);
    const element = document.querySelector(step.selector);
    if (!element) { setRect(null); return; }
    const r = element.getBoundingClientRect();
    const left = limit(r.left, 0, vp.width);
    const right = limit(r.right, 0, vp.width);
    const top = limit(r.top, 0, vp.height);
    const bottom = limit(r.bottom, 0, vp.height);
    if (right <= left || bottom <= top) { setRect(null); return; }
    setRect((old) => old && Math.abs(old.left-left)<1 && Math.abs(old.top-top)<1 && Math.abs(old.right-right)<1 && Math.abs(old.bottom-bottom)<1
      ? old : { left, top, right, bottom, width: right-left, height: bottom-top });
  }, [step]);

  // Despliega el menú personal mientras se destacan sus enlaces.
  useEffect(() => {
    if (!active) { tourItemChange(null); return undefined; }
    tourItemChange(step.personalItem || null);
    // Dejamos que React monte el menú desplegable antes de buscar el enlace.
    const delay = window.setTimeout(() => {
      const target = document.querySelector(step.selector);
      // No se pulsa: únicamente se desplaza para hacerlo visible.
      target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      refreshTarget();
    }, 80);
    const refresh = () => refreshTarget();
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);
    const settle = window.setTimeout(refresh, 420);
    dialogRef.current?.focus();
    return () => {
      window.clearTimeout(delay);
      window.clearTimeout(settle);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    };
  }, [active, step, tourItemChange, refreshTarget]);

  // Observamos el tamaño verdadero de la tarjeta tras cada paso.
  useEffect(() => {
    if (!active || !dialogRef.current) return undefined;
    const element = dialogRef.current;
    const measure = () => {
      const size = element.getBoundingClientRect();
      setDialogSize((old) => Math.abs(old.width - size.width) < 1 && Math.abs(old.height - size.height) < 1
        ? old : { width: size.width, height: size.height });
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [active, index]);

  if (!active) return null;

  // Elegimos una ubicación sin superposición, considerando la altura real.
  const margin = 14;
  const width = Math.min(390, viewport.width - margin * 2);
  const height = Math.min(dialogSize.height, viewport.height - margin * 2);
  const maxLeft = Math.max(margin, viewport.width - width - margin);
  const maxTop = Math.max(margin, viewport.height - height - margin);
  const position = (left, top) => ({ left: limit(left, margin, maxLeft), top: limit(top, margin, maxTop), width });
  const candidates = rect ? [
    position(rect.left - width - 18, rect.top),
    position(rect.right + 18, rect.top),
    position(rect.left, rect.bottom + 18),
    position(rect.left, rect.top - height - 18),
    position(viewport.width - width - margin, margin),
    position(margin, margin),
  ] : [position(viewport.width - width - margin, margin)];
  const overlap = (candidate) => {
    if (!rect) return 0;
    const x = Math.max(0, Math.min(candidate.left + width, rect.right + 8) - Math.max(candidate.left, rect.left - 8));
    const y = Math.max(0, Math.min(candidate.top + height, rect.bottom + 8) - Math.max(candidate.top, rect.top - 8));
    return x * y;
  };
  const panelStyle = candidates.reduce((best, current) => overlap(current) < overlap(best) ? current : best, candidates[0]);

  return (
    <div className="member-tour" aria-label="Guía interactiva del área de miembros">
      {/* Bloquea clics sobre el fondo sin ejecutar acciones del sistema. */}
      <div className={`member-tour__shade${rect ? "" : " member-tour__shade--filled"}`} aria-hidden="true" />
      {rect && (
        <div className="member-tour__spotlight" aria-hidden="true" style={{
          top: rect.top, left: rect.left, width: rect.width, height: rect.height,
        }} />
      )}
      <div className="member-tour__dialog" ref={dialogRef} role="dialog" aria-modal="true"
        aria-labelledby="member-tour-title" tabIndex={-1} style={panelStyle}>
        <header className="member-tour__header">
          <span className="member-tour__eyebrow"><GraduationCap size={17} /> Guía de mi espacio</span>
          <button type="button" className="member-tour__close" aria-label="Saltar tutorial" onClick={finish}><X size={19}/></button>
        </header>
        <div className="member-tour__progress" aria-label={`Paso ${index+1} de ${steps.length}`}>
          <span style={{ width: `${(index+1)/steps.length*100}%` }} />
        </div>
        {/* key reinicia el desplazamiento de la explicación en cada paso. */}
        <section className="member-tour__body" key={index}>
          <span className="member-tour__counter">Paso {index+1} de {steps.length}</span>
          <h2 id="member-tour-title">{step.title}</h2>
          <p>{step.text}</p>
          {step.example && <div className="member-tour__example"><strong>💡 Ejemplo práctico</strong><p>{step.example}</p></div>}
          {step.tip && <div className="member-tour__tip"><strong>✓ Consejo importante</strong><p>{step.tip}</p></div>}
        </section>
        <footer className="member-tour__actions">
          <button type="button" className="member-tour__skip" onClick={finish}>Saltar tutorial</button>
          <div className="member-tour__arrows">
            {index > 0 && <button type="button" className="member-tour__back" onClick={() => setIndex((i) => Math.max(0, i-1))}><ArrowLeft size={16}/> Anterior</button>}
            <button type="button" className="member-tour__next" onClick={() => index === steps.length-1 ? finish() : setIndex((i) => i+1)}>
              {index === steps.length-1 ? <>Finalizar <Check size={16}/></> : <>Siguiente <ArrowRight size={16}/></>}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default MemberTour;
