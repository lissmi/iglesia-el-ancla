// =========================================================
// IMPORTACIONES
// =========================================================

import {
    UsersRound,
    Plus,
    CalendarDays,
} from "lucide-react";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/volunteers/VolunteersHeader.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteersHeader({
    onCreateAssignment,
    onViewCalendar,
}) {

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <header className="volunteers-header">

            {/* =========================================== */}
            {/* INFORMACIÓN PRINCIPAL */}
            {/* =========================================== */}

            <div className="volunteers-header__content">

                <div className="volunteers-header__heading">

                    <div className="volunteers-header__icon">

                        <UsersRound
                            size={25}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />

                    </div>

                    <div className="volunteers-header__title-group">

                        <span className="volunteers-header__eyebrow">
                            Administración de servicios
                        </span>

                        <h1>
                            Gestión de Voluntarios
                        </h1>

                    </div>

                </div>

                <p className="volunteers-header__description">
                    Organiza los equipos de servicio, programa turnos,
                    asigna responsabilidades y supervisa las
                    confirmaciones de participación de los voluntarios
                    de la comunidad.
                </p>

            </div>


            {/* =========================================== */}
            {/* ACCIONES PRINCIPALES */}
            {/* =========================================== */}

            <div className="volunteers-header__actions">

                <button
                    className="volunteers-header__button volunteers-header__button--secondary"
                    type="button"
                    onClick={() => onViewCalendar?.()}
                    disabled={!onViewCalendar}
                >

                    <CalendarDays
                        size={18}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />

                    <span>
                        Ver calendario
                    </span>

                </button>


                <button
                    className="volunteers-header__button volunteers-header__button--primary"
                    type="button"
                    onClick={() => onCreateAssignment?.()}
                    disabled={!onCreateAssignment}
                >

                    <Plus
                        size={19}
                        strokeWidth={2}
                        aria-hidden="true"
                    />

                    <span>
                        Nueva asignación
                    </span>

                </button>

            </div>

        </header>
    );
}

export default VolunteersHeader;