// =========================================================
// ENCABEZADO DINÁMICO SEGÚN LA SESIÓN DEL USUARIO
// =========================================================
// Este componente se usa en el layout de las páginas públicas.
// Muestra Header cuando no hay sesión y MemberHeader cuando
// el backend confirma que el usuario está autenticado.
// No guarda ni interpreta tokens en localStorage.

// Hooks para verificar la sesión al montar el componente.
import { useEffect, useState } from "react";

// Encabezado que corresponde a los visitantes.
import Header from "../../public/Header";

// Encabezado compartido por miembros y administradores.
import MemberHeader from "../../member/layout/MemberHeader";

// Cliente de la API, configurado para enviar cookies HttpOnly.
import api from "../../../services/api";

// Estilos exclusivos del componente de selección de encabezado.
import "../../../styles/components/shared/layout/SessionAwareHeader.css";

function SessionAwareHeader() {
  // Guardamos el estado de la comprobación y el usuario verificado.
  const [session, setSession] = useState({
    status: "checking",
    user: null,
  });

  // Permite repetir la consulta cuando hay un problema de red.
  const [retryCount, setRetryCount] = useState(0);

  // Comprobamos la cookie de sesión a través del backend.
  useEffect(() => {
    // Evita actualizaciones si cambiamos de layout antes de recibir la respuesta.
    let isCurrent = true;

    // Función encargada de consultar la sesión real.
    const verifySession = async () => {
      // No mostramos el Header público mientras todavía no sabemos el estado.
      setSession({ status: "checking", user: null });

      try {
        // /auth/me valida la cookie y devuelve el usuario si sigue activo.
        const response = await api.get("/auth/me");

        // Ignoramos respuestas recibidas después de desmontar el componente.
        if (!isCurrent) return;

        // Solo consideramos autenticado a un usuario confirmado por el servidor.
        if (response.data?.success === true && response.data?.user) {
          setSession({
            status: "authenticated",
            user: response.data.user,
          });
        } else {
          // Si no existe usuario válido, mostramos la navegación pública.
          setSession({ status: "visitor", user: null });
        }
      } catch (error) {
        // Evitamos modificar el estado de un componente desmontado.
        if (!isCurrent) return;

        // Una respuesta 401 confirma ausencia o expiración de la sesión.
        if (error.response?.status === 401) {
          setSession({ status: "visitor", user: null });
        } else {
          // Un error de red o servidor NO confirma que la sesión haya terminado.
          // Por eso no mostramos equivocadamente el botón de iniciar sesión.
          setSession({ status: "error", user: null });
        }
      }
    };

    // Ejecutamos la comprobación al abrir el layout público o reintentar.
    verifySession();

    // Cancelamos actualizaciones pendientes al cambiar de layout.
    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  // Mientras verificamos, evitamos un parpadeo del encabezado público.
  if (session.status === "checking") {
    return (
      <div className="session-aware-header__status" role="status">
        Verificando sesión...
      </div>
    );
  }

  // Ante un fallo del servidor, permitimos repetir la consulta.
  if (session.status === "error") {
    return (
      <div className="session-aware-header__status" role="alert">
        <span>No fue posible verificar tu sesión.</span>
        <button
          className="session-aware-header__retry"
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Con sesión validada, reutilizamos el mismo Header de /member.
  if (session.status === "authenticated") {
    return <MemberHeader user={session.user} />;
  }

  // Sin sesión, seguimos usando el Header original de visitantes.
  return <Header />;
}

// Permite incorporarlo al layout público en App.js.
export default SessionAwareHeader;
