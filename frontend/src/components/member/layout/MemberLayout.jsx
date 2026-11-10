// =========================================================
// LAYOUT COMÚN DE MIEMBROS (member, admin y super_admin)
// =========================================================

// Outlet renderiza la página seleccionada dentro del área de miembros.
// useOutletContext obtiene el usuario autenticado por ProtectedRoute.
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { listBasicSuppliesNeeds } from "../../../services/basicSuppliesApi";
import { deriveVolunteerAlerts } from "../../../utils/memberVolunteerAlerts";

// Reutilizamos el encabezado comunitario para los tres roles.
import MemberHeader from "./MemberHeader";

// Unificamos el botón de regreso y el breadcrumb en todas las páginas.
import SiteNavigation from "../../shared/layout/SiteNavigation";

// Reutilizamos el Footer institucional que también usa la web pública.
import Footer from "../../public/Footer";

// Importamos los estilos exclusivos de este layout.
import "../../../styles/components/member/layout/MemberLayout.css";

// Estructura visual compartida por todas las rutas /member.
function MemberLayout() {
  // La sesión y el rol ya fueron verificados por ProtectedRoute.
  const { user } = useOutletContext() || {};
  const location = useLocation();
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  // Las alertas se calculan desde el inventario real, sin duplicar documentos en MongoDB.
  const [supplyNeeds, setSupplyNeeds] = useState([]);
  const [supplyNeedsLoading, setSupplyNeedsLoading] = useState(true);
  const [supplyNeedsError, setSupplyNeedsError] = useState("");
  const [supplyRefreshKey, setSupplyRefreshKey] = useState(0);

  // Esta función permite actualizar el inventario después de una acción o al abrir la campana.
  const refreshBasicSupplyNeeds = () => setSupplyRefreshKey((number) => number + 1);

  // Recargamos al entrar a /member, al navegar o cuando se solicita una actualización.
  useEffect(() => {
    // Cancelamos consultas anteriores cuando se cambia de ruta o de usuario.
    const controller = new AbortController();

    async function loadSupplyNeeds() {
      setSupplyNeedsLoading(true);
      setSupplyNeedsError("");

      try {
        // Consultamos la misma API privada que utiliza la página de insumos del miembro.
        const data = await listBasicSuppliesNeeds({ signal: controller.signal });

        // No confundimos una respuesta inesperada con un inventario sin faltantes.
        if (!Array.isArray(data?.supplies)) {
          throw new Error("Respuesta de insumos no válida");
        }

        // Guardamos los datos únicamente si la petición continúa vigente.
        if (!controller.signal.aborted) {
          setSupplyNeeds(data.supplies);
        }
      } catch (error) {
        // Una cancelación al navegar no representa un error de inventario.
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") return;

        // Conservamos la última información conocida, pero avisamos de que no se actualizó.
        const sessionExpired = [401, 403].includes(error?.response?.status);
        setSupplyNeedsError(
          sessionExpired
            ? "Tu sesión no permitió consultar las necesidades. Vuelve a iniciar sesión."
            : "No pudimos actualizar los insumos. Inténtalo nuevamente."
        );
      } finally {
        // Solo la última petición puede modificar el estado de carga.
        if (!controller.signal.aborted) setSupplyNeedsLoading(false);
      }
    }

    loadSupplyNeeds();
    return () => controller.abort();
  }, [location.pathname, supplyRefreshKey, user?.id, user?._id]);

  // Actualizamos al volver desde otra pestaña o aplicación, sin hacer consultas constantes.
  useEffect(() => {
    let lastRefresh = 0;

    const refreshOnReturn = () => {
      // Solo consultamos cuando la pestaña está visible y evitamos llamadas repetidas.
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRefresh < 15000) return;
      lastRefresh = now;
      refreshBasicSupplyNeeds();
    };

    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnReturn);

    return () => {
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, []);

  // Al navegar, volvemos a consultar los turnos reales de esta cuenta.
  // Solo el backend decide qué servicios pertenecen al usuario autenticado.
  useEffect(() => {
    const controller = new AbortController();
    setAssignmentsLoading(true);
    setAssignmentsError("");

    api.get("/volunteers/me/assignments", { signal: controller.signal })
      .then(({ data }) => {
        if (!data?.success || !Array.isArray(data.assignments)) {
          throw new Error("No fue posible consultar tus turnos");
        }
        if (!controller.signal.aborted) setAssignments(data.assignments);
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") return;
        setAssignments([]);
        setAssignmentsError(error?.response?.data?.message || "No pudimos consultar tus compromisos");
      })
      .finally(() => {
        if (!controller.signal.aborted) setAssignmentsLoading(false);
      });

    return () => controller.abort();
  }, [location.pathname, refreshKey, user?.id, user?._id]);

  // Un único cálculo alimenta la campana y el panel principal.
  const volunteerAlerts = useMemo(() => deriveVolunteerAlerts(assignments), [assignments]);
  const refreshMemberAssignments = () => setRefreshKey((number) => number + 1);

  // Incluimos únicamente insumos agotados o bajo el mínimo; no mostramos productos disponibles.
  const urgentSupplyNeeds = useMemo(
    () => supplyNeeds.filter((item) => item.status === "low" || item.status === "out"),
    [supplyNeeds]
  );

  // Al desplegar la campana, sincronizamos ambos orígenes de datos reales.
  const refreshMemberNotifications = () => {
    refreshBasicSupplyNeeds();
    refreshMemberAssignments();
  };

  return (
    <div className="member-layout">
      {/* Encabezado con navegación y acciones según el usuario. */}
      <MemberHeader
        user={user}
        volunteerAlerts={volunteerAlerts}
        assignmentsLoading={assignmentsLoading}
        assignmentsError={assignmentsError}
        supplyNeeds={urgentSupplyNeeds}
        supplyNeedsLoading={supplyNeedsLoading}
        supplyNeedsError={supplyNeedsError}
        onRefreshNotifications={refreshMemberNotifications}
      />

      {/* Navegación única para toda el área comunitaria. */}
      <SiteNavigation />

      {/* Espacio flexible para la página privada que se esté visitando. */}
      <div className="member-layout__content">
        {/* Conservamos el usuario validado para cada página hija. */}
        <Outlet context={{
          user,
          volunteerAssignments: assignments,
          volunteerAlerts,
          volunteerAssignmentsLoading: assignmentsLoading,
          volunteerAssignmentsError: assignmentsError,
          refreshMemberAssignments,
          refreshBasicSupplyNeeds,
          supplyNeeds,
        }} />
      </div>

      {/* Footer público compartido, visible en todas las rutas /member. */}
      <Footer />
    </div>
  );
}

// Permite reutilizar el layout desde App.js.
export default MemberLayout;
