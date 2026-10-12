//frontend/src/components/administration/home/MemberOverview.jsx

// Importamos Link para navegar
// hacia las distintas secciones de la aplicación.
import {
  Link,
} from "react-router-dom";

// Importamos los estilos
// exclusivos del componente.
import "../../../styles/components/administration/home/MemberOverview.css";


// Importamos los iconos
// utilizados dentro de este resumen.
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  MapPin,
  Video,
} from "lucide-react";


// =========================================================
// ACTIVIDADES TEMPORALES
// =========================================================

// Estas actividades son temporales.
//
// Más adelante serán obtenidas
// desde MongoDB mediante la API.
const upcomingActivities = [
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
    path: "/recursos",
    available: true,
  },
  {
    id: "events",
    title: "Actividades",
    description:
      "Consulta las reuniones y actividades disponibles para la comunidad y confirma tu asistencia.",
    icon: CalendarDays,
    path: "/member/eventos",
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
        {/* PRÓXIMAS ACTIVIDADES */}
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
                  Próximas actividades
                </h3>

                <span>
                  Reuniones de la comunidad
                </span>
              </div>

            </div>


            <Link
              className="super-admin-member__header-link"
              to="/member/eventos"
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

            {upcomingActivities.map(
              (activity) => {

                // Guardamos el icono
                // correspondiente a la actividad.
                const ActivityIcon =
                  activity.icon;

                return (
                  <div
                    className="super-admin-member__activity"
                    key={activity.id}
                  >

                    <div className="super-admin-member__activity-icon">

                      <ActivityIcon
                        size={19}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />

                    </div>


                    <div className="super-admin-member__activity-content">

                      <div className="super-admin-member__activity-top">

                        <strong>
                          {activity.title}
                        </strong>

                        <span>
                          {activity.day}
                        </span>

                      </div>


                      <div className="super-admin-member__activity-details">

                        <span>
                          {activity.time}
                        </span>

                        <span>
                          {activity.mode}
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

    </section>
  );
}


// Exportamos el componente
// para utilizarlo dentro de SuperAdminHome.
export default MemberOverview;