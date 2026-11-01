
/* =========================================================
   HEADER DINÁMICO - IGLESIA EL ANCLA
========================================================= */

// Importamos los hooks para consultar la sesión.
import { useEffect, useState } from "react";

// Importamos el encabezado público para visitantes.
import Header from "../../public/Header";

// Importamos el encabezado de miembros autenticados.
import MemberHeader from "../../member/layout/MemberHeader";

// Importamos el cliente HTTP configurado con cookies.
import api from "../../../services/api";

// Conservamos los estilos existentes del componente.
import "../../../styles/components/shared/layout/SessionAwareHeader.css";

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

function SessionAwareHeader() {

  // Inicialmente no tenemos un usuario verificado.
  // Esto permite mostrar el Header público de inmediato.
  const [verifiedUser, setVerifiedUser] = useState(null);

  /* =======================================================
     VERIFICACIÓN DE SESIÓN EN SEGUNDO PLANO
  ======================================================= */

  useEffect(() => {

    // Evitamos actualizar un componente desmontado.
    let isCurrent = true;

    // Consultamos la sesión sin bloquear la navegación pública.
    const verifySession = async () => {

      try {

        // Solicitamos al backend la identidad autenticada.
        const response = await api.get("/auth/me");

        // Ignoramos respuestas posteriores al desmontaje.
        if (!isCurrent) return;

        // Comprobamos que la respuesta sea correcta.
        const isAuthenticated =
          response.data?.success === true &&
          response.data?.user &&
          ["member", "admin", "super_admin"].includes(
            response.data.user.role
          );

        // Solo guardamos usuarios confirmados por el backend.
        if (isAuthenticated) {

          setVerifiedUser(response.data.user);

        } else {

          // Sin usuario confirmado, conservamos el Header público.
          setVerifiedUser(null);

        }

      } catch (error) {

        // Evitamos actualizar un componente desmontado.
        if (!isCurrent) return;

        // Cualquier error deja la navegación pública disponible.
        // Esto NO elimina cookies ni cierra la sesión real.
        setVerifiedUser(null);

        // Un 401 es normal cuando no hay sesión iniciada.
        // Los demás errores se registran para diagnóstico.
        if (error.response?.status !== 401) {

          console.warn(
            "No fue posible verificar la sesión:",
            error.response?.status ?? "Error de conexión"
          );

        }

      }

    };

    // Ejecutamos la consulta en segundo plano.
    verifySession();

    // Cancelamos actualizaciones cuando cambia el componente.
    return () => {
      isCurrent = false;
    };

  }, []);

  /* =======================================================
     SELECCIÓN DEL ENCABEZADO
  ======================================================= */

  // Solo mostramos navegación de miembros cuando
  // el servidor confirmó una sesión válida.
  if (verifiedUser) {

    return <MemberHeader user={verifiedUser} />;

  }

  // Sin sesión confirmada, mostramos siempre
  // el Header público, incluso si falla la API.
  return <Header />;

}

// Exportamos el componente para el layout público.
export default SessionAwareHeader;
