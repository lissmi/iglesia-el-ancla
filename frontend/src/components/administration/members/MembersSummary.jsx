
import {
    Cake,
    Clock3,
    UserRoundCheck,
    UsersRound,
} from "lucide-react";

import "../../../styles/components/administration/members/MembersSummary.css";

// =========================================================
// CONFIGURACIÓN DE TARJETAS
// =========================================================

const SUMMARY_CARDS = [
    {
        id: "total",
        label: "Total de miembros",
        description: "Miembros registrados",
        icon: UsersRound,
    },
    {
        id: "active",
        label: "Miembros activos",
        description: "Con cuenta habilitada",
        icon: UserRoundCheck,
    },
    {
        id: "birthdays",
        label: "Cumpleaños del mes",
        description: "Celebraciones próximas o recientes",
        icon: Cake,
    },
    {
        id: "newMembers",
        label: "Nuevos miembros",
        description: "Registrados este mes",
        icon: Clock3,
    },
];

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MembersSummary({ summary = {} }) {

    return (
        <section
            className="members-summary"
            aria-label="Resumen de miembros"
        >

            {SUMMARY_CARDS.map((card) => {

                const Icon = card.icon;

                return (
                    <article
                        className="members-summary__card"
                        key={card.id}
                    >

                        {/* ICONO */}

                        <div className="members-summary__icon">
                            <Icon
                                size={21}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </div>

                        {/* INFORMACIÓN */}

                        <span className="members-summary__label">
                            {card.label}
                        </span>

                        <strong className="members-summary__value">
                            {summary[card.id] ?? 0}
                        </strong>

                        <small className="members-summary__description">
                            {card.description}
                        </small>

                    </article>
                );
            })}

        </section>
    );
}

export default MembersSummary;
