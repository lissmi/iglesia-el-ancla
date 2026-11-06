// =========================================================
// INFORMACIÓN PARA LA COMUNIDAD - IGLESIA EL ANCLA
// Usamos palabras sencillas para acompañar las cifras.
// =========================================================

import { ShieldCheck, Eye, LockKeyhole, HeartHandshake, Info } from "lucide-react";
import "../../../styles/components/administration/finances/FinanceTransparency.css";

function FinanceTransparency() {
    return (
        <section className="finance-transparency">
            <div className="finance-transparency__header">
                <div className="finance-transparency__main-icon">
                    <ShieldCheck size={26} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span className="finance-transparency__eyebrow">Compromiso con nuestra comunidad</span>
                <h2>Transparencia financiera</h2>
                <p>
                    Cada aporte es valioso. Queremos compartir con claridad cómo
                    cuidamos y utilizamos los recursos que recibimos como iglesia.
                </p>
            </div>
            <div className="finance-transparency__items">
                <div className="finance-transparency__item">
                    <div className="finance-transparency__item-icon"><Eye size={19} aria-hidden="true" /></div>
                    <div>
                        <h3>Cuentas claras</h3>
                        <p>Puedes conocer cuánto hemos recibido, cuánto se ha gastado y cuál es el resultado del período.</p>
                    </div>
                </div>
                <div className="finance-transparency__item">
                    <div className="finance-transparency__item-icon"><LockKeyhole size={19} aria-hidden="true" /></div>
                    <div>
                        <h3>Respeto por la privacidad</h3>
                        <p>Compartimos los totales generales sin mostrar nombres, datos personales ni comprobantes privados.</p>
                    </div>
                </div>
                <div className="finance-transparency__item">
                    <div className="finance-transparency__item-icon"><HeartHandshake size={19} aria-hidden="true" /></div>
                    <div>
                        <h3>Recursos al servicio de todos</h3>
                        <p>Este resumen nos ayuda a comprender cómo se apoyan las actividades y necesidades de nuestra comunidad.</p>
                    </div>
                </div>
            </div>
            <div className="finance-transparency__notice">
                <Info size={18} aria-hidden="true" />
                <p>
                    Este es un resumen general. Los detalles de cada ingreso y gasto
                    se mantienen protegidos y solo pueden consultarlos las personas autorizadas.
                </p>
            </div>
        </section>
    );
}

export default FinanceTransparency;
