import { useState } from "react";

import { Info, LockKeyhole, ShieldCheck } from "lucide-react";
// =========================================================
// COMPONENTES DEL MÓDULO
// =========================================================

import RolesSummary from "../../../components/super-admin/roles/RolesSummary";

import RolesCards from "../../../components/super-admin/roles/RolesCards";

import PermissionsMatrix from "../../../components/super-admin/roles/PermissionsMatrix";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/pages/super-admin/system/RolesPermissions.css";

// =========================================================
// PÁGINA PRINCIPAL
// =========================================================

function RolesPermissions() {
    // Rol destacado en la matriz.
    // La selección solo afecta a la interfaz.

    const [selectedRole, setSelectedRole] =
        useState("super_admin");

    return (
        <div className="roles-permissions-page">

            


            {/* ============================================= */}
            {/* ENCABEZADO */}
            {/* ============================================= */}

            <header className="roles-permissions-page__header">
                <div>
                    <span className="roles-permissions-page__eyebrow">
                        SISTEMA / CONTROL DE ACCESO
                    </span>

                    <h1>Roles y permisos</h1>

                    <p>
                        Consulta los niveles de acceso,
                        responsabilidades y permisos
                        propuestos para cada rol del sistema.
                    </p>
                </div>

                <div className="roles-permissions-page__badge">
                    <ShieldCheck
                        size={17}
                        aria-hidden="true"
                    />

                    <span>Superadministrador</span>
                </div>
            </header>

            {/* ============================================= */}
            {/* AVISO INFORMATIVO */}
            {/* ============================================= */}

            <div
                className="roles-permissions-page__notice"
                role="note"
            >
                <Info
                    size={20}
                    aria-hidden="true"
                />

                <div>
                    <strong>
                        Configuración de referencia
                    </strong>

                    <p>
                        Los permisos mostrados corresponden
                        a una propuesta para el sistema.
                        Actualmente esta página es de consulta:
                        no modifica roles, cuentas ni permisos
                        efectivos en el servidor.
                    </p>
                </div>
            </div>

            {/* ============================================= */}
            {/* RESUMEN */}
            {/* ============================================= */}

            <RolesSummary />

            {/* ============================================= */}
            {/* ROLES DEL SISTEMA */}
            {/* ============================================= */}

            <section className="roles-permissions-page__section">
                <div className="roles-permissions-page__section-heading">
                    <h2>Roles del sistema</h2>

                    <p>
                        Selecciona un rol para destacar
                        sus permisos en la matriz.
                    </p>
                </div>

                <RolesCards
                    selectedRole={selectedRole}
                    onSelectRole={setSelectedRole}
                />
            </section>

            {/* ============================================= */}
            {/* MATRIZ DE PERMISOS */}
            {/* ============================================= */}

            <PermissionsMatrix
                selectedRole={selectedRole}
            />

            {/* ============================================= */}
            {/* SEGURIDAD Y RESTRICCIONES */}
            {/* ============================================= */}

            <section className="roles-permissions-page__security">
                <div className="roles-permissions-page__security-icon">
                    <LockKeyhole
                        size={23}
                        aria-hidden="true"
                    />
                </div>

                <div>
                    <h2>Protección de privilegios</h2>

                    <p>
                        La administración de cuentas privilegiadas
                        y las operaciones sensibles deben quedar
                        reservadas a los roles autorizados.
                        El acceso debe verificarse en el backend,
                        independientemente de las restricciones
                        visibles en la interfaz.
                    </p>

                    <p>
                        Las cuentas de superadministrador requieren
                        controles adicionales para evitar cambios
                        accidentales o elevaciones de privilegios
                        no autorizadas.
                    </p>
                </div>
            </section>

        </div>
    );
}

export default RolesPermissions;




