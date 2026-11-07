

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

function ResourcesSummary({ resources = [], externalCounts = {} }) {

    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    const summary = useMemo(() => {

        // Biblioteca y Cancionero manejan sus propias colecciones y API.
        const externalTotal = (externalCounts.solidarity_library ?? 0) +
            (externalCounts.songbook ?? 0);

        const externalReady = Number.isSafeInteger(externalCounts.solidarity_library) &&
            Number.isSafeInteger(externalCounts.songbook);
        const total = externalReady ? resources.length + externalTotal : "—";

        // Un contenido original continúa publicado aunque tenga cambios sin publicar.
        const published = externalReady ? resources.filter(
            (resource) => resource.hasPublishedVersion || resource.status === "published"
        ).length + externalTotal : "—";

        // La cifra de borradores cuenta ediciones pendientes y materiales inéditos.
        const drafts = resources.filter(
            (resource) => resource.status === "draft"
        ).length;

        return {
            total,
            published,
            drafts,
        };

    }, [resources, externalCounts]);

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



