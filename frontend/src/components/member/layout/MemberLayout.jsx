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
  // Las alertas se calculan desde la colección real, sin guardarlas por duplicado.
  const [supplyNeeds, setSupplyNeeds] = useState([]);
  const [supplyNeedsLoading, setSupplyNeedsLoading] = useState(true);
  const [supplyRefreshKey, setSupplyRefreshKey] = useState(0);
  const refreshBasicSupplyNeeds = () => setSupplyRefreshKey((n) => n + 1);
  useEffect(() => {
    let cancelled = false;
    setSupplyNeedsLoading(true);
    listBasicSuppliesNeeds().then((data) => {
      if (!cancelled) setSupplyNeeds(data.supplies || []);
    }).catch(() => {
      if (!cancelled) setSupplyNeeds([]);
    }).finally(() => { if (!cancelled) setSupplyNeedsLoading(false); });
    return () => { cancelled = true; };
  }, [location.pathname, supplyRefreshKey, user?.id, user?._id]);

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

  return (
    <div className="member-layout">
      {/* Encabezado con navegación y acciones según el usuario. */}
      <MemberHeader user={user} volunteerAlerts={volunteerAlerts} assignmentsLoading={assignmentsLoading}
        supplyNeeds={supplyNeeds.filter((item) => item.status !== "available")}
        supplyNeedsLoading={supplyNeedsLoading} />

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
