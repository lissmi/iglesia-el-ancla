
import {
    Package,
    AlertTriangle,
    Clock3,
    RotateCcw,
} from "lucide-react";

import "../../../styles/components/administration/basicSupplies/BasicSuppliesSummary.css";

// =========================================================
// TARJETA DE INDICADOR
// =========================================================

function BasicSupplyMetric({
    title,
    value,
    description,
    icon: Icon,
    variant,
}) {

    return (

        <article
            className={`basic-supplies__metric basic-supplies__metric--${variant}`}
        >

            <div className="basic-supplies__metric-top">

                <span>{title}</span>

                <div className="basic-supplies__metric-icon">

                    <Icon
                        size={21}
                        aria-hidden="true"
                    />

                </div>

            </div>

            <strong>{value}</strong>

            <p>{description}</p>

        </article>

    );
}

// =========================================================
// RESUMEN DEL INVENTARIO
// =========================================================

// Los indicadores se reciben desde BasicSupplies.jsx.
// De esta manera, se actualizan automáticamente
// después de registrar entradas o consumos.

function BasicSuppliesSummary({ summary }) {

    return (

        <section
            className="basic-supplies__summary"
            aria-label="Resumen del inventario"
        >

            <BasicSupplyMetric
                title="Insumos registrados"
                value={summary.total}
                description="Productos del inventario"
                icon={Package}
                variant="total"
            />

            <BasicSupplyMetric
                title="Necesitan reposición"
                value={summary.needsAttention}
                description="Agotados o con stock bajo"
                icon={AlertTriangle}
                variant="warning"
            />

            <BasicSupplyMetric
                title="Insumos frecuentes"
                value={summary.frequent}
                description="Productos de uso habitual"
                icon={RotateCcw}
                variant="frequent"
            />

            <BasicSupplyMetric
                title="Agotados"
                value={summary.out}
                description="Sin unidades disponibles"
                icon={Clock3}
                variant="out"
            />

        </section>

    );
}

export default BasicSuppliesSummary;
