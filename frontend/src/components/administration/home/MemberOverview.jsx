//frontend/src/components/administration/home/MemberOverview.jsx

// Importamos Link para navegar
// hacia las distintas secciones de la aplicación.
import {
  Link,
  useLocation,
} from "react-router-dom";

// Importamos los estilos
// exclusivos del componente.
import "../../../styles/components/administration/home/MemberOverview.css";

// Estilos adicionales de la tarjeta personal reutilizable.
import "../../../styles/components/administration/home/MemberAccountShortcut.css";


// Importamos los iconos
// utilizados dentro de este resumen.
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  UserRoundCog,
  MapPin,
  Video,
} from "lucide-react";


// =========================================================
// EVENTOS RECURRENTES (INFORMATIVOS)
// =========================================================

// Estos horarios habituales son informativos, no confirmaciones de actividades.
//
// Más adelante serán obtenidas
// desde MongoDB mediante la API.
const recurringPublicEvents = [
  {
    id: "sunday",
    day: "Domingo",
    title: "Culto general",
    time: "11:00 hrs",
    mode: "Presencial",
    icon: MapPin,
  },
  {
    id: "tuesday",
    day: "Martes",
    title: "Descubriendo la Biblia",
    time: "20:00 hrs",
    mode: "Online",
    icon: Video,
  },
  {
    id: "wednesday",
    day: "Miércoles",
    title: "Reunión de oración",
    time: "21:00 hrs",
    mode: "Online",
    icon: Video,
  },
];


// =========================================================
// ACCESOS PERSONALES
// =========================================================

// Estas opciones representan acciones
// disponibles para cualquier miembro,
// incluso si posee un rol administrativo.
const memberActions = [
  {
    id: "prayer",

    title: "Peticiones de oración",

    description:
      "Comparte tus peticiones, acompaña a otros miembros en oración y consulta tus solicitudes.",

    icon: HeartHandshake,

    // Espacio personal, no gestión administrativa.
    path: "/member/peticiones-oracion",

    // La página de miembros ya está implementada.
    available: true,
  },
  {
    id: "resources",
    title: "Recursos",
    description:
      "Accede a estudios, guías y materiales para tu crecimiento personal.",
    icon: BookOpen,
    path: "/member/recursos",
    available: true,
  },
  {
    id: "events",
    title: "Mis actividades",
    description:
      "Consulta las reuniones y actividades disponibles para la comunidad y confirma tu asistencia.",
    icon: CalendarDays,
    path: "/member/actividades",
    available: true,
  },
];


// =========================================================
// COMPONENTE
// =========================================================

// Creamos el resumen correspondiente
// a la experiencia personal del super administrador.
//
// Aunque tenga permisos administrativos,
// sigue siendo también miembro de la iglesia.
function MemberOverview() {
  // Identificamos el panel para conservar su propia navegación.
  const { pathname } = useLocation();
  const accountPath = pathname.startsWith("/super-admin")
    ? "/super-admin/mi-cuenta"
    : "/admin/mi-cuenta";

  return (
    <section className="super-admin-member">

      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <div className="super-admin-member__header">

        <div>

          <span className="super-admin-member__eyebrow">
            Mi comunidad
          </span>

          <h2>
            Tu espacio como miembro
          </h2>

          <p>
            Mantente al día con las actividades,
            participa de la comunidad y accede
            a los recursos disponibles para ti.
          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ================================================= */}

      <div className="super-admin-member__grid">


        {/* ================================================= */}
        {/* EVENTOS RECURRENTES */}
        {/* ================================================= */}

        <article className="super-admin-member__card">

          <div className="super-admin-member__card-header">

            <div className="super-admin-member__card-title">

              <CalendarDays
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <h3>
                  Eventos habituales
                </h3>

                <span>
                  Reuniones recurrentes de la comunidad
                </span>
              </div>

            </div>


            <Link
              className="super-admin-member__header-link"
              to="/eventos"
            >
              Ver todas

              <ArrowRight
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>

          </div>


          <div className="super-admin-member__activities">

            {recurringPublicEvents.map(
              (event) => {

                // Guardamos el icono
                // correspondiente a la actividad.
                const EventIcon =
                  event.icon;

                return (
                  <div
                    className="super-admin-member__activity"
                    key={event.id}
                  >

                    <div className="super-admin-member__activity-icon">

                      <EventIcon
                        size={19}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />

                    </div>


                    <div className="super-admin-member__activity-content">

                      <div className="super-admin-member__activity-top">

                        <strong>
                          {event.title}
                        </strong>

                        <span>
                          {event.day}
                        </span>

                      </div>


                      <div className="super-admin-member__activity-details">

                        <span>
                          {event.time}
                        </span>

                        <span>
                          {event.mode}
                        </span>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </article>


        {/* ================================================= */}
        {/* PARTICIPACIÓN PERSONAL */}
        {/* ================================================= */}

        <article className="super-admin-member__card">

          <div className="super-admin-member__card-header">

            <div className="super-admin-member__card-title">

              <HeartHandshake
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <h3>
                  Participa de la comunidad
                </h3>

                <span>
                  Accesos personales
                </span>
              </div>

            </div>

          </div>


          <div className="super-admin-member__actions">

            {memberActions.map(
              (action) => {

                // Guardamos el componente
                // correspondiente al icono.
                const ActionIcon =
                  action.icon;


                // Si la sección ya existe,
                // mostramos un enlace normal.
                if (action.available) {

                  return (
                    <Link
                      className="super-admin-member-action"
                      to={action.path}
                      key={action.id}
                    >

                      <div className="super-admin-member-action__icon">

                        <ActionIcon
                          size={20}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />

                      </div>


                      <div className="super-admin-member-action__content">

                        <strong>
                          {action.title}
                        </strong>

                        <span>
                          {action.description}
                        </span>

                      </div>


                      <ArrowRight
                        className="super-admin-member-action__arrow"
                        size={17}
                        strokeWidth={2}
                        aria-hidden="true"
                      />

                    </Link>
                  );
                }


                // Las funciones que todavía
                // no existen se muestran deshabilitadas.
                return (
                  <button
                    className="
                      super-admin-member-action
                      super-admin-member-action--disabled
                    "
                    type="button"
                    disabled
                    key={action.id}
                  >

                    <div className="super-admin-member-action__icon">

                      <ActionIcon
                        size={20}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />

                    </div>


                    <div className="super-admin-member-action__content">

                      <strong>
                        {action.title}
                      </strong>

                      <span>
                        Disponible próximamente
                      </span>

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </article>

      </div>

      {/* Acceso personal en una fila independiente, sin desbalancear
          las dos tarjetas que están sobre él. */}
      <Link className="member-account-shortcut" to={accountPath}>
        <span className="member-account-shortcut__icon" aria-hidden="true">
          <UserRoundCog size={23} strokeWidth={1.8} />
        </span>
        <span className="member-account-shortcut__content">
          <strong>Mi cuenta</strong>
          <span>Edita tus datos personales y administra la seguridad de tu cuenta.</span>
        </span>
        <span className="member-account-shortcut__action">
          Administrar cuenta <ArrowRight size={17} aria-hidden="true" />
        </span>
      </Link>

    </section>
  );
}


// Exportamos el componente
// para utilizarlo dentro de SuperAdminHome.
export default MemberOverview;
