
import {
    useState,
    useCallback,
} from "react";

import {
    LockKeyhole,
} from "lucide-react";


// =========================================================
// COMPONENTES
// =========================================================

import UsersHeader from "../../components/administration/users/UsersHeader";

import UsersSummary from "../../components/administration/users/UsersSummary";

import UsersFilters from "../../components/administration/users/UsersFilters";

import UsersTable from "../../components/administration/users/UsersTable";

import UserDetailsModal from "../../components/administration/users/UserDetailsModal";

import UserEditModal from "../../components/administration/users/UserEditModal";


// =========================================================
// ESTILOS
// =========================================================


import "../../styles/pages/administration/UsersManagement.css";



// =========================================================
// PÁGINA PRINCIPAL
// =========================================================

function UsersManagement() {

    // =========================================================
    // ESTADOS DE FILTRADO
    // =========================================================

    const [search, setSearch] = useState("");

    const [role, setRole] = useState("all");

    const [status, setStatus] = useState("all");


    // =========================================================
    // DATOS DE USUARIOS
    // =========================================================

    // Posteriormente reemplazaremos este arreglo
    // con los usuarios obtenidos desde el backend.

    const users = [];


    // =========================================================
    // USUARIO SELECCIONADO
    // =========================================================

    // Al seleccionar "Ver usuario" en la tabla,
    // guardaremos el objeto de la cuenta.

    const [selectedUser, setSelectedUser] = useState(null);


    // =========================================================
    // RESTABLECER FILTROS
    // =========================================================

    const handleClearFilters = () => {

        setSearch("");

        setRole("all");

        setStatus("all");

    };


    // =========================================================
    // ABRIR MODAL
    // =========================================================

    const handleViewUser = useCallback((user) => {

        setSelectedUser(user);

    }, []);


    // =========================================================
    // CERRAR MODAL
    // =========================================================

    const handleCloseModal = useCallback(() => {

        setSelectedUser(null);

    }, []);


    // =========================================================
    // EDICIÓN DE USUARIOS
    // =========================================================

    const [editingUser, setEditingUser] = useState(null);

    // Abrir el formulario con el usuario seleccionado.
    const handleEditUser = useCallback((user) => {
        setEditingUser(user);
    }, []);

    // Cerrar el formulario.
    const handleCloseEditModal = useCallback(() => {
        setEditingUser(null);
    }, []);



    // =========================================================
    // INTERFAZ
    // =========================================================

    return (

        <div className="users-management">


            {/* ================================================= */}
            {/* ENCABEZADO */}
            {/* ================================================= */}

            <UsersHeader
                backPath="/super-admin"
            />


            {/* ================================================= */}
            {/* CONTENIDO PRINCIPAL */}
            {/* ================================================= */}

            <div className="users-management__content">


                {/* ================================================= */}
                {/* RESUMEN DE USUARIOS */}
                {/* ================================================= */}

                <UsersSummary />


                {/* ================================================= */}
                {/* LISTADO DE USUARIOS */}
                {/* ================================================= */}

                <section
                    className="users-management__section"
                    aria-labelledby="users-list-title"
                >

                    <div className="users-management__section-heading">

                        <div>

                            <h2 id="users-list-title">
                                Usuarios registrados
                            </h2>

                            <p>
                                Consulta las cuentas, utiliza filtros
                                y accede a las herramientas de gestión.
                            </p>

                        </div>

                    </div>


                    {/* ============================================= */}
                    {/* BUSCADOR Y FILTROS */}
                    {/* ============================================= */}

                    <UsersFilters
                        search={search}
                        role={role}
                        status={status}
                        onSearchChange={setSearch}
                        onRoleChange={setRole}
                        onStatusChange={setStatus}
                        onClear={handleClearFilters}
                    />


                    {/* ============================================= */}
                    {/* TABLA DE USUARIOS */}
                    {/* ============================================= */}

                    <UsersTable
                        users={users}
                        loading={false}
                        search={search}
                        role={role}
                        status={status}
                        onViewUser={handleViewUser}
                        onEditUser={handleEditUser}
                    />

                </section>


                {/* ================================================= */}
                {/* INFORMACIÓN DE SEGURIDAD */}
                {/* ================================================= */}

                <aside className="users-management__security">

                    <div className="users-management__security-icon">

                        <LockKeyhole
                            size={21}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />

                    </div>


                    <div className="users-management__security-content">

                        <strong>
                            Administración protegida
                        </strong>

                        <p>
                            Las operaciones sobre cuentas y permisos
                            estarán sujetas a controles de autorización.
                            Los cambios administrativos deberán quedar
                            registrados en el historial de actividad
                            del sistema.
                        </p>

                    </div>

                </aside>

            </div>


            {/* ================================================= */}
            {/* MODAL DE DETALLES */}
            {/* ================================================= */}

            {selectedUser && (

                <UserDetailsModal
                    user={selectedUser}
                    onClose={handleCloseModal}
                />

            )}


            {/* ================================================= */}
            {/* MODAL DE EDICIÓN */}
            {/* ================================================= */}

            {editingUser && (

                <UserEditModal
                    user={editingUser}
                    branches={[]}
                    onClose={handleCloseEditModal}
                />

            )}


        </div>
    );
}


// =========================================================
// EXPORTACIÓN
// =========================================================

export default UsersManagement;
