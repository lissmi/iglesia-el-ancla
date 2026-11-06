// =========================================================
// IMPORTACIONES
// =========================================================
import { useEffect, useMemo, useState } from "react";

import RecommendationsHeader from "../../components/administration/recommendations/RecommendationsHeader";
import RecommendationsSummary from "../../components/administration/recommendations/RecommendationsSummary";
import RecommendationsCategories, {
    matchesRecommendationCategory,
} from "../../components/administration/recommendations/RecommendationsCategories";
import RecommendationsToolbar from "../../components/administration/recommendations/RecommendationsToolbar";
import RecommendationsList from "../../components/administration/recommendations/RecommendationsList";
import RecommendationFormModal from "../../components/administration/recommendations/RecommendationFormModal";
import RecommendationDetailsModal from "../../components/administration/recommendations/RecommendationDetailsModal";
import RecommendationDeleteModal from "../../components/administration/recommendations/RecommendationDeleteModal";

import "../../styles/pages/administration/RecommendationsManagement.css";

// Las operaciones reales se realizan mediante la API administrativa.
import {
    listAdminRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
} from "../../services/recommendationsApi";

// =========================================================
// PÁGINA PRINCIPAL
// =========================================================
function RecommendationsManagement() {
    // Los registros se descargan desde MongoDB mediante el backend.
    const [recommendations, setRecommendations] = useState([]);
    // Estado de carga inicial y errores generales de conexión.
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingRecommendation, setEditingRecommendation] = useState(null);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);

    // =====================================================
    // OBTENER RECOMENDACIONES DEL BACKEND
    // =====================================================
    useEffect(() => {
        // Evita actualizar el estado cuando el componente ya se desmontó.
        let active = true;

        async function loadRecommendations() {
            setIsLoading(true);
            setPageError("");
            try {
                // La API administrativa incluye publicados y borradores.
                const items = await listAdminRecommendations();
                if (active) setRecommendations(items);
            } catch (error) {
                if (active) setPageError(error.message || "No se pudieron cargar las recomendaciones.");
            } finally {
                if (active) setIsLoading(false);
            }
        }

        void loadRecommendations();
        return () => { active = false; };
    }, []);

    // =====================================================
    // FILTRADO Y ORDENAMIENTO
    // =====================================================
    const filteredRecommendations = useMemo(() => {
        const search = searchTerm.trim().toLocaleLowerCase("es");
        const results = recommendations.filter((recommendation) => {
            const matchesCategory = matchesRecommendationCategory(
                recommendation,
                selectedCategory
            );
            const matchesStatus =
                statusFilter === "all" || recommendation.status === statusFilter;
            const searchableText = [
                recommendation.title,
                recommendation.creator,
                recommendation.description,
                recommendation.reason,
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("es");
            return matchesCategory && matchesStatus && searchableText.includes(search);
        });

        results.sort((a, b) => {
            if (sortBy === "title_asc") {
                return (a.title || "").localeCompare(b.title || "", "es");
            }
            if (sortBy === "title_desc") {
                return (b.title || "").localeCompare(a.title || "", "es");
            }
            const aDate = Date.parse(a.createdAt || "") || 0;
            const bDate = Date.parse(b.createdAt || "") || 0;
            return sortBy === "oldest" ? aDate - bDate : bDate - aDate;
        });
        return results;
    }, [recommendations, selectedCategory, searchTerm, statusFilter, sortBy]);

    // =====================================================
    // ACCIONES DE CREACIÓN, EDICIÓN Y ELIMINACIÓN
    // =====================================================
    function handleCreateRecommendation() {
        setEditingRecommendation(null);
        setIsFormOpen(true);
    }

    function handleViewRecommendation(recommendation) {
        setSelectedRecommendation(recommendation);
        setIsDetailsOpen(true);
    }

    function handleEditRecommendation(recommendation) {
        setIsDetailsOpen(false);
        setEditingRecommendation(recommendation);
        setIsFormOpen(true);
    }

    function handleDeleteRecommendation(recommendation) {
        setSelectedRecommendation(recommendation);
        setIsDeleteOpen(true);
    }

    // Crea o actualiza en MongoDB y modifica la interfaz solo después de confirmar.
    async function handleSaveRecommendation(payload, imageFile) {
        // La imagen local se envía a Cloudinary a través del backend.
        const saved = editingRecommendation
            ? await updateRecommendation(editingRecommendation.id, payload, imageFile)
            : await createRecommendation(payload, imageFile);

        // Conserva la respuesta normalizada del servidor (incluye id y fechas).
        setRecommendations((previous) => editingRecommendation
            ? previous.map((item) => item.id === saved.id ? saved : item)
            : [saved, ...previous]
        );
        setEditingRecommendation(null);
    }

    // Elimina en backend antes de quitar la tarjeta en pantalla.
    async function handleConfirmDelete(recommendation) {
        await deleteRecommendation(recommendation.id);
        setRecommendations((previous) =>
            previous.filter((item) => item.id !== recommendation.id)
        );
        setIsDeleteOpen(false);
        setSelectedRecommendation(null);
    }

    function handleClearFilters() {
        setSearchTerm("");
        setStatusFilter("all");
        setSortBy("newest");
    }

    // =====================================================
    // INTERFAZ
    // =====================================================
    return (
        <main className="recommendations-management">
            <div className="recommendations-management__container">
                <RecommendationsHeader
                    onCreateRecommendation={handleCreateRecommendation}
                />

                {/* Notificamos fallos de red; nunca mostramos registros ficticios. */}
                {pageError && <p role="alert">{pageError}</p>}
                {isLoading && <p role="status">Cargando recomendaciones...</p>}

                {/* Las secciones se muestran solo después de recibir datos. */}
                {!isLoading && !pageError && (
                    <>
                        <RecommendationsSummary recommendations={recommendations} />

                        <RecommendationsCategories
                            recommendations={recommendations}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />

                        <RecommendationsToolbar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            onClearFilters={handleClearFilters}
                        />

                        <RecommendationsList
                            recommendations={filteredRecommendations}
                            onView={handleViewRecommendation}
                            onEdit={handleEditRecommendation}
                            onDelete={handleDeleteRecommendation}
                            onCreate={handleCreateRecommendation}
                        />
                    </>
                )}
            </div>

            <RecommendationFormModal
                isOpen={isFormOpen}
                recommendation={editingRecommendation}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingRecommendation(null);
                }}
                onSave={handleSaveRecommendation}
            />

            <RecommendationDetailsModal
                isOpen={isDetailsOpen}
                recommendation={selectedRecommendation}
                onClose={() => setIsDetailsOpen(false)}
                onEdit={handleEditRecommendation}
            />

            <RecommendationDeleteModal
                isOpen={isDeleteOpen}
                recommendation={selectedRecommendation}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </main>
    );
}

export default RecommendationsManagement;
