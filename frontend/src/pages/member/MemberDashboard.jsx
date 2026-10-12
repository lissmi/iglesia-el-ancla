import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  Compass,
  HeartHandshake,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  Video,
  HandHeart,
} from "lucide-react";

import logoElAncla from "../../assets/images/logo-el-ancla.png";
import "../../styles/pages/member/MemberDashboard.css";

// Estas actividades son contenido informativo; no representan inscripciones del miembro.
const weeklyActivities = [
  { id: "sunday", day: "Domingo", title: "Culto general", time: "11:00", mode: "Presencial", icon: MapPin },
  { id: "tuesday", day: "Martes", title: "Descubriendo la Biblia", time: "20:00", mode: "Online", icon: Video },
  { id: "wednesday", day: "Miércoles", title: "Reunión de oración", time: "21:00", mode: "Online", icon: Video },
  { id: "thursday", day: "Jueves", title: "Estudio bíblico", time: "20:00", mode: "Online", icon: Video },
];

// Solo enlazamos secciones públicas que ya aparecen en App.js.
const resourceLinks = [
  { title: "Guías de oración", description: "Un espacio para acompañar tus momentos de oración.", to: "/recursos/guias-oracion", icon: HeartHandshake },
  { title: "Estudios bíblicos", description: "Material para aprender y compartir en comunidad.", to: "/recursos/estudios", icon: BookOpen },
  { title: "Guía devocional", description: "Ideas sencillas para dedicar tiempo a la reflexión.", to: "/recursos/devocional", icon: Compass },
];

// El usuario debe provenir de una sesión verificada por el backend.
function MemberDashboard({ user }) {
  // Evitamos usar información del navegador como prueba de identidad.
  const firstName = typeof user?.firstName === "string" ? user.firstName.trim() : "";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const primaryBranch = user?.sucursalPrincipal?.name;

  return (
    <div className="member-page">
      <a className="member-page__skip" href="#contenido-miembro">Ir al contenido</a>

      <header className="member-topbar">
        <div className="member-container member-topbar__inner">
          <Link className="member-topbar__brand" to="/" aria-label="El Ancla: ir al inicio">
            <img src={logoElAncla} alt="" />
            <span><strong>El Ancla</strong><small>Mi espacio</small></span>
          </Link>

          <nav
            className="member-topbar__links"
            aria-label="Navegación de miembros"
          >
            <a href="#participacion">Participación</a>
            <a href="#actividades">Actividades</a>
            <a href="#recursos-miembro">Recursos</a>
            <a href="#mi-perfil">Mi perfil</a>
          </nav>

          <Link className="member-topbar__public-link" to="/">
            Ver sitio público <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="member-container member-main" id="contenido-miembro">
        <div className="member-breadcrumb" aria-label="Ubicación actual">
          <Link to="/">Inicio</Link><ChevronRight size={15} aria-hidden="true" />
          <span aria-current="page">Mi espacio</span>
        </div>

        <section className="member-hero" aria-labelledby="member-welcome-title">
          <div className="member-hero__content">
            <span className="member-eyebrow"><Sparkles size={16} aria-hidden="true" /> Tu espacio en comunidad</span>
            <h1 id="member-welcome-title">{firstName ? `¡Qué bueno verte, ${firstName}!` : "Bienvenido a tu espacio"}</h1>
            <p>Encuentra nuestras actividades, explora recursos para crecer en la fe y mantente cerca de la comunidad de El Ancla.</p>
            <div className="member-hero__actions">
              <a className="member-button member-button--light" href="#actividades">Explorar actividades <ArrowRight size={17} aria-hidden="true" /></a>
              <Link className="member-button member-button--outline" to="/contacto">Contáctanos</Link>
            </div>
          </div>
          <div className="member-hero__art" aria-hidden="true">
            <span className="member-hero__ring member-hero__ring--outer" />
            <span className="member-hero__ring member-hero__ring--inner" />
            <span className="member-hero__symbol"><img src={logoElAncla} alt="" /></span>
            <span className="member-hero__verse">Juntos en comunidad</span>
          </div>
        </section>

        <div className="member-grid">
          <div className="member-grid__main">

            {/* ============================================= */}
            {/* PARTICIPACIÓN EN COMUNIDAD */}
            {/* ============================================= */}

            <section
              className="member-section"
              id="participacion"
              aria-labelledby="member-participation-title"
            >
              <div className="member-section__heading">
                <div>
                  <span className="member-section__kicker">
                    Caminemos juntos
                  </span>

                  <h2 id="member-participation-title">
                    Participa en nuestra comunidad
                  </h2>

                  <p>
                    Comparte tus peticiones, acompaña a otros
                    miembros y participa en las actividades
                    de Iglesia El Ancla.
                  </p>
                </div>
              </div>

              <div className="member-resources">

                {/* PETICIONES DE ORACIÓN */}

                <Link
                  className="member-resource"
                  to="/member/peticiones-oracion"
                >
                  <span className="member-resource__icon">
                    <HandHeart
                      size={23}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>

                  <strong>
                    Peticiones de oración
                  </strong>

                  <span>
                    Comparte tus peticiones, acompaña a otros
                    miembros en oración y consulta el
                    seguimiento de tus solicitudes.
                  </span>

                  <span className="member-resource__arrow">
                    Ir a peticiones
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>

                {/* ACTIVIDADES PERSONALES */}

                <Link
                  className="member-resource"
                  to="/member/eventos"
                >
                  <span className="member-resource__icon">
                    <CalendarDays
                      size={23}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>

                  <strong>
                    Mis actividades
                  </strong>

                  <span>
                    Consulta las actividades disponibles
                    y participa en los encuentros de
                    nuestra comunidad.
                  </span>

                  <span className="member-resource__arrow">
                    Ver actividades
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>

              </div>
            </section>

            <section className="member-section" id="actividades" aria-labelledby="member-activities-title">
              <div className="member-section__heading">
                <div>
                  <span className="member-section__kicker">Compartamos juntos</span>
                  <h2 id="member-activities-title">Actividades de la semana</h2>
                  <p>Horarios habituales de nuestra comunidad. Consulta los detalles antes de asistir.</p>
                </div>
                <Link className="member-text-link" to="/eventos">Ver eventos <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>

              <div className="member-activities">
                {weeklyActivities.map((activity) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <article className="member-activity" key={activity.id}>
                      <div className="member-activity__day"><CalendarDays size={19} aria-hidden="true" /><span>{activity.day}</span></div>
                      <div className="member-activity__body"><h3>{activity.title}</h3><span><ActivityIcon size={15} aria-hidden="true" /> {activity.mode}</span></div>
                      <div className="member-activity__time"><Clock3 size={16} aria-hidden="true" /> {activity.time}</div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="member-section" id="recursos-miembro" aria-labelledby="member-resources-title">
              <div className="member-section__heading">
                <div>
                  <span className="member-section__kicker">Para tu día a día</span>
                  <h2 id="member-resources-title">Recursos para acompañarte</h2>
                  <p>Un punto de partida para estudiar, reflexionar y orar.</p>
                </div>
                <Link className="member-text-link" to="/recursos">Todos los recursos <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>

              <div className="member-resources">
                {resourceLinks.map((resource) => {
                  const ResourceIcon = resource.icon;
                  return (
                    <Link className="member-resource" key={resource.to} to={resource.to}>
                      <span className="member-resource__icon"><ResourceIcon size={23} strokeWidth={1.8} aria-hidden="true" /></span>
                      <strong>{resource.title}</strong>
                      <span>{resource.description}</span>
                      <span className="member-resource__arrow">Explorar <ArrowRight size={16} aria-hidden="true" /></span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="member-grid__aside" aria-label="Información personal y comunidad">
            <section className="member-profile" id="mi-perfil" aria-labelledby="member-profile-title">
              <div className="member-profile__heading"><span className="member-profile__icon"><UserRound size={22} aria-hidden="true" /></span><div><span>Cuenta de miembro</span><h2 id="member-profile-title">Mi perfil</h2></div></div>
              {user ? (
                <dl className="member-profile__details">
                  <div><dt>Nombre</dt><dd>{fullName || "Sin registrar"}</dd></div>
                  <div><dt>Correo</dt><dd className="member-profile__email">{user.email || "Sin registrar"}</dd></div>
                  <div><dt>Sucursal principal</dt><dd>{primaryBranch || "Por confirmar"}</dd></div>
                </dl>
              ) : (
                <p className="member-profile__empty">Tus datos aparecerán aquí cuando conectemos esta página con tu sesión verificada.</p>
              )}
              <p className="member-profile__note"><ShieldCheck size={17} aria-hidden="true" /> Tu información personal se mostrará solo en tu sesión.</p>
            </section>

            <section className="member-community" aria-labelledby="member-community-title">
              <div className="member-community__icon"><HeartHandshake size={26} aria-hidden="true" /></div>
              <h2 id="member-community-title">¿Necesitas conversar?</h2>
              <p>Queremos acompañarte. Escríbenos si tienes una consulta o necesitas orientación.</p>
              <Link to="/contacto">Ir a contacto <ArrowRight size={17} aria-hidden="true" /></Link>
            </section>

            <div className="member-help"><Mail size={19} aria-hidden="true" /><p>¿Buscas algo más? <Link to="/recursos/preguntas-frecuentes">Revisa las preguntas frecuentes</Link>.</p></div>
          </aside>
        </div>
      </main>

      <footer className="member-footer"><div className="member-container"><span>© {new Date().getFullYear()} Iglesia El Ancla</span><Link to="/">Volver al inicio</Link></div></footer>
    </div>
  );
}

export default MemberDashboard;
