
import { useLocation, useNavigate } from "react-router-dom";

import { useBelongings } from "../../../context/belongings/BelongingsContext";

import {
    ArrowLeft,
    ArrowLeftRight,
    ArrowRight,
    Boxes,
    ClipboardList,
    FolderOpen,
    MapPin,
    Package,
} from "lucide-react";

import {
    belongingsMovementTypes,
} from "../../../data/belongings/belongingsDemoData";

import "../../../styles/pages/administration/belongings/BelongingsDashboard.css";

// =========================================================
// INVENTARIO DE BIENES - PANEL PRINCIPAL
// IGLESIA EL ANCLA
// =========================================================

function BelongingsDashboard() {

    const navigate = useNavigate();
    const location = useLocation();

    // =====================================================
    // DATOS COMPARTIDOS DEL INVENTARIO
    // =====================================================

    const {
        belongings,
        movements,
        statistics: inventoryStatistics,
    } = useBelongings();

    // =====================================================
    // IDENTIFICAR EL PANEL ADMINISTRATIVO ACTUAL
    // =====================================================

    const basePath = location.pathname.startsWith(
        "/super-admin"
    )
        ? "/super-admin"
        : "/admin";

    // =====================================================
    // ESTADÍSTICAS DEL INVENTARIO
    // =====================================================

    const totalRecords =
        inventoryStatistics.totalRecords;

    const totalUnits =
        inventoryStatistics.totalUnits;

    const categoriesInUse =
        inventoryStatistics.totalCategories;

    const totalMovements =
        inventoryStatistics.totalMovements;

    // =====================================================
    // TARJETAS ESTADÍSTICAS
    // =====================================================

    const statistics = [
        {
            id: "records",
            title: "Bienes registrados",
            value: totalRecords,
            description: "Registros en el inventario",
            icon: Boxes,
        },
        {
            id: "units",
            title: "Unidades totales",
            value: totalUnits,
            description: "Unidades físicas registradas",
            icon: Package,
        },
        {
            id: "categories",
            title: "Categorías utilizadas",
            value: categoriesInUse,
            description: "Clasificaciones con bienes",
            icon: FolderOpen,
        },
        {
            id: "movements",
            title: "Movimientos",
            value: totalMovements,
            description: "Registros en el historial",
            icon: ArrowLeftRight,
        },
    ];

    // =====================================================
    // ACCESOS RÁPIDOS
    // =====================================================

    const quickActions = [
        {
            id: "inventory",
            title: "Ver inventario",
            description:
                "Consulta los bienes registrados, sus cantidades y estados.",
            icon: ClipboardList,
            path: `${basePath}/inventario-bienes/inventario`,
        },
        {
            id: "movements",
            title: "Movimientos",
            description:
                "Consulta y administra los traslados, inspecciones y registros del inventario.",
            icon: ArrowLeftRight,
            path: `${basePath}/inventario-bienes/movimientos`,
        },

    ];

    // =====================================================
    // MOVIMIENTOS RECIENTES
    // =====================================================

    const recentMovements = [...movements]
        .sort((first, second) =>
            second.date.localeCompare(first.date)
        )
        .slice(0, 4);

    // =====================================================
    // OBTENER NOMBRE DEL BIEN
    // =====================================================

    const getBelongingName = (belongingId) => {

        const belonging = belongings.find(
            (item) => item.id === belongingId
        );

        return belonging?.name || "Bien no encontrado";
    };

    // =====================================================
    // FORMATEAR FECHA
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "Sin fecha";
        }

        const parsedDate = new Date(
            `${date}T12:00:00`
        );

        if (Number.isNaN(parsedDate.getTime())) {
            return "Fecha inválida";
        }

        return parsedDate.toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div className="belongings-dashboard">

            <button
                type="button"
                className="belongings-dashboard__back"
                onClick={() => navigate(basePath)}
                aria-label="Volver al panel administrativo"
            >
                <ArrowLeft size={17} />
                Volver al panel administrativo
            </button>

            {/* ========================================= */}
            {/* ENCABEZADO */}
            {/* ========================================= */}

            <header className="belongings-dashboard__header">



                <div className="belongings-dashboard__heading">



                    <span className="belongings-dashboard__eyebrow">
                        Administración de bienes
                    </span>

                    <h1>
                        Inventario de <span>Bienes</span>
                    </h1>

                    <p>
                        Gestiona el mobiliario, equipamiento
                        y materiales reutilizables de
                        Iglesia El Ancla.
                    </p>

                </div>

                <div className="belongings-dashboard__header-icon">
                    <Boxes
                        size={28}
                        strokeWidth={1.7}
                    />
                </div>

            </header>

            {/* ========================================= */}
            {/* INDICADORES */}
            {/* ========================================= */}

            <section
                className="belongings-dashboard__section"
                aria-labelledby="belongings-stats-title"
            >

                <div className="belongings-dashboard__section-heading">

                    <div>

                        <h2 id="belongings-stats-title">
                            Resumen general
                        </h2>

                        <p>
                            Estado actual del inventario registrado.
                        </p>

                    </div>

                </div>

                <div className="belongings-dashboard__stats">

                    {statistics.map((statistic) => {

                        const Icon = statistic.icon;

                        return (
                            <article
                                key={statistic.id}
                                className="belongings-dashboard__stat"
                            >

                                <div className="belongings-dashboard__stat-top">

                                    <span className="belongings-dashboard__stat-icon">

                                        <Icon
                                            size={21}
                                            strokeWidth={1.8}
                                        />

                                    </span>

                                </div>

                                <strong className="belongings-dashboard__stat-value">
                                    {statistic.value.toLocaleString("es-CL")}
                                </strong>

                                <h3>
                                    {statistic.title}
                                </h3>

                                <p>
                                    {statistic.description}
                                </p>

                            </article>
                        );
                    })}

                </div>

            </section>

            {/* ========================================= */}
            {/* ACCESOS RÁPIDOS */}
            {/* ========================================= */}

            <section
                className="belongings-dashboard__section"
                aria-labelledby="belongings-actions-title"
            >

                <div className="belongings-dashboard__section-heading">

                    <div>

                        <h2 id="belongings-actions-title">
                            Accesos rápidos
                        </h2>

                        <p>
                            Selecciona la gestión que deseas realizar.
                        </p>

                    </div>

                </div>

                <div className="belongings-dashboard__actions">

                    {quickActions.map((action) => {

                        const Icon = action.icon;

                        return (
                            <button
                                key={action.id}
                                type="button"
                                className="belongings-dashboard__action"
                                onClick={() =>
                                    navigate(action.path)
                                }
                            >

                                <span className="belongings-dashboard__action-icon">

                                    <Icon
                                        size={23}
                                        strokeWidth={1.8}
                                    />

                                </span>

                                <span className="belongings-dashboard__action-body">

                                    <strong>
                                        {action.title}
                                    </strong>

                                    <span>
                                        {action.description}
                                    </span>

                                </span>

                                <ArrowRight
                                    className="belongings-dashboard__action-arrow"
                                    size={18}
                                />

                            </button>
                        );
                    })}

                </div>

            </section>

            {/* ========================================= */}
            {/* MOVIMIENTOS RECIENTES */}
            {/* ========================================= */}

            <section
                className="belongings-dashboard__section"
                aria-labelledby="belongings-movements-title"
            >

                <div className="belongings-dashboard__section-heading">

                    <div>

                        <h2 id="belongings-movements-title">
                            Movimientos recientes
                        </h2>

                        <p>
                            Últimas actividades registradas en el inventario.
                        </p>

                    </div>

                </div>

                <div className="belongings-dashboard__activity">

                    {recentMovements.length === 0 ? (

                        <div className="belongings-dashboard__empty">

                            <ClipboardList size={30} />

                            <p>
                                Todavía no hay movimientos registrados.
                            </p>

                        </div>

                    ) : (

                        recentMovements.map((movement) => (

                            <article
                                key={movement.id}
                                className="belongings-dashboard__movement"
                            >

                                <span className="belongings-dashboard__movement-icon">

                                    <ArrowLeftRight size={18} />

                                </span>

                                <div className="belongings-dashboard__movement-info">

                                    <strong>
                                        {getBelongingName(
                                            movement.belongingId
                                        )}
                                    </strong>

                                    <p>
                                        {belongingsMovementTypes[
                                            movement.type
                                        ] || movement.type}

                                        {" · "}

                                        {movement.description}
                                    </p>

                                </div>

                                <time
                                    dateTime={movement.date}
                                    className="belongings-dashboard__movement-date"
                                >
                                    {formatDate(movement.date)}
                                </time>

                            </article>

                        ))

                    )}

                </div>

            </section>

            {/* ========================================= */}
            {/* INFORMACIÓN DE DESARROLLO */}
            {/* ========================================= */}

            <div className="belongings-dashboard__notice">

                <MapPin size={17} />

                <p>
                    Este módulo utiliza datos de demostración.
                    Los registros reales se conectarán a la
                    base de datos en una etapa posterior.
                </p>

            </div>

        </div>
    );
}

export default BelongingsDashboard;
