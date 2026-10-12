
import { Route } from "react-router-dom";

// =========================================================
// PÁGINAS ADMINISTRATIVAS COMPARTIDAS
// =========================================================

import UsersManagement from "../pages/administration/UsersManagement";

import RegisterUser from "../pages/administration/RegisterUser";

import ActivityHistory from "../pages/administration/ActivityHistory";

import EventsManagement from "../pages/administration/EventsManagement";

import PrayerRequestsManagement from "../pages/administration/PrayerRequestsManagement";

import MembersManagement from "../pages/administration/MembersManagement";

// =========================================================
// DEFINICIÓN CENTRALIZADA DE RUTAS
// =========================================================

// Este archivo contiene las rutas que serán
// utilizadas por admin y super_admin.
//
// La autenticación y autorización de acceso
// a cada panel se realizan desde App.js.
//
// Los permisos específicos de cada operación
// deberán validarse también en el backend.

function SharedAdminRoutes() {
    return (
        <>
            {/* Gestión de usuarios */}
            <Route
                path="sistema/usuarios"
                element={<UsersManagement />}
            />

            {/* Registro de usuarios */}
            <Route
                path="sistema/registrar-usuario"
                element={<RegisterUser />}
            />

            <Route
                path="historial"
                element={<ActivityHistory />}
            />

            <Route
                path="eventos"
                element={<EventsManagement />}
            />

            <Route
                path="peticiones-oracion"
                element={<PrayerRequestsManagement />}
            />

            <Route
                path="miembros"
                element={<MembersManagement />}
            />

            {/* Próximos módulos compartidos:
          - Eventos.
          - Peticiones de oración.
          - Miembros.
          - Recursos.
          - Gestión de páginas.
      */}
        </>
    );
}

export default SharedAdminRoutes;
