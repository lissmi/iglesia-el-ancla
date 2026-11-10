// =========================================================
// ENCABEZADO PÚBLICO O AUTENTICADO — IGLESIA EL ANCLA
// La validación de sesión proviene del proveedor global.
// Nunca mostramos campanas privadas a visitantes.
// =========================================================
import Header from "../../public/Header";
import MemberHeader from "../../member/layout/MemberHeader";
import { useNotifications } from "../../../context/notifications/NotificationsContext";
import "../../../styles/components/shared/layout/SessionAwareHeader.css";

function SessionAwareHeader() {
  // La identidad procede de /api/auth/me, no de localStorage.
  const { currentUser } = useNotifications();

  // La campana solo existe si el servidor confirmó la sesión.
  return currentUser ? <MemberHeader user={currentUser} /> : <Header />;
}

export default SessionAwareHeader;
