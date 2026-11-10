// =========================================================
// LAYOUT ADMINISTRATIVO COMPARTIDO
// =========================================================
import { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTour from "./AdminTour";
import AdminHeader from "./AdminHeader";
import { ExpensesProvider } from "../../../context/expenses/ExpensesContext";
import { NotificationsProvider } from "../../../context/notifications/NotificationsContext";
import "../../../styles/components/administration/layout/AdminLayout.css";
import AdminBackButton from "./AdminBackButton";

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  // Solicitar el recorrido manualmente desde el menú lateral.
  const [tourRequest, setTourRequest] = useState(0);
  const adminBasePath = location.pathname === "/super-admin" ||
    location.pathname.startsWith("/super-admin/")
    ? "/super-admin"
    : "/admin";

  const handleOpenSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    // Ambos proveedores abarcan el encabezado y las rutas hijas.
    <ExpensesProvider>
      <NotificationsProvider basePath={adminBasePath}>
        <div className="admin-layout">
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={handleCloseSidebar}
            onStartTour={() => {
              handleCloseSidebar();
              setTourRequest((previous) => previous + 1);
            }}
          />

          {isSidebarOpen && (
            <button
              className="admin-layout__overlay"
              type="button"
              onClick={handleCloseSidebar}
              aria-label="Cerrar menú administrativo"
            />
          )}

          <div className="admin-layout__main">
            <AdminHeader onOpenSidebar={handleOpenSidebar} />
            <div className="admin-layout__content">
              <AdminBackButton />
              <Outlet />
            </div>
          </div>
          <AdminTour
            basePath={adminBasePath}
            requestId={tourRequest}
            openSidebar={handleOpenSidebar}
            closeSidebar={handleCloseSidebar}
          />
        </div>
      </NotificationsProvider>
    </ExpensesProvider>
  );
}

export default AdminLayout;
