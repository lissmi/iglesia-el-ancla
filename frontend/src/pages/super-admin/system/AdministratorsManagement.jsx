
import { useCallback, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  Info,
  UsersRound,
} from "lucide-react";

import AdministratorsSummary from "../../../components/super-admin/administrators/AdministratorsSummary";

import AdministratorsFilters from "../../../components/super-admin/administrators/AdministratorsFilters";

import AdministratorsTable from "../../../components/super-admin/administrators/AdministratorsTable";

import AdministratorDetailsModal from "../../../components/super-admin/administrators/AdministratorDetailsModal";

import "../../../styles/pages/super-admin/system/AdministratorsManagement.css";


// =========================================================
// SUCURSALES DE DEMOSTRACIÓN
// =========================================================

const DEMO_BRANCHES = [
  {
    _id: "demo-branch-001",
    code: "SUC-001",
    name: "El Ancla - Playa Ancha",
  },
];


// =========================================================
// CUENTAS DE DEMOSTRACIÓN
// =========================================================

// Datos ficticios. No corresponden a usuarios reales.

const DEMO_ADMINISTRATORS = [
  {
    _id: "demo-admin-001",
    firstName: "Camila",
    lastName: "Morales",
    email: "camila@example.com",
    phone: "+56911111111",
    birthDate: "1992-05-14",
    role: "super_admin",
    isActive: true,
    sucursales: DEMO_BRANCHES,
    sucursalPrincipal: DEMO_BRANCHES[0],
    createdAt: "2026-01-10",
    lastLoginAt: "2026-10-08",
  },
  {
    _id: "demo-admin-002",
    firstName: "Daniel",
    lastName: "Rojas",
    email: "daniel@example.com",
    phone: "+56922222222",
    birthDate: "1988-11-21",
    role: "admin",
    isActive: true,
    sucursales: DEMO_BRANCHES,
    sucursalPrincipal: DEMO_BRANCHES[0],
    createdAt: "2026-02-05",
    lastLoginAt: "2026-10-07",
  },
  {
    _id: "demo-admin-003",
    firstName: "Valentina",
    lastName: "Fuentes",
    email: "valentina@example.com",
    phone: "+56933333333",
    birthDate: "1995-03-08",
    role: "admin",
    isActive: true,
    sucursales: DEMO_BRANCHES,
    sucursalPrincipal: DEMO_BRANCHES[0],
    createdAt: "2026-03-12",
    lastLoginAt: "2026-10-06",
  },
  {
    _id: "demo-admin-004",
    firstName: "Sebastián",
    lastName: "Vega",
    email: "sebastian@example.com",
    phone: "+56944444444",
    birthDate: "1990-07-19",
    role: "admin",
    isActive: false,
    sucursales: DEMO_BRANCHES,
    sucursalPrincipal: DEMO_BRANCHES[0],
    createdAt: "2026-04-18",
    lastLoginAt: "2026-09-15",
  },
  {
    _id: "demo-admin-005",
    firstName: "Fernanda",
    lastName: "Castro",
    email: "fernanda@example.com",
    phone: "+56955555555",
    birthDate: "1993-12-02",
    role: "admin",
    isActive: true,
    sucursales: DEMO_BRANCHES,
    sucursalPrincipal: DEMO_BRANCHES[0],
    createdAt: "2026-05-24",
    lastLoginAt: "2026-10-08",
  },
];


// =========================================================
// PÁGINA PRINCIPAL
// =========================================================

function AdministratorsManagement() {

  // =========================================================
  // FILTROS
  // =========================================================

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");


  // =========================================================
  // MODAL DE DETALLES
  // =========================================================

  const [selectedAdministrator, setSelectedAdministrator] =
    useState(null);

  const handleViewAdministrator = useCallback((user) => {
    setSelectedAdministrator(user);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAdministrator(null);
  }, []);


  // =========================================================
  // FILTRAR CUENTAS
  // =========================================================

  const filteredAdministrators = useMemo(() => {

    const normalizedSearch =
      search.trim().toLowerCase();

    return DEMO_ADMINISTRATORS.filter((user) => {

      const fullName =
        `${user.firstName} ${user.lastName}`;

      const branchesText = user.sucursales
        .map((branch) => branch.name)
        .join(" ");

      const matchesSearch =
        !normalizedSearch ||
        [
          fullName,
          user.email,
          branchesText,
        ].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        );

      const matchesRole =
        role === "all" ||
        user.role === role;

      const matchesStatus =
        status === "all" ||
        (
          status === "active" &&
          user.isActive
        ) ||
        (
          status === "inactive" &&
          !user.isActive
        );

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );

    });

  }, [search, role, status]);


  // =========================================================
  // LIMPIAR FILTROS
  // =========================================================

  const handleClearFilters = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
  };


  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <main className="administrators-management">

      {/* ================================================= */}
      {/* NAVEGACIÓN */}
      {/* ================================================= */}

      <div className="administrators-management__navigation">

        <Link
          to="/super-admin"
          className="administrators-management__back"
        >
          <ArrowLeft size={17} />
          Volver al panel
        </Link>

        <span className="administrators-management__breadcrumb">
          Sistema / Administradores
        </span>

      </div>


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <header className="administrators-management__header">

        <div className="administrators-management__heading">

          <div className="administrators-management__heading-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <span className="administrators-management__eyebrow">
              CONTROL DEL SISTEMA
            </span>

            <h1>Administradores</h1>

            <p>
              Consulta las cuentas con privilegios
              administrativos y sus sucursales autorizadas.
            </p>
          </div>

        </div>

        <span className="administrators-management__access">
          <LockKeyhole size={14} />
          Solo superadministrador
        </span>

      </header>


      {/* ================================================= */}
      {/* AVISO DE DEMOSTRACIÓN */}
      {/* ================================================= */}

      <div className="administrators-management__demo">
        <Info size={18} />

        <p>
          <strong>Modo demostración:</strong>{" "}
          las cuentas mostradas son ficticias.
          Puedes utilizar los filtros y consultar
          sus detalles sin modificar MongoDB.
        </p>
      </div>


      {/* ================================================= */}
      {/* ESTADÍSTICAS */}
      {/* ================================================= */}

      <AdministratorsSummary
        administrators={DEMO_ADMINISTRATORS}
      />


      {/* ================================================= */}
      {/* LISTADO */}
      {/* ================================================= */}

      <section className="administrators-management__panel">

        <div className="administrators-management__panel-header">

          <div>
            <h2>
              <UsersRound size={19} />
              Cuentas administrativas
            </h2>

            <p>
              Listado de administradores y
              superadministradores registrados.
            </p>
          </div>

          <span className="administrators-management__count">
            {filteredAdministrators.length} resultados
          </span>

        </div>


        <AdministratorsFilters
          search={search}
          role={role}
          status={status}
          onSearchChange={setSearch}
          onRoleChange={setRole}
          onStatusChange={setStatus}
          onClear={handleClearFilters}
        />


        <AdministratorsTable
          administrators={filteredAdministrators}
          onView={handleViewAdministrator}
        />

      </section>


      {/* ================================================= */}
      {/* INFORMACIÓN DE SEGURIDAD */}
      {/* ================================================= */}

      <aside className="administrators-management__security">

        <LockKeyhole size={20} />

        <div>
          <strong>Protección de cuentas privilegiadas</strong>

          <p>
            Los cambios de rol, la desactivación de
            administradores y las modificaciones de
            cuentas superadministradoras requerirán
            autorización del backend y registro de
            auditoría. Esta versión es solo de consulta.
          </p>
        </div>

      </aside>


      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {selectedAdministrator && (

        <AdministratorDetailsModal
          administrator={selectedAdministrator}
          onClose={handleCloseModal}
        />

      )}

    </main>
  );
}

export default AdministratorsManagement;
