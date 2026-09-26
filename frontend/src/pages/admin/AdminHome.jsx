// Importamos Link y NavLink para navegar entre las páginas
// sin recargar completamente la aplicación.
import {
    Link,
    NavLink,
} from "react-router-dom";

// Importamos los estilos exclusivos del panel del administrador.
import "../../styles/pages/admin/AdminHome.css";

// Creamos el componente principal del panel administrativo.
function AdminHome() {

    // Esta función permite asignar una clase diferente
    // al enlace correspondiente a la página activa.
    const getNavigationClass = ({ isActive }) => {
        return isActive
            ? "limited-admin__nav-link limited-admin__nav-link--active"
            : "limited-admin__nav-link";
    };

    return (
        // Contenedor general del panel administrativo.
        <div className="limited-admin">

            {/* ====================================================== */}
            {/* SIDEBAR                                                */}
            {/* ====================================================== */}

            <aside className="limited-admin__sidebar">

                {/* Identidad visual del panel. */}
                <div className="limited-admin__brand">

                    {/* Icono temporal del logo. */}
                    <div className="limited-admin__brand-icon">
                        ⚓
                    </div>

                    {/* Nombre y tipo de panel. */}
                    <div>
                        <h1 className="limited-admin__brand-title">
                            El Ancla
                        </h1>

                        <p className="limited-admin__brand-subtitle">
                            Panel administrativo
                        </p>
                    </div>

                </div>

                {/* Navegación principal. */}
                <nav className="limited-admin__navigation">

                    {/* Grupo principal. */}
                    <div className="limited-admin__nav-group">

                        <p className="limited-admin__nav-title">
                            Principal
                        </p>

                        <NavLink
                            to="/admin"
                            end
                            className={getNavigationClass}
                        >
                            <span className="limited-admin__nav-icon">
                                ▦
                            </span>

                            <span>Inicio</span>
                        </NavLink>

                    </div>

                    {/* Grupo relacionado con la comunidad. */}
                    <div className="limited-admin__nav-group">

                        <p className="limited-admin__nav-title">
                            Comunidad
                        </p>

                        <div className="limited-admin__nav-link limited-admin__nav-link--disabled">
                            <span className="limited-admin__nav-icon">
                                ▣
                            </span>

                            <span>Eventos</span>

                            <span className="limited-admin__nav-status">
                                Próximamente
                            </span>
                        </div>

                        <div className="limited-admin__nav-link limited-admin__nav-link--disabled">
                            <span className="limited-admin__nav-icon">
                                ♡
                            </span>

                            <span>Peticiones de oración</span>

                            <span className="limited-admin__nav-status">
                                Próximamente
                            </span>
                        </div>

                        <div className="limited-admin__nav-link limited-admin__nav-link--disabled">
                            <span className="limited-admin__nav-icon">
                                ♙
                            </span>

                            <span>Miembros</span>

                            <span className="limited-admin__nav-status">
                                Consulta
                            </span>
                        </div>

                    </div>

                    {/* Grupo de contenidos. */}
                    <div className="limited-admin__nav-group">

                        <p className="limited-admin__nav-title">
                            Contenidos
                        </p>

                        <div className="limited-admin__nav-link limited-admin__nav-link--disabled">
                            <span className="limited-admin__nav-icon">
                                ▤
                            </span>

                            <span>Recursos</span>

                            <span className="limited-admin__nav-status">
                                Próximamente
                            </span>
                        </div>

                    </div>

                    {/* Grupo financiero. */}
                    <div className="limited-admin__nav-group">

                        <p className="limited-admin__nav-title">
                            Finanzas
                        </p>

                        <div className="limited-admin__nav-link limited-admin__nav-link--disabled">
                            <span className="limited-admin__nav-icon">
                                $
                            </span>

                            <span>Ingresos</span>

                            <span className="limited-admin__nav-status">
                                Próximamente
                            </span>
                        </div>

                        <NavLink
                            to="/admin/gastos"
                            className={getNavigationClass}
                        >
                            <span className="limited-admin__nav-icon">
                                ▤
                            </span>

                            <span>Gastos</span>
                        </NavLink>

                    </div>

                </nav>

                {/* Acciones inferiores del sidebar. */}
                <div className="limited-admin__sidebar-footer">

                    <Link
                        to="/"
                        className="limited-admin__footer-link"
                    >
                        <span>↗</span>
                        <span>Ver sitio público</span>
                    </Link>

                    <button
                        className="limited-admin__footer-link limited-admin__logout"
                        type="button"
                    >
                        <span>↪</span>
                        <span>Cerrar sesión</span>
                    </button>

                </div>

            </aside>

            {/* ====================================================== */}
            {/* CONTENIDO PRINCIPAL                                    */}
            {/* ====================================================== */}

            <div className="limited-admin__main">

                {/* Header superior. */}
                <header className="limited-admin__header">

                    <div>
                        <h2 className="limited-admin__header-title">
                            Panel administrativo
                        </h2>

                        <p className="limited-admin__header-date">
                            Viernes, 25 de septiembre de 2026
                        </p>
                    </div>

                    {/* Información del administrador conectado. */}
                    <div className="limited-admin__profile">

                        <div className="limited-admin__notification">
                            ♧
                        </div>

                        <div className="limited-admin__profile-avatar">
                            ♙
                        </div>

                        <div className="limited-admin__profile-info">
                            <strong>
                                Administrador
                            </strong>

                            <span>
                                Acceso administrativo
                            </span>
                        </div>

                    </div>

                </header>

                {/* ================================================== */}
                {/* ÁREA DEL DASHBOARD                                 */}
                {/* ================================================== */}

                <main className="limited-admin__content">

                    {/* Tarjeta de bienvenida. */}
                    <section className="limited-admin__welcome-card">

                        <div className="limited-admin__welcome-content">

                            <span className="limited-admin__eyebrow">
                                Administración general
                            </span>

                            <h2 className="limited-admin__welcome-title">
                                Bienvenido al panel administrativo
                            </h2>

                            <p className="limited-admin__welcome-text">
                                Revisa la actividad de la iglesia y
                                accede rápidamente a las herramientas
                                disponibles para tu gestión.
                            </p>

                        </div>

                        <Link
                            to="/"
                            className="limited-admin__public-button"
                        >
                            Ver sitio público
                            <span>→</span>
                        </Link>

                    </section>

                    {/* ================================================== */}
                    {/* TARJETAS DE ESTADÍSTICAS                            */}
                    {/* ================================================== */}

                    <section className="limited-admin__stats">

                        <article className="limited-admin__stat-card">

                            <div className="limited-admin__stat-icon limited-admin__stat-icon--blue">
                                ▦
                            </div>

                            <div>
                                <p className="limited-admin__stat-label">
                                    Próximas actividades
                                </p>

                                <strong className="limited-admin__stat-value">
                                    4
                                </strong>

                                <span className="limited-admin__stat-description">
                                    Actividades semanales
                                </span>
                            </div>

                        </article>

                        <article className="limited-admin__stat-card">

                            <div className="limited-admin__stat-icon limited-admin__stat-icon--gold">
                                ♡
                            </div>

                            <div>
                                <p className="limited-admin__stat-label">
                                    Peticiones pendientes
                                </p>

                                <strong className="limited-admin__stat-value">
                                    2
                                </strong>

                                <span className="limited-admin__stat-description">
                                    Requieren revisión
                                </span>
                            </div>

                        </article>

                        <article className="limited-admin__stat-card">

                            <div className="limited-admin__stat-icon limited-admin__stat-icon--green">
                                ♙
                            </div>

                            <div>
                                <p className="limited-admin__stat-label">
                                    Miembros registrados
                                </p>

                                <strong className="limited-admin__stat-value">
                                    48
                                </strong>

                                <span className="limited-admin__stat-description">
                                    Información temporal
                                </span>
                            </div>

                        </article>

                        <article className="limited-admin__stat-card">

                            <div className="limited-admin__stat-icon limited-admin__stat-icon--red">
                                ▤
                            </div>

                            <div>
                                <p className="limited-admin__stat-label">
                                    Gastos pendientes
                                </p>

                                <strong className="limited-admin__stat-value">
                                    2
                                </strong>

                                <span className="limited-admin__stat-description">
                                    $70.990
                                </span>
                            </div>

                        </article>

                    </section>

                    {/* ================================================== */}
                    {/* ACCIONES RÁPIDAS                                   */}
                    {/* ================================================== */}

                    <section className="limited-admin__section">

                        <div className="limited-admin__section-heading">

                            <div>
                                <h3 className="limited-admin__section-title">
                                    Acciones rápidas
                                </h3>

                                <p className="limited-admin__section-description">
                                    Accede directamente a las tareas
                                    administrativas más utilizadas.
                                </p>
                            </div>

                        </div>

                        <div className="limited-admin__quick-actions">

                            <button
                                type="button"
                                className="limited-admin__quick-action limited-admin__quick-action--disabled"
                            >
                                <span className="limited-admin__quick-icon">
                                    ▦
                                </span>

                                <span>
                                    <strong>Crear evento</strong>
                                    <small>Disponible próximamente</small>
                                </span>
                            </button>

                            <button
                                type="button"
                                className="limited-admin__quick-action limited-admin__quick-action--disabled"
                            >
                                <span className="limited-admin__quick-icon">
                                    ♫
                                </span>

                                <span>
                                    <strong>Publicar aviso</strong>
                                    <small>Disponible próximamente</small>
                                </span>
                            </button>

                            <button
                                type="button"
                                className="limited-admin__quick-action limited-admin__quick-action--disabled"
                            >
                                <span className="limited-admin__quick-icon">
                                    $
                                </span>

                                <span>
                                    <strong>Registrar ingreso</strong>
                                    <small>Disponible próximamente</small>
                                </span>
                            </button>

                            <Link
                                to="/admin/gastos"
                                className="limited-admin__quick-action"
                            >
                                <span className="limited-admin__quick-icon">
                                    ▤
                                </span>

                                <span>
                                    <strong>Registrar gasto</strong>
                                    <small>
                                        Ir al módulo de gastos de la iglesia.
                                    </small>
                                </span>

                                <span className="limited-admin__quick-arrow">
                                    →
                                </span>
                            </Link>

                            <button
                                type="button"
                                className="limited-admin__quick-action limited-admin__quick-action--disabled"
                            >
                                <span className="limited-admin__quick-icon">
                                    ＋
                                </span>

                                <span>
                                    <strong>Agregar recurso</strong>
                                    <small>Disponible próximamente</small>
                                </span>
                            </button>

                        </div>

                    </section>

                    {/* ================================================== */}
                    {/* ACTIVIDADES Y PETICIONES                           */}
                    {/* ================================================== */}

                    <div className="limited-admin__dashboard-grid">

                        {/* Próximas actividades. */}
                        <section className="limited-admin__section">

                            <div className="limited-admin__section-heading">

                                <div>
                                    <h3 className="limited-admin__section-title">
                                        Próximas actividades
                                    </h3>

                                    <p className="limited-admin__section-description">
                                        Reuniones programadas para la comunidad.
                                    </p>
                                </div>

                                <span className="limited-admin__section-link">
                                    Ver todas
                                </span>

                            </div>

                            <div className="limited-admin__activity-list">

                                <div className="limited-admin__activity">
                                    <div className="limited-admin__activity-icon">
                                        ▦
                                    </div>

                                    <div>
                                        <strong>Culto general</strong>
                                        <p>
                                            ◷ Domingo, 11:00 hrs
                                            <span>⌖ Presencial y online</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="limited-admin__activity">
                                    <div className="limited-admin__activity-icon">
                                        ▦
                                    </div>

                                    <div>
                                        <strong>Descubriendo la Biblia</strong>
                                        <p>
                                            ◷ Martes, 20:00 hrs
                                            <span>⌖ Online</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="limited-admin__activity">
                                    <div className="limited-admin__activity-icon">
                                        ▦
                                    </div>

                                    <div>
                                        <strong>Reunión de oración</strong>
                                        <p>
                                            ◷ Miércoles, 21:00 hrs
                                            <span>⌖ Online</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="limited-admin__activity">
                                    <div className="limited-admin__activity-icon">
                                        ▦
                                    </div>

                                    <div>
                                        <strong>Estudio bíblico</strong>
                                        <p>
                                            ◷ Jueves, 20:00 hrs
                                            <span>⌖ Online</span>
                                        </p>
                                    </div>
                                </div>

                            </div>

                        </section>

                        {/* Peticiones recientes. */}
                        <section className="limited-admin__section">

                            <div className="limited-admin__section-heading">

                                <div>
                                    <h3 className="limited-admin__section-title">
                                        Peticiones recientes
                                    </h3>

                                    <p className="limited-admin__section-description">
                                        Solicitudes recibidas desde la comunidad.
                                    </p>
                                </div>

                                <span className="limited-admin__section-link">
                                    Ver todas
                                </span>

                            </div>

                            <div className="limited-admin__prayer-list">

                                <article className="limited-admin__prayer-card">

                                    <div className="limited-admin__prayer-header">
                                        <strong>Solicitud anónima</strong>

                                        <span className="limited-admin__badge limited-admin__badge--pending">
                                            Pendiente
                                        </span>
                                    </div>

                                    <p>
                                        Oración por una situación familiar
                                        y dirección para tomar decisiones.
                                    </p>

                                    <small>Hace 2 horas</small>

                                </article>

                                <article className="limited-admin__prayer-card">

                                    <div className="limited-admin__prayer-header">
                                        <strong>María</strong>

                                        <span className="limited-admin__badge limited-admin__badge--active">
                                            En oración
                                        </span>
                                    </div>

                                    <p>
                                        Oración por la recuperación de un
                                        familiar que se encuentra enfermo.
                                    </p>

                                    <small>Hace 5 horas</small>

                                </article>

                                <article className="limited-admin__prayer-card">

                                    <div className="limited-admin__prayer-header">
                                        <strong>Solicitud privada</strong>

                                        <span className="limited-admin__badge limited-admin__badge--pending">
                                            Pendiente
                                        </span>
                                    </div>

                                    <p>
                                        Esta petición contiene información
                                        privada para el equipo de liderazgo.
                                    </p>

                                    <small>Ayer</small>

                                </article>

                            </div>

                        </section>

                    </div>

                    {/* ================================================== */}
                    {/* RESUMEN FINANCIERO                                 */}
                    {/* ================================================== */}

                    <section className="limited-admin__section limited-admin__finance">

                        <div className="limited-admin__section-heading">

                            <div>
                                <h3 className="limited-admin__section-title">
                                    Resumen financiero
                                </h3>

                                <p className="limited-admin__section-description">
                                    Vista general de los gastos registrados.
                                </p>
                            </div>

                            <Link
                                to="/admin/gastos"
                                className="limited-admin__section-link"
                            >
                                Ver gastos →
                            </Link>

                        </div>

                        <div className="limited-admin__finance-grid">

                            <article className="limited-admin__finance-card">
                                <span className="limited-admin__finance-icon">
                                    $
                                </span>

                                <div>
                                    <small>Gastos pagados</small>
                                    <strong>$462.600</strong>
                                </div>
                            </article>

                            <article className="limited-admin__finance-card">
                                <span className="limited-admin__finance-icon">
                                    ▤
                                </span>

                                <div>
                                    <small>Total comprometido</small>
                                    <strong>$70.990</strong>
                                </div>
                            </article>

                            <article className="limited-admin__finance-card">
                                <span className="limited-admin__finance-icon">
                                    ▥
                                </span>

                                <div>
                                    <small>Movimientos registrados</small>
                                    <strong>6</strong>
                                </div>
                            </article>

                        </div>

                    </section>

                </main>

            </div>

        </div>
    );
}

// Exportamos el componente para poder utilizarlo desde App.js.
export default AdminHome;