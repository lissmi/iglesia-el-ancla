
import TermsEditable from "../Terms/TermsEditable";

// =========================================================
// POLÍTICA DE PRIVACIDAD - EDITOR VISUAL
// =========================================================

function PrivacyEditable({
    content,
    onChange,
    isPreview = false,
}) {
    return (
        <TermsEditable
            content={content}
            onChange={onChange}
            isPreview={isPreview}
        />
    );
}

export default PrivacyEditable;
