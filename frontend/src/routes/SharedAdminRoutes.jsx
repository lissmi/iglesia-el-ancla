// =========================================================
// IMPORTACIONES
// =========================================================

import { Outlet, Route } from "react-router-dom";
import { BelongingsProvider } from "../context/belongings/BelongingsContext";

// =========================================================
// PÁGINAS ADMINISTRATIVAS COMPARTIDAS
// =========================================================

import UsersManagement from "../pages/administration/UsersManagement";

// Página de perfil compartida por todos los roles.
import MyAccount from "../pages/account/MyAccount";

import RegisterUser from "../pages/administration/RegisterUser";

import ActivityHistory from "../pages/administration/ActivityHistory";

import EventsManagement from "../pages/administration/EventsManagement";

import PrayerRequestsManagement from "../pages/administration/PrayerRequestsManagement";

import MembersManagement from "../pages/administration/MembersManagement";

import VolunteersManagement from "../pages/administration/VolunteersManagement";

import ResourcesManagement from "../pages/administration/ResourcesManagement";

import RecommendationsManagement from "../pages/administration/RecommendationsManagement";

import IncomeManagement from "../pages/administration/IncomeManagement";

import ExpenseManagement from "../pages/administration/ExpenseManagement";

import FinanceOverview from "../pages/administration/FinanceOverview";

import BasicSupplies from "../pages/administration/BasicSupplies";

import InformationalPages from "../pages/administration/InformationalPages";

import InformationalPageEditor from "../pages/administration/InformationalPageEditor";

import BelongingsDashboard from "../pages/administration/belongings/BelongingsDashboard";

import BelongingsInventory from "../pages/administration/belongings/BelongingsInventory";

import BelongingsMovements from "../pages/administration/belongings/BelongingsMovements";

import MartinManagement from "../pages/administration/martin/MartinManagement";

import { MartinProvider } from "../context/martin/MartinContext";


// =========================================================
// DEFINICIÓN CENTRALIZADA DE RUTAS
// =========================================================

// Este archivo contiene las rutas compartidas
// entre los paneles:
//
// - admin
// - super_admin
//
// La autenticación y autorización de acceso
// a cada panel se realizan desde App.js.
//
// Los permisos específicos de cada operación
// deberán validarse también en el backend.

function SharedAdminRoutes() {

    return (
        <>

            {/* PERFIL PROPIO: /admin/mi-cuenta o /super-admin/mi-cuenta. */}
            <Route path="mi-cuenta" element={<MyAccount />} />

            {/* =========================================== */}
            {/* GESTIÓN DE USUARIOS */}
            {/* =========================================== */}

            <Route
                path="sistema/usuarios"
                element={<UsersManagement />}
            />


            {/* =========================================== */}
            {/* REGISTRO DE USUARIOS */}
            {/* =========================================== */}

            <Route
                path="sistema/registrar-usuario"
                element={<RegisterUser />}
            />


            {/* =========================================== */}
            {/* HISTORIAL DE ACTIVIDAD */}
            {/* =========================================== */}

            <Route
                path="historial"
                element={<ActivityHistory />}
            />


            {/* =========================================== */}
            {/* GESTIÓN DE EVENTOS */}
            {/* =========================================== */}

            <Route
                path="eventos"
                element={<EventsManagement />}
            />


            {/* =========================================== */}
            {/* GESTIÓN DE PETICIONES DE ORACIÓN */}
            {/* =========================================== */}

            <Route
                path="peticiones-oracion"
                element={<PrayerRequestsManagement />}
            />


            {/* =========================================== */}
            {/* GESTIÓN DE MIEMBROS */}
            {/* =========================================== */}

            <Route
                path="miembros"
                element={<MembersManagement />}
            />


            {/* =========================================== */}
            {/* GESTIÓN DE VOLUNTARIOS */}
            {/* =========================================== */}

            <Route
                path="voluntarios"
                element={<VolunteersManagement />}
            />


            {/* =========================================== */}
            {/* GESTIÓN DE RECURSOS */}
            {/* =========================================== */}

            <Route
                path="recursos"
                element={<ResourcesManagement />}
            />


            {/* =========================================== */}
            {/* GESTIÓN DE RECOMENDADOS */}
            {/* =========================================== */}

            <Route
                path="recomendados"
                element={<RecommendationsManagement />}
            />


            {/* =========================================== */}
            {/* GESTIÓN DE FINANZAS */}
            {/* =========================================== */}

            <Route
                path="finanzas/ingresos"
                element={<IncomeManagement />}
            />

            <Route
                path="finanzas/gastos"
                element={<ExpenseManagement />}
            />

            <Route
                path="finanzas"
                element={<FinanceOverview />}
            />


            {/* =========================================== */}
            {/* INSUMOS BASICOS */}
            {/* =========================================== */}

            <Route
                path="insumos-basicos"
                element={<BasicSupplies />}
            />

            {/* ===================================================== */}
            {/* INVENTARIO DE BIENES */}
            {/* ===================================================== */}

            <Route
                path="inventario-bienes"
                element={
                    <BelongingsProvider>
                        <Outlet />
                    </BelongingsProvider>
                }
            >
                <Route
                    index
                    element={<BelongingsDashboard />}
                />

                <Route
                    path="inventario"
                    element={<BelongingsInventory />}
                />

                <Route
                    path="movimientos"
                    element={<BelongingsMovements />}
                />
            </Route>

            {/* =========================================== */}
            {/* PAGINAS INFORMATIVAS */}
            {/* =========================================== */}
            <Route
                path="paginas-informativas"
                element={<InformationalPages />}
            />

            <Route
                path="paginas-informativas/editar/:slug"
                element={<InformationalPageEditor />}
            />

            {/* =========================================== */}
            {/* ADMINISTRACIÓN DEL ASISTENTE MARTÍN */}
            {/* =========================================== */}

            <Route
                path="asistente-martin"
                element={
                    <MartinProvider>
                        <MartinManagement />
                    </MartinProvider>
                }
            />

        </>
    );

}

export default SharedAdminRoutes;
