
import {
    TrendingUp,
    Clock3,
    AlertTriangle,
    ShoppingCart,
    Info,
} from "lucide-react";

import "../../../styles/components/administration/basicSupplies/BasicSuppliesForecast.css";

// =========================================================
// FORMATO DE FECHAS
// =========================================================

const formatDate = (date) => {

    return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);

};

// =========================================================
// COMPONENTE DE PREDICCIONES
// =========================================================

function BasicSuppliesForecast({
    movementHistory = [],
}) {

    return (

        <section className="basic-supplies__panel">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="basic-supplies__panel-header">

                <div>

                    <h2>
                        Predicción de abastecimiento
                    </h2>

                    <p>
                        Planificación futura basada
                        en el historial de consumo.
                    </p>

                </div>

                <span className="basic-supplies__count">
                    Próxima funcionalidad
                </span>

            </div>

            {/* =========================================== */}
            {/* PRESENTACIÓN DE PREDICCIONES */}
            {/* =========================================== */}

            <div className="basic-supplies__forecast">

                <div className="basic-supplies__forecast-icon">

                    <TrendingUp
                        size={34}
                        aria-hidden="true"
                    />

                </div>

                <h3>
                    Predicciones basadas en datos reales
                </h3>

                <p>
                    A medida que los administradores
                    registren entradas y consumos,
                    el sistema podrá analizar cuánto
                    duran los insumos y estimar
                    cuándo será necesario reponerlos.
                </p>

                <div className="basic-supplies__forecast-features">

                    <div>
                        <Clock3 size={19} />

                        <span>
                            Estimación de días restantes
                        </span>
                    </div>

                    <div>
                        <AlertTriangle size={19} />

                        <span>
                            Alertas de reposición anticipada
                        </span>
                    </div>

                    <div>
                        <ShoppingCart size={19} />

                        <span>
                            Sugerencias para próximas compras
                        </span>
                    </div>

                </div>

                <div className="basic-supplies__forecast-notice">

                    <Info
                        size={17}
                        aria-hidden="true"
                    />

                    <span>
                        Todavía no hay historial suficiente
                        para realizar estimaciones confiables.
                        Los movimientos registrados durante
                        esta demostración no se conservan
                        al recargar la página.
                    </span>

                </div>

            </div>

            {/* =========================================== */}
            {/* HISTORIAL TEMPORAL DE MOVIMIENTOS */}
            {/* =========================================== */}

            {movementHistory.length > 0 && (

                <div className="basic-supplies__history">

                    <h3>
                        Movimientos de esta sesión
                    </h3>

                    {movementHistory.map((movement) => (

                        <div
                            key={movement.id}
                            className="basic-supplies__history-item"
                        >

                            <div>

                                <strong>
                                    {movement.supplyName}
                                </strong>

                                <span>
                                    {formatDate(movement.date)}
                                </span>

                            </div>

                            <span>
                                {movement.type === "income"
                                    ? "+"
                                    : "-"}
                                {movement.quantity}
                                {" "}
                                {movement.unit}
                            </span>

                        </div>

                    ))}

                </div>

            )}

        </section>

    );
}

export default BasicSuppliesForecast;
