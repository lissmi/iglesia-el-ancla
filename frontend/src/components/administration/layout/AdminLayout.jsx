// =========================================================
// LAYOUT ADMINISTRATIVO COMPARTIDO
// =========================================================
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { ExpensesProvider } from "../../../context/expenses/ExpensesContext";
import { NotificationsProvider } from "../../../context/notifications/NotificationsContext";
import "../../../styles/components/administration/layout/AdminLayout.css";

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const adminBasePath = location.pathname === "/super-admin" ||
    location.pathname.startsWith("/super-admin/")
    ? "/super-admin"
    : "/admin";

  const handleOpenSidebar = () => setIsSidebarOpen(true);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  return (
    // Ambos proveedores abarcan el encabezado y las rutas hijas.
    <ExpensesProvider>
      <NotificationsProvider basePath={adminBasePath}>
        <div className="admin-layout">
          <AdminSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

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
              <Outlet />
            </div>
          </div>
        </div>
      </NotificationsProvider>
    </ExpensesProvider>
  );
}

export default AdminLayout;
