// Importamos useState para controlar
// el menú lateral en dispositivos móviles.
import { useState } from "react";

// Importamos Outlet para mostrar
// la página administrativa seleccionada.
import { Outlet } from "react-router-dom";

// Importamos el menú lateral.
import AdminSidebar from "./AdminSidebar";

// Importamos el encabezado.
import AdminHeader from "./AdminHeader";

// Importamos los estilos exclusivos del layout.
import "../../../styles/components/admin/layout/AdminLayout.css";


// Creamos la estructura general del área administrativa.
function AdminLayout() {

  // Guardamos si el sidebar móvil está abierto.
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);


  // Creamos una función para abrir el menú.
  const handleOpenSidebar = () => {

    // Cambiamos el estado a verdadero.
    setIsSidebarOpen(true);
  };


  // Creamos una función para cerrar el menú.
  const handleCloseSidebar = () => {

    // Cambiamos el estado a falso.
    setIsSidebarOpen(false);
  };


  // Retornamos la estructura completa.
  return (
    <div className="admin-layout">

      {/* Mostramos el menú lateral. */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />


      {/* Mostramos un fondo oscuro detrás del menú
          solamente cuando está abierto en móviles. */}
      {isSidebarOpen && (
        <button
          className="admin-layout__overlay"
          type="button"
          onClick={handleCloseSidebar}
          aria-label="Cerrar menú administrativo"
        />
      )}


      {/* Creamos el área principal. */}
      <div className="admin-layout__main">

        {/* Mostramos el encabezado administrativo. */}
        <AdminHeader
          onOpenSidebar={handleOpenSidebar}
        />


        {/* Mostramos la página asociada a la ruta actual. */}
        <div className="admin-layout__content">
          <Outlet />
        </div>

      </div>

    </div>
  );
}


// Exportamos el componente.
export default AdminLayout;