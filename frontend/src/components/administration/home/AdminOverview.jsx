// =========================================================
// IMPORTACIONES
// =========================================================

// Importamos Link para navegar entre módulos.
// Importamos useLocation para identificar el panel actual.

import {
    Link,
    useLocation,
} from "react-router-dom";


// =========================================================
// ICONOS
// =========================================================

import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    Clapperboard,
    HandHeart,
    ReceiptText,
    Users,
    UserRoundCheck,
    TrendingUp,
    ChartNoAxesCombined,
    Boxes,
    Files,
    Armchair,
    Bot,
} from "lucide-react";


// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/administration/home/AdminOverview.css";


// =========================================================
// MÓDULOS ADMINISTRATIVOS COMPARTIDOS
// =========================================================

// Estos módulos se mostrarán en los paneles:
//
// - admin
// - super_admin
//
// Las rutas son relativas al panel administrativo.
//
// available:
// true  = módulo implementado.
// false = módulo pendiente de implementación.

const administrativeModules = [

    // -----------------------------------------------------
    // EVENTOS
    // -----------------------------------------------------

    {
        id: "events",

        title: "Eventos",

        description:
            "Crea, modifica y organiza las actividades publicadas para la comunidad.",

        icon: CalendarDays,

        path: "/eventos",

        available: true,
    },


    // -----------------------------------------------------
    // PETICIONES DE ORACIÓN
    // -----------------------------------------------------

    {
        id: "prayer-requests",

        title: "Peticiones de oración",

        description:
            "Consulta, organiza y realiza seguimiento de las peticiones de oración recibidas por la comunidad.",

        icon: HandHeart,

        path: "/peticiones-oracion",

        available: true,
    },


    // -----------------------------------------------------
    // MIEMBROS
    // -----------------------------------------------------

    {
        id: "members",

        title: "Miembros",

        description:
            "Consulta la información de los miembros registrados de la iglesia.",

        icon: Users,

        path: "/miembros",

        available: true,
    },


    // -----------------------------------------------------
    // VOLUNTARIOS
    // -----------------------------------------------------

    {
        id: "volunteers",

        title: "Voluntarios",

        description:
            "Organiza los equipos de servicio, asigna responsabilidades y gestiona los turnos y confirmaciones de los voluntarios.",

        icon: UserRoundCheck,

        path: "/voluntarios",

        available: true,
    },


    // -----------------------------------------------------
    // RECURSOS
    // -----------------------------------------------------

    {
        id: "resources",

        title: "Recursos",

        description:
            "Administra los estudios, guías y materiales disponibles para la comunidad.",

        icon: BookOpen,

        path: "/recursos",

        available: true,
    },


    // -----------------------------------------------------
    // RECOMENDADOS
    // -----------------------------------------------------

    {
        id: "recommendations",

        title: "Recomendados",

        description:
            "Administra libros, música, películas, series y otros contenidos recomendados para la comunidad.",

        icon: Clapperboard,

        path: "/recomendados",

        available: true,
    },


    // =====================================================
    // PÁGINAS INFORMATIVAS
    // =====================================================

    {
        id: "informational-pages",

        title: "Páginas informativas",

        description:
            "Administra las páginas institucionales, información para visitantes, términos y condiciones y políticas del sitio web.",

        icon: Files,

        path: "/paginas-informativas",

        available: true,
    },



    // =====================================================
    // MÓDULOS FINANCIEROS
    // =====================================================


    // -----------------------------------------------------
    // INGRESOS
    // -----------------------------------------------------

    {
        id: "incomes",

        title: "Ingresos",

        description:
            "Registra, consulta y administra los ingresos, diezmos, ofrendas y donaciones recibidos por la iglesia.",

        icon: TrendingUp,

        path: "/finanzas/ingresos",

        available: true,
    },


    // -----------------------------------------------------
    // GASTOS
    // -----------------------------------------------------

    {
        id: "expenses",

        title: "Gastos",

        description:
            "Registra, consulta y administra los gastos asociados a las actividades y necesidades de la iglesia.",

        icon: ReceiptText,

        path: "/finanzas/gastos",

        available: true,
    },


    // -----------------------------------------------------
    // FINANZAS - RESUMEN GENERAL
    // -----------------------------------------------------

    {
        id: "finances",

        title: "Finanzas",

        description:
            "Visualiza el balance general, los ingresos, gastos y principales indicadores financieros de la iglesia.",

        icon: ChartNoAxesCombined,

        path: "/finanzas",

        // Se habilitará cuando construyamos
        // el módulo de resumen financiero.

        available: true,
    },

    // =========================================================
    // INSUMOS BÁSICOS
    // =========================================================

    // Módulo destinado a la gestión de los recursos físicos
    // utilizados habitualmente por la iglesia.
    //
    // Se mantiene separado de "Recursos", que corresponde
    // a los materiales digitales y de estudio.

    {
        id: "basic-supplies",

        title: "Insumos básicos",

        description:
            "Gestiona alimentos, artículos de aseo, materiales educativos, existencias y necesidades de reposición de la iglesia.",

        icon: Boxes,

        path: "/insumos-basicos",

        available: true,
    },

    // =========================================================
    // INVENTARIO DE BIENES
    // =========================================================

    // Módulo destinado al registro y control de bienes
    // reutilizables pertenecientes a la iglesia.
    //
    // Se mantiene independiente de Insumos básicos,
    // que administra productos de consumo y reposición.

    {
        id: "belongings",

        title: "Inventario de Bienes",

        description:
            "Administra mobiliario, equipos, instrumentos musicales, Biblias y otros bienes de la iglesia, incluyendo su ubicación, estado y movimientos.",

        icon: Armchair,

        path: "/inventario-bienes",

        available: true,
    },

    // =========================================================
    // ASISTENTE INTELIGENTE MARTÍN
    // =========================================================

    // Módulo destinado a la administración del asistente
    // virtual de Iglesia El Ancla.
    //
    // Permite configurar sus funcionalidades, administrar
    // las fuentes de conocimiento autorizadas, establecer
    // restricciones y supervisar su actividad.
    //
    // La integración con GPT se realizará posteriormente.

    {
        id: "martin",

        title: "Gestión de Martín",

        description:
            "Configura y supervisa al asistente virtual Martín, sus funciones, contenidos autorizados y medidas de seguridad.",

        icon: Bot,

        path: "/asistente-martin",

        available: true,
    },

];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

// Este componente es compartido por los paneles:
//
// - admin
// - super_admin

function AdminOverview() {

    // =====================================================
    // IDENTIFICACIÓN DEL PANEL
    // =====================================================

    const location = useLocation();


    // -----------------------------------------------------
    // DETECTAR SUPERADMINISTRADOR
    // -----------------------------------------------------

    const isSuperAdminPanel =

        location.pathname === "/super-admin" ||

        location.pathname.startsWith(
            "/super-admin/"
        );


    // -----------------------------------------------------
    // DEFINIR RUTA BASE
    // -----------------------------------------------------

    const adminBasePath = isSuperAdminPanel

        ? "/super-admin"

        : "/admin";


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (

        <section className="super-admin-management">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="super-admin-management__header">

                <div>

                    <span className="super-admin-management__eyebrow">
                        Administración
                    </span>

                    <h2>
                        Gestión de la iglesia
                    </h2>

                    <p>
                        Accede a las principales herramientas
                        para organizar la información y los
                        servicios de la comunidad.
                    </p>

                </div>

            </div>


            {/* =========================================== */}
            {/* TARJETAS DE MÓDULOS */}
            {/* =========================================== */}

            <div className="super-admin-management__grid">

                {administrativeModules.map((module) => {

                    // -------------------------------------
                    // OBTENER ICONO
                    // -------------------------------------

                    const ModuleIcon = module.icon;


                    // -------------------------------------
                    // CONSTRUIR RUTA COMPLETA
                    // -------------------------------------

                    // Ejemplos:
                    //
                    // /admin/finanzas/ingresos
                    // /super-admin/finanzas/ingresos

                    const modulePath =
                        `${adminBasePath}${module.path}`;


                    // -------------------------------------
                    // COMPROBAR DISPONIBILIDAD
                    // -------------------------------------

                    const isAvailable =
                        module.available;


                    // =====================================
                    // MÓDULO DISPONIBLE
                    // =====================================

                    if (isAvailable) {

                        return (

                            <Link
                                className="super-admin-management-card"
                                to={modulePath}
                                key={module.id}
                            >

                                {/* ======================= */}
                                {/* ICONO */}
                                {/* ======================= */}

                                <div className="super-admin-management-card__icon">

                                    <ModuleIcon
                                        size={23}
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                    />

                                </div>


                                {/* ======================= */}
                                {/* INFORMACIÓN */}
                                {/* ======================= */}

                                <div className="super-admin-management-card__content">

                                    <strong>
                                        {module.title}
                                    </strong>

                                    <span>
                                        {module.description}
                                    </span>

                                </div>


                                {/* ======================= */}
                                {/* FLECHA */}
                                {/* ======================= */}

                                <ArrowRight
                                    className="super-admin-management-card__arrow"
                                    size={18}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />

                            </Link>

                        );

                    }


                    // =====================================
                    // MÓDULO PENDIENTE
                    // =====================================

                    return (

                        <button
                            className="
                                super-admin-management-card
                                super-admin-management-card--disabled
                            "
                            type="button"
                            disabled
                            key={module.id}
                        >

                            {/* =========================== */}
                            {/* ICONO */}
                            {/* =========================== */}

                            <div className="super-admin-management-card__icon">

                                <ModuleIcon
                                    size={23}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                            </div>


                            {/* =========================== */}
                            {/* INFORMACIÓN */}
                            {/* =========================== */}

                            <div className="super-admin-management-card__content">

                                <strong>
                                    {module.title}
                                </strong>

                                <span>
                                    Disponible próximamente
                                </span>

                            </div>

                        </button>

                    );

                })}

            </div>

        </section>

    );

}

export default AdminOverview;