// =========================================================
// ENCABEZADO DE FINANZAS - IGLESIA EL ANCLA
// Descargas de solo lectura: no modifican los movimientos.
// =========================================================

import { Wallet, FileText, FileSpreadsheet, RefreshCw } from "lucide-react";
import "../../../styles/components/administration/finances/FinanceHeader.css";

function FinanceHeader({ onDownloadPdf, onDownloadExcel, onRefresh, downloading = "", disabled = false }) {
    return (
        <section className="finance-header">
            <div className="finance-header__content">
                <div className="finance-header__identity">
                    <div className="finance-header__icon">
                        <Wallet size={28} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div className="finance-header__information">
                        <span className="finance-header__eyebrow">Cuidamos los recursos de nuestra comunidad</span>
                        <h1 className="finance-header__title">Resumen financiero</h1>
                        <p className="finance-header__description">
                            Aquí puedes conocer cuánto hemos recibido, cuánto hemos utilizado
                            y cómo se han distribuido los recursos de nuestra iglesia.
                        </p>
                    </div>
                </div>

                {/* Descargar no necesita permisos de edición, solo acceso a este resumen. */}
                <div className="finance-header__downloads" aria-label="Descargar resumen financiero">
                    <button type="button" className="finance-header__download"
                        onClick={onDownloadPdf} disabled={disabled || Boolean(downloading)}>
                        <FileText size={17} aria-hidden="true" />
                        {downloading === "pdf" ? "Preparando PDF..." : "Descargar PDF"}
                    </button>
                    <button type="button" className="finance-header__download finance-header__download--excel"
                        onClick={onDownloadExcel} disabled={disabled || Boolean(downloading)}>
                        <FileSpreadsheet size={17} aria-hidden="true" />
                        {downloading === "excel" ? "Preparando Excel..." : "Descargar Excel"}
                    </button>
                    <button type="button" className="finance-header__refresh"
                        onClick={onRefresh} disabled={disabled || Boolean(downloading)}
                        title="Actualizar el resumen" aria-label="Actualizar el resumen">
                        <RefreshCw size={17} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default FinanceHeader;
