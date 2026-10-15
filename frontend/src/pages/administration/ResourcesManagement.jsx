import { useCallback, useMemo, useRef, useState } from "react";

// =========================================================

// COMPONENTES

// =========================================================

import ResourcesHeader from "../../components/administration/resources/ResourcesHeader";

import ResourcesSummary from "../../components/administration/resources/ResourcesSummary";

import ResourcesCategories, {

    RESOURCE_CATEGORIES,

} from "../../components/administration/resources/ResourcesCategories";

import ResourcesToolbar from "../../components/administration/resources/ResourcesToolbar";

import ResourcesList from "../../components/administration/resources/ResourcesList";

import ResourceFormModal from "../../components/administration/resources/ResourceFormModal";

import ResourceDetailsModal from "../../components/administration/resources/ResourceDetailsModal";

import ResourceDeleteModal from "../../components/administration/resources/ResourceDeleteModal";

// =========================================================

// ESTILOS

// =========================================================

import "../../styles/pages/administration/ResourcesManagement.css";

// =========================================================

// COMPONENTE PRINCIPAL

// =========================================================

function ResourcesManagement() {

    // =====================================================

    // RECURSOS

    // =====================================================

    const [resources, setResources] = useState([]);

    const nextResourceId = useRef(1);

    // =====================================================

    // FILTROS

    // =====================================================

    const [selectedCategory, setSelectedCategory] =

        useState("all");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =

        useState("all");

    const [sortOrder, setSortOrder] =

        useState("newest");

    // =====================================================

    // MODALES

    // =====================================================

    const [isResourceFormOpen, setIsResourceFormOpen] =

        useState(false);

    const [editingResource, setEditingResource] =

        useState(null);

    const [viewingResource, setViewingResource] =

        useState(null);

    const [deletingResource, setDeletingResource] =

        useState(null);

    // =====================================================

    // CREACIÓN Y EDICIÓN

    // =====================================================

    const handleOpenResourceForm = useCallback(() => {

        setEditingResource(null);

        setIsResourceFormOpen(true);

    }, []);

    const handleCloseResourceForm = useCallback(() => {

        setIsResourceFormOpen(false);

        setEditingResource(null);

    }, []);

    function handleEditResource(resource) {

        setViewingResource(null);

        setEditingResource(resource);

        setIsResourceFormOpen(true);

    }

    function handleSaveResource(formData) {

        if (editingResource) {

            setResources((previous) =>

                previous.map((resource) =>

                    resource.id === editingResource.id

                        ? {

                            ...resource,

                            ...formData,

                            id: resource.id,

                            createdAt: resource.createdAt,

                            updatedAt: new Date().toISOString(),

                        }

                        : resource

                )

            );

        } else {

            const now = new Date().toISOString();

            const newResource = {

                ...formData,

                id: `RES-${String(

                    nextResourceId.current++

                ).padStart(5, "0")}`,

                createdAt: now,

                updatedAt: now,

            };

            setResources((previous) => [

                newResource,

                ...previous,

            ]);

        }

        handleCloseResourceForm();

    }

    // =====================================================

    // CONSULTA DE RECURSOS

    // =====================================================

    function handleViewResource(resource) {

        setViewingResource(resource);

    }

    const handleCloseResourceDetails = useCallback(() => {

        setViewingResource(null);

    }, []);

    // =====================================================

    // ELIMINACIÓN

    // =====================================================

    function handleOpenDeleteModal(resource) {

        setDeletingResource(resource);

    }

    const handleCloseDeleteModal = useCallback(() => {

        setDeletingResource(null);

    }, []);

    function handleConfirmDelete(resourceToDelete) {

        setResources((previous) =>

            previous.filter(

                (resource) =>

                    resource.id !== resourceToDelete.id

            )

        );

        handleCloseDeleteModal();

    }

    // =====================================================

    // FILTROS

    // =====================================================

    function handleClearFilters() {

        setSearch("");

        setStatusFilter("all");

        setSortOrder("newest");

    }

    // =====================================================

    // CATEGORÍAS

    // =====================================================

    const categoryLabels = useMemo(() => {

        return Object.fromEntries(

            RESOURCE_CATEGORIES.map((category) => [

                category.id,

                category.name,

            ])

        );

    }, []);

    const selectedCategoryName =

        selectedCategory === "all"

            ? "Todos los recursos"

            : categoryLabels[selectedCategory] || "Recursos";

    // =====================================================

    // FILTRADO Y ORDENAMIENTO

    // =====================================================

    const filteredResources = useMemo(() => {

        const normalizedSearch = search

            .trim()

            .toLocaleLowerCase("es");

        const results = resources.filter((resource) => {

            const matchesCategory =

                selectedCategory === "all" ||

                resource.category === selectedCategory;

            const matchesStatus =

                statusFilter === "all" ||

                resource.status === statusFilter;

            const searchableText = [

                resource.title,

                resource.description,

                resource.author,

                resource.reference,

                categoryLabels[resource.category],

            ]

                .filter(Boolean)

                .join(" ")

                .toLocaleLowerCase("es");

            const matchesSearch =

                !normalizedSearch ||

                searchableText.includes(normalizedSearch);

            return (

                matchesCategory &&

                matchesStatus &&

                matchesSearch

            );

        });

        results.sort((a, b) => {

            if (sortOrder === "title-asc") {

                return (a.title || "").localeCompare(

                    b.title || "",

                    "es"

                );

            }

            if (sortOrder === "title-desc") {

                return (b.title || "").localeCompare(

                    a.title || "",

                    "es"

                );

            }

            const dateA = Date.parse(a.createdAt || "") || 0;

            const dateB = Date.parse(b.createdAt || "") || 0;

            return sortOrder === "oldest"

                ? dateA - dateB

                : dateB - dateA;

        });

        return results;

    }, [

        resources,

        selectedCategory,

        statusFilter,

        search,

        sortOrder,

        categoryLabels,

    ]);

    // =====================================================

    // INTERFAZ

    // =====================================================

    return (

        <main className="resources-management">

            {/* ENCABEZADO */}

            <ResourcesHeader

                onCreateResource={handleOpenResourceForm}

            />

            <div className="resources-management__content">

                {/* ESTADÍSTICAS */}

                <ResourcesSummary

                    resources={resources}

                />

                {/* CATEGORÍAS */}

                <ResourcesCategories

                    resources={resources}

                    selectedCategory={selectedCategory}

                    onSelectCategory={setSelectedCategory}

                />

                {/* BUSCADOR Y FILTROS */}

                <ResourcesToolbar

                    search={search}

                    onSearchChange={setSearch}

                    statusFilter={statusFilter}

                    onStatusChange={setStatusFilter}

                    sortOrder={sortOrder}

                    onSortChange={setSortOrder}

                    onClearFilters={handleClearFilters}

                />

                {/* LISTADO */}

                <ResourcesList

                    resources={filteredResources}

                    totalResources={resources.length}

                    categoryName={selectedCategoryName}

                    categoryLabels={categoryLabels}

                    onView={handleViewResource}

                    onEdit={handleEditResource}

                    onDelete={handleOpenDeleteModal}

                />

            </div>

            {/* FORMULARIO */}

            <ResourceFormModal

                isOpen={isResourceFormOpen}

                resource={editingResource}

                onClose={handleCloseResourceForm}

                onSave={handleSaveResource}

            />

            {/* DETALLES */}

            <ResourceDetailsModal

                resource={viewingResource}

                onClose={handleCloseResourceDetails}

                onEdit={handleEditResource}

            />

            {/* CONFIRMACIÓN DE ELIMINACIÓN */}

            <ResourceDeleteModal

                resource={deletingResource}

                onClose={handleCloseDeleteModal}

                onConfirm={handleConfirmDelete}

            />

        </main>

    );

}

export default ResourcesManagement;
