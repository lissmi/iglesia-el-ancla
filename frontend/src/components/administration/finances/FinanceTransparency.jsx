
import {
    ShieldCheck,
    Eye,
    LockKeyhole,
    HeartHandshake,
    Info,
} from "lucide-react";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/administration/finances/FinanceTransparency.css";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function FinanceTransparency() {

    return (

        <section className="finance-transparency">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="finance-transparency__header">

                <div className="finance-transparency__main-icon">
                    <ShieldCheck
                        size={26}
                        strokeWidth={1.8}
                    />
                </div>

                <span className="finance-transparency__eyebrow">
                    Compromiso con nuestra comunidad
                </span>

                <h2>
                    Transparencia financiera
                </h2>

                <p>
                    Creemos en una administración responsable
                    y transparente de los recursos que
                    contribuyen al desarrollo de nuestra iglesia.
                </p>

            </div>

            {/* =========================================== */}
            {/* PRINCIPIOS */}
            {/* =========================================== */}

            <div className="finance-transparency__items">

                <div className="finance-transparency__item">

                    <div className="finance-transparency__item-icon">
                        <Eye size={19} />
                    </div>

                    <div>

                        <h3>
                            Información clara
                        </h3>

                        <p>
                            Los miembros podrán consultar
                            resúmenes generales de ingresos,
                            gastos y balance financiero.
                        </p>

                    </div>

                </div>

                <div className="finance-transparency__item">

                    <div className="finance-transparency__item-icon">
                        <LockKeyhole size={19} />
                    </div>

                    <div>

                        <h3>
                            Protección de datos
                        </h3>

                        <p>
                            Los reportes públicos para miembros
                            no mostrarán datos personales,
                            donantes individuales ni detalles
                            administrativos sensibles.
                        </p>

                    </div>

                </div>

                <div className="finance-transparency__item">

                    <div className="finance-transparency__item-icon">
                        <HeartHandshake size={19} />
                    </div>

                    <div>

                        <h3>
                            Administración responsable
                        </h3>

                        <p>
                            La información financiera permitirá
                            comprender de manera general
                            cómo se distribuyen los recursos
                            de nuestra comunidad.
                        </p>

                    </div>

                </div>

            </div>

            {/* =========================================== */}
            {/* NOTA DE PRIVACIDAD */}
            {/* =========================================== */}

            <div className="finance-transparency__notice">

                <Info size={18} />

                <p>
                    Este módulo presenta información
                    consolidada. El acceso a registros
                    individuales y funciones administrativas
                    deberá estar restringido según los
                    permisos de cada usuario.
                </p>

            </div>

        </section>

    );
}

export default FinanceTransparency;
