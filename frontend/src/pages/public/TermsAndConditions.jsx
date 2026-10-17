
/* ========================================================= */
/* PÁGINA PÚBLICA - TÉRMINOS Y CONDICIONES */
/* IGLESIA EL ANCLA */
/* ========================================================= */

import { useEffect } from "react";

import TermsEditable from "../../components/administration/informationalPages/Terms/TermsEditable";

import termsDemoData from "../../data/informationalPages/termsDemoData";

import "../../styles/pages/public/TermsAndConditions.css";

function TermsAndConditions() {

    // =====================================================
    // POSICIONAR LA PÁGINA AL INICIO
    // =====================================================

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    }, []);

    return (
        <main className="terms-public-page">

            <TermsEditable
                content={termsDemoData}
                isPreview={true}
            />

        </main>
    );
}

export default TermsAndConditions;
