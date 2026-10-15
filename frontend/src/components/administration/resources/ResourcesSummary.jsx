
import { useMemo } from "react";

import {
    LibraryBig,
    CircleCheck,
    FilePenLine,
} from "lucide-react";

import "../../../styles/components/administration/resources/ResourcesSummary.css";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ResourcesSummary({ resources = [] }) {

    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    const summary = useMemo(() => {

        const total = resources.length;

        const published = resources.filter(
            (resource) => resource.status === "published"
        ).length;

        const drafts = resources.filter(
            (resource) => resource.status === "draft"
        ).length;

        return {
            total,
            published,
            drafts,
        };

    }, [resources]);

    // =====================================================
    // TARJETAS
    // =====================================================

    const cards = [
        {
            id: "total",
            label: "Total de recursos",
            description: "Contenidos registrados",
            value: summary.total,
            icon: LibraryBig,
        },
        {
            id: "published",
            label: "Publicados",
            description: "Disponibles para los miembros",
            value: summary.published,
            icon: CircleCheck,
        },
        {
            id: "drafts",
            label: "Borradores",
            description: "Pendientes de publicación",
            value: summary.drafts,
            icon: FilePenLine,
        },
    ];

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="resources-summary"
            aria-label="Resumen de recursos"
        >

            {cards.map((card) => {

                const Icon = card.icon;

                return (
                    <article
                        className="resources-summary__card"
                        key={card.id}
                    >

                        <div className="resources-summary__icon">
                            <Icon
                                size={21}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </div>

                        <span className="resources-summary__label">
                            {card.label}
                        </span>

                        <strong className="resources-summary__value">
                            {card.value}
                        </strong>

                        <small className="resources-summary__description">
                            {card.description}
                        </small>

                    </article>
                );
            })}

        </section>
    );
}

export default ResourcesSummary;
