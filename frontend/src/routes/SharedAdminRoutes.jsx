// =========================================================
// IMPORTACIONES
// =========================================================

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

import VolunteersManagement from "../pages/administration/VolunteersManagement";

import ResourcesManagement from "../pages/administration/ResourcesManagement";

import RecommendationsManagement from "../pages/administration/RecommendationsManagement";

import IncomeManagement from "../pages/administration/IncomeManagement";

import ExpenseManagement from "../pages/administration/ExpenseManagement";

import FinanceOverview from "../pages/administration/FinanceOverview";


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
            {/* PRÓXIMOS MÓDULOS COMPARTIDOS */}
            {/* =========================================== */}

            {/*
                - Gestión de páginas.
                - Resumen general de finanzas.
            */}

        </>
    );

}

export default SharedAdminRoutes;