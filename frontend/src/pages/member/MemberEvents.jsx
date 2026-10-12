
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    MapPin,
} from "lucide-react";

import EventAttendanceCard from "../../components/member/events/EventAttendanceCard";

import "../../styles/pages/member/MemberEvents.css";

// =========================================================
// EVENTOS TEMPORALES
// =========================================================

const DEMO_MEMBER_EVENTS = [
    {
        id: "EVT-004",
        title: "Encuentro de jóvenes",
        date: "2026-10-17",
        time: "18:00",
        location: "Iglesia El Ancla",
        modality: "Presencial",
        requiresConfirmation: true,
    },
    {
        id: "EVT-005",
        title: "Taller para niños",
        date: "2026-10-24",
        time: "16:00",
        location: "Iglesia El Ancla",
        modality: "Presencial",
        requiresConfirmation: true,
    },
];

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MemberEvents() {

    // =========================================================
    // NAVEGACIÓN
    // =========================================================

    const navigate = useNavigate();

    // Regresa a la página anterior del historial.
    // No depende del rol del usuario.
    function handleGoBack() {
        navigate(-1);
    }

    // =========================================================
    // CONFIRMACIONES TEMPORALES
    // =========================================================

    // Almacena las confirmaciones realizadas
    // durante la sesión actual del componente.
    const [confirmedEventIds, setConfirmedEventIds] =
        useState([]);

    // Confirma la participación en un evento.
    function handleConfirm(event) {
        setConfirmedEventIds((previous) => {

            // Evitamos registrar confirmaciones duplicadas.
            if (previous.includes(event.id)) {
                return previous;
            }

            return [...previous, event.id];
        });
    }

    // Cancela la confirmación de participación.
    function handleCancel(event) {
        setConfirmedEventIds((previous) =>
            previous.filter((id) => id !== event.id)
        );
    }

    // =========================================================
    // INTERFAZ
    // =========================================================

    return (
        <main className="member-events-page">

            {/* ============================================= */}
            {/* NAVEGACIÓN DE REGRESO */}
            {/* ============================================= */}

            <div className="member-events-page__navigation">
                <button
                    type="button"
                    className="member-events-page__back"
                    onClick={handleGoBack}
                >
                    <ArrowLeft
                        size={17}
                        strokeWidth={2}
                        aria-hidden="true"
                    />

                    <span>Volver</span>
                </button>
            </div>

            {/* ============================================= */}
            {/* ENCABEZADO */}
            {/* ============================================= */}

            <header className="member-events-page__header">
                <span>MI COMUNIDAD</span>

                <h1>Mis actividades</h1>

                <p>
                    Conoce las próximas actividades de Iglesia
                    El Ancla y administra tu participación.
                </p>
            </header>

            {/* ============================================= */}
            {/* AVISO DE DEMOSTRACIÓN */}
            {/* ============================================= */}

            <div className="member-events-page__notice">
                Vista de demostración. Las confirmaciones
                todavía no se guardan de forma permanente.
            </div>

            {/* ============================================= */}
            {/* LISTADO DE ACTIVIDADES */}
            {/* ============================================= */}

            <section className="member-events-page__grid">
                {DEMO_MEMBER_EVENTS.map((event) => (
                    <article
                        className="member-events-page__event"
                        key={event.id}
                    >
                        <div className="member-events-page__event-info">

                            <span className="member-events-page__category">
                                ACTIVIDAD DE LA COMUNIDAD
                            </span>

                            <h2>{event.title}</h2>

                            <p>
                                <CalendarDays
                                    size={17}
                                    aria-hidden="true"
                                />

                                {event.date} · {event.time} hrs
                            </p>

                            <p>
                                <MapPin
                                    size={17}
                                    aria-hidden="true"
                                />

                                {event.location}
                            </p>
                        </div>

                        <EventAttendanceCard
                            event={event}
                            isConfirmed={confirmedEventIds.includes(
                                event.id
                            )}
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                        />
                    </article>
                ))}
            </section>
        </main>
    );
}

export default MemberEvents;
