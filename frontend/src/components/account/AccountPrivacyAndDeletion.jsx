// =========================================================
// PRIVACIDAD Y ELIMINACIÓN DE CUENTA · IGLESIA EL ANCLA
// Versión compacta y accesible para /member/mi-cuenta.
// =========================================================

// Los hooks administran el desplegable, las confirmaciones y el estado de la solicitud.
import { useCallback, useEffect, useRef, useState } from "react";

// Reutilizamos los iconos instalados y la identidad visual de la plataforma.
import {
  BookOpen, CheckCircle2, ChevronDown, ChevronUp,
  LockKeyhole, ShieldCheck, Trash2, UserRoundCheck, X,
} from "lucide-react";

// La API ya incorpora las cookies de autenticación de forma centralizada.
import api from "../../services/api";

// Limpiamos el historial local temporal del asistente si se elimina la cuenta.
import { clearMartinChat } from "../../utils/martinChatSession";

// Separamos los estilos del resto de las páginas del proyecto.
import "../../styles/components/account/AccountPrivacyAndDeletion.css";

// El servidor también valida esta frase, exactamente igual que la interfaz.
const CONFIRMATION_PHRASE = "quiero eliminar mi cuenta";

// Referencia pública al texto oficial publicado por la BCN.
const LAW_URL = "https://www.bcn.cl/leychile/navegar?idNorma=1209272";

// Explicamos los derechos con palabras sencillas y sin prometer excepciones inexistentes.
const dataRights = [
  ["Acceso", "Saber qué datos tuyos utiliza la iglesia."],
  ["Rectificación", "Solicitar la corrección de información incorrecta."],
  ["Supresión", "Solicitar la eliminación de tus datos cuando corresponda."],
  ["Oposición", "Oponerte a ciertos usos de tus datos."],
  ["Portabilidad", "Solicitar tus datos en un formato reutilizable cuando corresponda."],
  ["Bloqueo", "Pedir la suspensión temporal de determinados tratamientos."],
  ["Decisiones automatizadas", "Solicitar información y revisión de ciertas decisiones automáticas."],
];

// Mostramos el control de privacidad a todos los roles y el borrado directo a miembros.
function AccountPrivacyAndDeletion({ role }) {
  // Mantenemos cerrada inicialmente la explicación extensa para reducir altura.
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Paso 0: sin diálogo; 1: primera confirmación; 2: confirmación final.
  const [deleteStep, setDeleteStep] = useState(0);

  // Estos valores se utilizan exclusivamente durante la solicitud de eliminación.
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Guardamos la referencia del título para enfocar el diálogo al abrirlo.
  const dialogTitleRef = useRef(null);

  // El cierre limpia las credenciales y evita cancelar una solicitud ya enviada.
  const closeDialog = useCallback(() => {
    if (deleting) return;
    setDeleteStep(0);
    setConfirmation("");
    setPassword("");
    setUnderstood(false);
    setDeleteError("");
  }, [deleting]);

  // Movemos el foco al título al cambiar de paso para facilitar la navegación.
  useEffect(() => {
    if (deleteStep > 0) dialogTitleRef.current?.focus();
  }, [deleteStep]);

  // Escape cierra el diálogo, salvo cuando se está procesando la petición.
  useEffect(() => {
    if (deleteStep === 0 || deleting) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteStep, deleting, closeDialog]);

  // Abrimos la primera confirmación sin realizar ninguna operación en MongoDB.
  function openDialog() {
    setDeleteError("");
    setDeleteStep(1);
  }

  // Avanzamos a la segunda confirmación sin borrar todavía ningún dato.
  function continueDeletion() {
    setDeleteError("");
    setDeleteStep(2);
  }

  // La validación del navegador mejora UX; la autorización definitiva ocurre en Express.
  const canConfirmDeletion = understood &&
    confirmation === CONFIRMATION_PHRASE &&
    password.length > 0 && !deleting;

  // El borrado directo está reservado para el rol member validado por el backend.
  const canSelfDelete = role === "member";

  // Solicitamos la eliminación solo tras completar las dos confirmaciones.
  async function handleDeleteAccount(event) {
    event.preventDefault();
    if (!canConfirmDeletion) return;
    setDeleting(true);
    setDeleteError("");

    try {
      // Jamás enviamos un userId desde el navegador: la cookie identifica al titular.
      const response = await api.post("/users/me/delete-account", {
        confirmation,
        password,
      });

      // No indicamos éxito si el backend no confirmó la eliminación.
      if (response.data?.success !== true) {
        throw new Error("El servidor no confirmó la eliminación de la cuenta.");
      }

      // Limpiamos mensajes locales y reiniciamos el estado de sesión de React.
      clearMartinChat();
      window.location.replace("/");
    } catch (error) {
      // Si ocurre un problema, la cuenta permanece y el usuario puede reintentarlo.
      setDeleteError(
        error?.response?.data?.message ||
        "No pudimos completar la solicitud. Tu cuenta sigue activa; puedes intentarlo nuevamente."
      );
      setPassword("");
      setDeleting(false);
    }
  }

  return (
    <div className="account-privacy" aria-label="Privacidad y control de tus datos">
      {/* Tarjeta 1: resumen breve y enlace a la explicación detallada. */}
      <section className="account-privacy__card" aria-labelledby="privacy-heading">
        <header className="account-privacy__header">
          <span className="account-privacy__icon" aria-hidden="true"><ShieldCheck size={19} /></span>
          <div>
            <h2 id="privacy-heading">Tus datos, tu tranquilidad</h2>
            <p>Tu información se utiliza para acompañar tu participación en la comunidad.</p>
          </div>
        </header>

        <p className="account-privacy__body">
          Usamos los datos de tu cuenta para el acceso, las actividades y las comunicaciones de
          Iglesia El Ancla. No vendemos tus datos ni los usamos para publicidad comercial.
        </p>

        <div className="account-privacy__pill-row" aria-label="Opciones de tu cuenta">
          <span><LockKeyhole size={14} aria-hidden="true" /> Acceso protegido</span>
          <span><UserRoundCheck size={14} aria-hidden="true" /> Datos editables</span>
        </div>

        {/* La ley aparece como una fila compacta, no como una tarjeta dentro de otra. */}
        <div className="account-privacy__law-summary">
          <span className="account-privacy__law-title"><BookOpen size={17} aria-hidden="true" /> Ley N.º 21.719</span>
          <button
            type="button"
            className="account-privacy__text-button"
            onClick={() => setDetailsOpen((open) => !open)}
            aria-controls="account-privacy-details"
            aria-expanded={detailsOpen}
          >
            {detailsOpen ? "Ver menos" : "Conoce tus derechos"}
            {detailsOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </button>
        </div>

        {/* Solo ocupamos espacio adicional cuando el usuario solicita leer más. */}
        {detailsOpen && (
          <div id="account-privacy-details" className="account-privacy__expanded">
            <h3>¿Qué información podemos utilizar?</h3>
            <p>
              Dependiendo de los servicios que uses: nombre, correo, teléfono, cumpleaños,
              confirmaciones de actividades, participación voluntaria, notificaciones,
              peticiones de oración y datos vinculados con tus aportes.
            </p>

            <h3>¿Quién puede acceder?</h3>
            <p>
              El acceso se organiza por permisos. Las peticiones privadas y los datos sensibles
              necesitan protección especial. Algunos proveedores tecnológicos procesan
              información indispensable para prestar los servicios que utilices.
            </p>

            <h3>¿Cuáles son tus derechos?</h3>
            <ul className="account-privacy__rights">
              {dataRights.map(([title, description]) => (
                <li key={title}>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  <span><strong>{title}:</strong> {description}</span>
                </li>
              ))}
            </ul>

            <h3>¿Qué ocurre si eliminas tu cuenta?</h3>
            <p>
              Se retiran tu perfil y los datos asociados a tu participación, como tus peticiones
              de oración y confirmaciones. Los registros de pagos se gestionan por separado:
              quitamos la vinculación con tu cuenta y conservamos únicamente la información
              necesaria para verificar la operación y cumplir las obligaciones aplicables.
              También debemos aplicar nuestros procedimientos de eliminación a respaldos y
              servicios externos, según sus plazos de conservación.
            </p>

            <h3>¿Cómo solicitar más información?</h3>
            <p>
              Puedes modificar tus datos desde esta página. Si necesitas ejercer otro derecho,
              puedes comunicarte con la iglesia mediante sus canales oficiales.
            </p>
            <div className="account-privacy__links">
              <a href="/politica-de-privacidad">Política de privacidad</a>
              <a href="/contacto">Contacto</a>
              <a href={LAW_URL} target="_blank" rel="noopener noreferrer">Leer la ley oficial</a>
            </div>
            <p className="account-privacy__note">
              La Ley N.º 21.719 incorpora estas disposiciones desde el 1 de diciembre de 2026.
              Los derechos se ejercen de acuerdo con los requisitos de la normativa.
            </p>
          </div>
        )}
      </section>

      {/* Tarjeta 2: control visible, amable y sencillo para retirar la cuenta. */}
      <section className="account-privacy__card account-privacy__card--delete" aria-labelledby="delete-account-heading">
        <header className="account-privacy__header">
          <span className="account-privacy__icon account-privacy__icon--delete" aria-hidden="true"><Trash2 size={19} /></span>
          <div>
            <h2 id="delete-account-heading">Control de tu cuenta</h2>
            <p>Tu participación en la plataforma es voluntaria.</p>
          </div>
        </header>
        <p className="account-privacy__body">
          Si algún día deseas dejar de usarla, puedes eliminar tu cuenta y los datos
          personales vinculados a tu participación. Te pediremos confirmarlo dos veces.
        </p>
        {canSelfDelete ? (
          <button type="button" className="account-privacy__delete-open" onClick={openDialog}>
            <Trash2 size={16} aria-hidden="true" /> Eliminar mi cuenta
          </button>
        ) : (
          <p className="account-privacy__admin-help">
            Si administras la plataforma, podemos ayudarte a cerrar tu cuenta
            de forma segura para la comunidad. Contáctanos.
          </p>
        )}
      </section>

      {/* El diálogo solo se monta mientras exista un proceso de confirmación abierto. */}
      {deleteStep > 0 && (
        <div
          className="account-privacy__overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            className="account-privacy__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-delete-dialog-title"
            aria-describedby="account-delete-dialog-desc"
          >
            <div className="account-privacy__dialog-top">
              <span className="account-privacy__dialog-icon" aria-hidden="true"><LockKeyhole size={20} /></span>
              <button type="button" className="account-privacy__close" onClick={closeDialog}
                disabled={deleting} aria-label="Cerrar confirmación"><X size={19} /></button>
            </div>

            <p className="account-privacy__step">Confirmación {deleteStep} de 2</p>
            {deleteStep === 1 ? (
              <>
                <h2 id="account-delete-dialog-title" tabIndex="-1" ref={dialogTitleRef}>
                  ¿Deseas cerrar tu cuenta?
                </h2>
                <p id="account-delete-dialog-desc">
                  Eliminaremos tu perfil y tus participaciones personales en la plataforma.
                  Después no podrás volver a entrar con esta cuenta ni recuperar sus contenidos.
                </p>
                <div className="account-privacy__dialog-actions">
                  <button type="button" className="account-privacy__cancel" onClick={closeDialog}>
                    Mantener mi cuenta
                  </button>
                  <button type="button" className="account-privacy__continue" onClick={continueDeletion}>
                    Sí, continuar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="account-delete-dialog-title" tabIndex="-1" ref={dialogTitleRef}>
                  Una última confirmación
                </h2>
                <p id="account-delete-dialog-desc">
                  Para proteger tu cuenta, escribe la frase indicada y confirma tu contraseña.
                  Esta decisión no se puede deshacer.
                </p>
                <form className="account-privacy__delete-form" onSubmit={handleDeleteAccount}>
                  <label className="account-privacy__label" htmlFor="confirm-delete-account">
                    Escribe: <strong>{CONFIRMATION_PHRASE}</strong>
                  </label>
                  <input id="confirm-delete-account" type="text" autoComplete="off"
                    spellCheck="false" maxLength={80} value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)} disabled={deleting} required />

                  <label className="account-privacy__label" htmlFor="confirm-delete-password">
                    Tu contraseña actual
                  </label>
                  <input id="confirm-delete-password" type="password" autoComplete="current-password"
                    value={password} onChange={(event) => setPassword(event.target.value)}
                    disabled={deleting} required />

                  <label className="account-privacy__checkbox">
                    <input type="checkbox" checked={understood} disabled={deleting}
                      onChange={(event) => setUnderstood(event.target.checked)} />
                    <span>Entiendo que esta acción es definitiva.</span>
                  </label>

                  {deleteError && <p className="account-privacy__error" role="alert">{deleteError}</p>}

                  <div className="account-privacy__dialog-actions">
                    <button type="button" className="account-privacy__cancel"
                      disabled={deleting} onClick={closeDialog}>Cancelar</button>
                    <button type="submit" className="account-privacy__confirm" disabled={!canConfirmDeletion}>
                      <Trash2 size={16} aria-hidden="true" />
                      {deleting ? "Eliminando..." : "Eliminar mi cuenta"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// Permite reutilizar esta sección en Mi cuenta sin duplicar la lógica.
export default AccountPrivacyAndDeletion;
