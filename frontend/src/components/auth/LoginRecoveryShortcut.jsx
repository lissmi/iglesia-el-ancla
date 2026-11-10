// =========================================================
// ENLACE DE RECUPERACIÓN PARA EL LOGIN ACTUAL
// =========================================================
// No depende de sesión: cualquier persona puede recuperar su cuenta.

import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import "../../styles/components/auth/LoginRecoveryShortcut.css";

// Permite colocar el enlace junto al campo de contraseña del login.
export default function LoginRecoveryShortcut() {
  return (
    <div className="login-recovery-shortcut">
      <Link to="/recuperar-contrasena" className="login-recovery-shortcut__link">
        <KeyRound size={15} aria-hidden="true" />
        ¿Olvidaste tu contraseña?
      </Link>
    </div>
  );
}
