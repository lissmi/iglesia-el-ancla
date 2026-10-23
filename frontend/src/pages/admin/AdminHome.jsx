
/*
 * =========================================================
 * IGLESIA EL ANCLA
 * HOME DEL ADMINISTRADOR NORMAL
 * =========================================================
 *
 * Reutilizamos los componentes visuales del panel
 * del superadministrador.
 *
 * La única diferencia es que NO incorporamos
 * el componente SuperAdminOverview.
 *
 * Esto permite mantener exactamente el mismo
 * diseño, navegación y funcionalidades generales.
 */

// =========================================================
// ESTILOS COMPARTIDOS
// =========================================================

// Utilizamos el mismo CSS del superadministrador.
// No necesitamos mantener estilos diferentes
// para dos interfaces que deben ser iguales.
import "../../styles/pages/super-admin/SuperAdminHome.css";

// =========================================================
// COMPONENTES COMPARTIDOS
// =========================================================

// Muestra el espacio personal del administrador
// como miembro de la comunidad.
//
// Incluye:
// - Próximas actividades.
// - Peticiones de oración.
// - Recursos.
// - Actividades personales.
import MemberOverview from "../../components/administration/home/MemberOverview";

// Muestra las herramientas de gestión de la iglesia.
//
// Incluye:
// - Eventos.
// - Peticiones de oración.
// - Miembros.
// - Registrar usuario.
// - Voluntarios.
// - Recursos.
// - Recomendados.
// - Páginas informativas.
// - Ingresos.
// - Gastos.
// - Finanzas.
// - Insumos básicos.
// - Inventario de Bienes.
// - Gestión de Martín.
import AdminOverview from "../../components/administration/home/AdminOverview";

// Muestra el acceso directo al historial
// de actividad administrativa.
import ActivityHistoryShortcut from "../../components/administration/activity/ActivityHistoryShortcut";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function AdminHome() {

    return (

        // Utilizamos exactamente la misma estructura
        // visual del Home del superadministrador.
        <main className="super-admin-home">

            {/* Contenedor principal compartido. */}
            <div className="super-admin-home__container">

                {/* ===================================== */}
                {/* ENCABEZADO GENERAL */}
                {/* ===================================== */}

                <section className="super-admin-home__welcome">

                    {/* Identificador de la sección. */}
                    <span className="super-admin-home__eyebrow">
                        Panel general
                    </span>

                    {/* Título de bienvenida. */}
                    <h1>
                        Bienvenido a tu espacio
                    </h1>

                    {/* Descripción del panel. */}
                    <p>
                        Revisa tu actividad como miembro de la comunidad
                        y accede a las herramientas de administración
                        de Iglesia El Ancla.
                    </p>

                </section>

                {/* ===================================== */}
                {/* MI ESPACIO COMO MIEMBRO */}
                {/* ===================================== */}

                {/* Reutilizamos la misma sección personal
                    que utiliza el superadministrador. */}
                <MemberOverview />

                {/* ===================================== */}
                {/* GESTIÓN DE LA IGLESIA */}
                {/* ===================================== */}

                {/* Reutilizamos todas las herramientas
                    administrativas generales. */}
                <AdminOverview />

                {/* ===================================== */}
                {/* HISTORIAL DE ACTIVIDAD */}
                {/* ===================================== */}

                {/* El administrador normal también puede
                    consultar el historial de actividad. */}
                <ActivityHistoryShortcut />

                {/* ===================================== */}
                {/* ADMINISTRACIÓN AVANZADA */}
                {/* ===================================== */}

                {/* No incorporamos SuperAdminOverview.
                    Esa sección es exclusiva del rol
                    super_admin. */}

            </div>

        </main>
    );
}

// =========================================================
// EXPORTACIÓN
// =========================================================

// Exportamos la página para utilizarla
// desde las rutas protegidas de App.js.
export default AdminHome;
