// =========================================================
// IMPORTACIONES
// =========================================================
import { useMemo, useState } from "react";

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

// =========================================================
// DATOS TEMPORALES: se reemplazarán por la API
// =========================================================
const INITIAL_RECOMMENDATIONS = [
    {
        id: "rec-001",
        title: "Ansiosos por nada",
        category: "books",
        creator: "Max Lucado",
        description: "Una lectura sobre la ansiedad, la confianza y la paz desde una perspectiva cristiana.",
        reason: "Invita a reflexionar sobre la confianza en Dios en momentos difíciles.",
        image: "",
        link: "",
        audience: ["general"],
        status: "published",
        featured: true,
        createdAt: "2026-10-10T12:00:00.000Z",
    },
    {
        id: "rec-002",
        title: "The Chosen",
        category: "series",
        creator: "Dallas Jenkins",
        description: "Serie dramática inspirada en los relatos de los Evangelios.",
        reason: "Puede servir como punto de partida para conversar sobre los relatos bíblicos.",
        image: "",
        link: "",
        audience: ["general", "kids_youth"],
        status: "published",
        featured: false,
        createdAt: "2026-10-08T12:00:00.000Z",
    },
    {
        id: "rec-003",
        title: "Selección musical para jóvenes",
        category: "music",
        creator: "Equipo de contenidos",
        description: "Selección musical pendiente de revisión y publicación.",
        reason: "Propuesta de material para actividades juveniles.",
        image: "",
        link: "",
        audience: ["kids_youth"],
        status: "draft",
        featured: false,
        createdAt: "2026-10-12T12:00:00.000Z",
    },
];

function makeRecommendationId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// =========================================================
// PÁGINA PRINCIPAL
// =========================================================
function RecommendationsManagement() {
    const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);
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

    async function handleSaveRecommendation(payload) {
        if (editingRecommendation) {
            setRecommendations((previous) =>
                previous.map((item) =>
                    item.id === editingRecommendation.id
                        ? { ...item, ...payload, id: item.id }
                        : item
                )
            );
        } else {
            const newRecommendation = {
                ...payload,
                id: makeRecommendationId(),
                createdAt: new Date().toISOString(),
            };
            setRecommendations((previous) => [newRecommendation, ...previous]);
        }
        setEditingRecommendation(null);
    }

    async function handleConfirmDelete(recommendation) {
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
