
import { useEffect } from "react";

import PrivacyEditable from "../../components/administration/informationalPages/Privacy/PrivacyEditable";

import privacyDemoData from "../../data/informationalPages/privacyDemoData";

import "../../styles/pages/public/TermsAndConditions.css";

// =========================================================
// PÁGINA PÚBLICA - POLÍTICA DE PRIVACIDAD
// =========================================================

function PrivacyPolicy() {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="terms-public-page">
            <PrivacyEditable
                content={privacyDemoData}
                isPreview={true}
            />
        </main>
    );
}

export default PrivacyPolicy;
