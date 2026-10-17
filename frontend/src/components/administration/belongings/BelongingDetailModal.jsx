
import { useEffect, useRef } from "react";

import {
    CalendarDays,
    ClipboardList,
    MapPin,
    Package,
    Pencil,
    UserRound,
    X,
} from "lucide-react";

import {
    belongingsCategories,
    belongingsConditions,
    belongingsLocations,
    belongingsTrackingTypes,
} from "../../../data/belongings/belongingsDemoData";

import "../../../styles/components/administration/belongings/BelongingDetailModal.css";

// =========================================================
// DETALLE DE UN BIEN
// IGLESIA EL ANCLA
// =========================================================

const acquisitionLabels = {
    purchase: "Compra",
    donation: "Donación",
    other: "Otro",
};

function BelongingDetailModal({
    isOpen,
    belonging,
    onClose,
    onEdit,
}) {
    const closeButtonRef = useRef(null);

    // =====================================================
    // CONTROL DE TECLADO Y DESPLAZAMIENTO
    // =====================================================

    useEffect(() => {
        if (!isOpen || !belonging) return;

        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement;

        document.body.style.overflow = "hidden";
        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
            previousFocus?.focus?.();
        };
    }, [isOpen, belonging, onClose]);

    if (!isOpen || !belonging) return null;

    // =====================================================
    // OBTENER ETIQUETAS
    // =====================================================

    const category = belongingsCategories.find(
        (item) => item.id === belonging.categoryId
    );

    const location = belongingsLocations.find(
        (item) => item.id === belonging.locationId
    );

    const condition = belongingsConditions.find(
        (item) => item.value === belonging.condition
    );

    const trackingType = belongingsTrackingTypes.find(
        (item) => item.value === belonging.trackingType
    );

    // =====================================================
    // FORMATEAR FECHA SIN CAMBIOS DE ZONA HORARIA
    // =====================================================

    const formatDate = (value) => {
        if (!value) return "No registrada";

        const [year, month, day] = value.split("-");

        if (!year || !month || !day) {
            return "No registrada";
        }

        return `${day}/${month}/${year}`;
    };

    // =====================================================
    // CAMPOS DEL DETALLE
    // =====================================================

    const details = [
        {
            label: "Categoría",
            value: category?.name || "Sin categoría",
            icon: ClipboardList,
        },
        {
            label: "Ubicación",
            value: location?.name || "Sin ubicación",
            icon: MapPin,
        },
        {
            label: "Cantidad",
            value: `${belonging.quantity} ${
                belonging.quantity === 1 ? "unidad" : "unidades"
            }`,
            icon: Package,
        },
        {
            label: "Tipo de control",
            value: trackingType?.label || "No especificado",
            icon: Package,
        },
        {
            label: "Tipo de adquisición",
            value:
                acquisitionLabels[belonging.acquisitionType] ||
                "No especificado",
            icon: ClipboardList,
        },
        {
            label: "Fecha de adquisición",
            value: formatDate(belonging.acquisitionDate),
            icon: CalendarDays,
        },
        {
            label: "Responsable",
            value: belonging.responsible || "No asignado",
            icon: UserRound,
        },
    ];

    return (
        <div
            className="belonging-detail-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <section
                className="belonging-detail-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="belonging-detail-title"
            >

                {/* ===================================== */}
                {/* ENCABEZADO */}
                {/* ===================================== */}

                <header className="belonging-detail-modal__header">

                    <div className="belonging-detail-modal__heading">

                        <div className="belonging-detail-modal__icon">
                            <Package size={24} strokeWidth={1.7} />
                        </div>

                        <div>
                            <span className="belonging-detail-modal__code">
                                {belonging.code}
                            </span>

                            <h2 id="belonging-detail-title">
                                {belonging.name}
                            </h2>

                            <span
                                className={`belonging-detail-modal__condition belonging-detail-modal__condition--${belonging.condition}`}
                            >
                                {condition?.label || "Sin estado"}
                            </span>
                        </div>

                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="belonging-detail-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar detalle"
                    >
                        <X size={21} />
                    </button>

                </header>

                {/* ===================================== */}
                {/* CONTENIDO */}
                {/* ===================================== */}

                <div className="belonging-detail-modal__body">

                    <h3>Información general</h3>

                    <div className="belonging-detail-modal__grid">

                        {details.map((detail) => {
                            const DetailIcon = detail.icon;

                            return (
                                <div
                                    className="belonging-detail-modal__field"
                                    key={detail.label}
                                >
                                    <span className="belonging-detail-modal__field-label">
                                        <DetailIcon
                                            size={15}
                                            strokeWidth={1.8}
                                            aria-hidden="true"
                                        />
                                        {detail.label}
                                    </span>

                                    <strong>{detail.value}</strong>
                                </div>
                            );
                        })}

                    </div>

                    <div className="belonging-detail-modal__description">
                        <h3>Descripción y observaciones</h3>

                        <p>
                            {belonging.description ||
                                "No se han registrado observaciones para este bien."}
                        </p>
                    </div>

                </div>

                {/* ===================================== */}
                {/* ACCIONES */}
                {/* ===================================== */}

                <footer className="belonging-detail-modal__footer">

                    <button
                        type="button"
                        className="belonging-detail-modal__secondary"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>

                    <button
                        type="button"
                        className="belonging-detail-modal__primary"
                        onClick={() => onEdit?.(belonging)}
                        disabled={!onEdit}
                    >
                        <Pencil size={16} />
                        Editar bien
                    </button>

                </footer>

            </section>
        </div>
    );
}

export default BelongingDetailModal;
