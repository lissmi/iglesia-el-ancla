
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    ShieldCheck,
    UsersRound,
} from "lucide-react";

// =========================================================
// ESTILOS
// =========================================================

import "../../styles/pages/administration/MembersManagement.css";

// =========================================================
// COMPONENTES
// =========================================================

import MembersSummary from "../../components/administration/members/MembersSummary";
import MembersBirthdays from "../../components/administration/members/MembersBirthdays";
import MembersDirectory from "../../components/administration/members/MembersDirectory";
import MemberDetailsModal from "../../components/administration/members/MemberDetailsModal";

// =========================================================
// DATOS DEMOSTRATIVOS
// =========================================================

// Registros temporales utilizados durante el desarrollo.
// Solo los usuarios con rol "member" aparecerán en el directorio.

const DEMO_MEMBERS = [
    {
        id: "USR-001",
        name: "María González",
        email: "maria.gonzalez@ejemplo.cl",
        phone: "+56 9 1234 5678",
        role: "member",
        status: "active",
        birthDate: "1995-10-18",
        registeredAt: "2026-09-15",
        branch: "Iglesia El Ancla",
    },
    {
        id: "USR-002",
        name: "Carlos Muñoz",
        email: "carlos.munoz@ejemplo.cl",
        phone: "+56 9 2345 6789",
        role: "member",
        status: "active",
        birthDate: "1990-06-12",
        registeredAt: "2026-08-20",
        branch: "Iglesia El Ancla",
    },
    {
        id: "USR-003",
        name: "Daniela Rojas",
        email: "daniela.rojas@ejemplo.cl",
        phone: "+56 9 3456 7890",
        role: "member",
        status: "active",
        birthDate: "1998-10-25",
        registeredAt: "2026-10-04",
        branch: "Iglesia El Ancla",
    },
    {
        id: "USR-004",
        name: "Ana Pérez",
        email: "ana.perez@ejemplo.cl",
        phone: "+56 9 4567 8901",
        role: "member",
        status: "blocked",
        birthDate: "1987-03-08",
        registeredAt: "2026-07-10",
        branch: "Iglesia El Ancla",
    },
    {
        id: "USR-005",
        name: "Pedro Ramírez",
        email: "pedro.ramirez@ejemplo.cl",
        phone: "+56 9 5678 9012",
        role: "member",
        status: "active",
        birthDate: "1993-12-05",
        registeredAt: "2026-10-08",
        branch: "Iglesia El Ancla",
    },
];

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MembersManagement() {

    // =====================================================
    // NAVEGACIÓN
    // =====================================================

    const navigate = useNavigate();

    function handleGoBack() {
        navigate(-1);
    }

    // =====================================================
    // ESTADOS GENERALES
    // =====================================================

    // Datos compartidos por los componentes de la página.

    const [members] = useState(DEMO_MEMBERS);

    // Miembro seleccionado desde el directorio o cumpleaños.

    const [selectedMember, setSelectedMember] = useState(null);

    function handleCloseMemberProfile() {
        setSelectedMember(null);
    }

    // =====================================================
    // MIEMBROS REGISTRADOS
    // =====================================================

    // Excluimos las cuentas administrativas del directorio.

    const registeredMembers = useMemo(() => {
        return members.filter(
            (member) => member.role === "member"
        );
    }, [members]);

    // =====================================================
    // ESTADÍSTICAS GENERALES
    // =====================================================

    const summary = useMemo(() => {

        const now = new Date();

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Total de miembros.
        const total = registeredMembers.length;

        // Miembros con cuenta habilitada.
        const active = registeredMembers.filter(
            (member) => member.status === "active"
        ).length;

        // Cumpleaños durante el mes actual.
        const birthdays = registeredMembers.filter((member) => {

            if (!member.birthDate) return false;

            const month = Number(
                member.birthDate.split("-")[1]
            ) - 1;

            return month === currentMonth;

        }).length;

        // Miembros registrados durante el mes actual.
        const newMembers = registeredMembers.filter((member) => {

            if (!member.registeredAt) return false;

            const [year, month] =
                member.registeredAt.split("-").map(Number);

            return (
                year === currentYear &&
                month === currentMonth + 1
            );

        }).length;

        return {
            total,
            active,
            birthdays,
            newMembers,
        };

    }, [registeredMembers]);

    // =====================================================
    // INTERFAZ PRINCIPAL
    // =====================================================

    return (
        <main className="members-management">

            {/* =========================================== */}
            {/* ENCABEZADO PRINCIPAL */}
            {/* =========================================== */}

            <header className="members-management__header">

                <div className="members-management__heading">

                    <span className="members-management__eyebrow">
                        GESTIÓN DE LA COMUNIDAD
                    </span>

                    <h1>Miembros de la iglesia</h1>

                    <p>
                        Consulta la información de los miembros
                        registrados y facilita el acompañamiento
                        de nuestra comunidad.
                    </p>

                    <button
                        type="button"
                        className="members-management__back"
                        onClick={handleGoBack}
                    >
                        <ArrowLeft
                            size={17}
                            aria-hidden="true"
                        />
                        Volver
                    </button>

                </div>

                <div className="members-management__header-icon">

                    <UsersRound
                        size={29}
                        strokeWidth={1.7}
                        aria-hidden="true"
                    />

                </div>

            </header>

            {/* =========================================== */}
            {/* RESUMEN DE MIEMBROS */}
            {/* =========================================== */}

            <MembersSummary
                summary={summary}
            />

            {/* =========================================== */}
            {/* CUMPLEAÑOS DE LA COMUNIDAD */}
            {/* =========================================== */}

            <MembersBirthdays
                members={registeredMembers}
                onViewMember={setSelectedMember}
            />

            {/* =========================================== */}
            {/* DIRECTORIO DE MIEMBROS */}
            {/* =========================================== */}

            <MembersDirectory
                members={registeredMembers}
                onViewMember={setSelectedMember}
            />

            {/* =========================================== */}
            {/* AVISO INFORMATIVO */}
            {/* =========================================== */}

            <div className="members-management__notice">

                <ShieldCheck
                    size={19}
                    aria-hidden="true"
                />

                <p>
                    Este directorio es una vista administrativa
                    de consulta. La modificación de cuentas,
                    roles y permisos corresponde a la sección
                    Gestión de usuarios.
                </p>

            </div>

            {/* =========================================== */}
            {/* MODAL DE PERFIL DEL MIEMBRO */}
            {/* =========================================== */}

            {selectedMember && (
                <MemberDetailsModal
                    member={selectedMember}
                    onClose={handleCloseMemberProfile}
                />
            )}

        </main>
    );
}

export default MembersManagement;
