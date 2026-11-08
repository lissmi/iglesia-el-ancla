// =========================================================
// IMPORTACIONES
// =========================================================

// Importamos los hooks de navegación de React Router.
import { useLocation, useNavigate } from "react-router-dom";

// Importamos los iconos de las categorías.
import {
    BookOpen,
    NotebookTabs,
    Sun,
    GraduationCap,
    HandHeart,
    FileDown,
    CircleHelp,
    LibraryBig,
    Music2,
    LayoutGrid,
    ArrowRight,
} from "lucide-react";

// Importamos los estilos del componente.
import "../../../styles/components/administration/resources/ResourcesCategories.css";


// =========================================================
// CONFIGURACIÓN DE CATEGORÍAS
// =========================================================

export const RESOURCE_CATEGORIES = [
    {
        id: "bible",
        name: "Biblia",
        description: "66 libros y herramientas de estudio",
        icon: BookOpen,
    },
    {
        id: "studies",
        name: "Guías y estudios",
        description: "Material de formación bíblica",
        icon: NotebookTabs,
    },
    {
        id: "devotionals",
        name: "Devocionales",
        description: "Reflexiones y lecturas diarias",
        icon: Sun,
    },
    {
        id: "discipleship",
        name: "Discipulado",
        description: "Crecimiento y formación espiritual",
        icon: GraduationCap,
    },
    {
        id: "prayer_guides",
        name: "Guías de oración",
        description: "Materiales para fortalecer la vida de oración",
        icon: HandHeart,
    },
    {
        id: "downloads",
        name: "Archivos y descargables",
        description: "Documentos y materiales PDF",
        icon: FileDown,
    },

    // Nueva categoría administrativa de Biblioteca Solidaria.
    {
        id: "solidarity_library",
        name: "Biblioteca Solidaria",
        description: "Publicar y administrar libros cristianos",
        icon: LibraryBig,

        // Indica que esta categoría abre una página propia.
        isManagementModule: true,
    },
    // Módulo administrativo para publicar letras en PDF.
    {
        id: "songbook",
        name: "Cancionero de alabanzas",
        description: "Publicar y administrar letras de canciones",
        icon: Music2,
        isManagementModule: true,
    },
    {
        id: "faq",
        name: "Preguntas frecuentes",
        description: "Respuestas y orientación",
        icon: CircleHelp,
    },
];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ResourcesCategories({
    resources = [],
    externalCounts = {},
    selectedCategory = "all",
    onSelectCategory,
}) {

    // =====================================================
    // NAVEGACIÓN
    // =====================================================

    // Permite cambiar de página desde una tarjeta.
    const navigate = useNavigate();

    // Obtiene la dirección actual del navegador.
    const location = useLocation();

    // Detectamos si el usuario está en el panel superadmin.
    const isSuperAdmin =
        location.pathname.startsWith("/super-admin");

    // Definimos la ruta principal según el panel actual.
    const administrationBasePath = isSuperAdmin
        ? "/super-admin"
        : "/admin";


    // =====================================================
    // CANTIDAD DE RECURSOS POR CATEGORÍA
    // =====================================================

    function getCategoryCount(categoryId) {

        // Para el filtro general contamos todos los recursos.
        if (categoryId === "all") {
            // No mostramos un total incompleto si uno de los catálogos no respondió.
            if (!Number.isSafeInteger(externalCounts.solidarity_library) ||
                !Number.isSafeInteger(externalCounts.songbook)) return null;
            return resources.length + 66 + externalCounts.solidarity_library +
                externalCounts.songbook;
        }

        // Biblioteca y cancionero consultan su propio backend, no datos de prueba.
        if (categoryId === "solidarity_library" || categoryId === "songbook") {
            return externalCounts[categoryId];
        }

        // En Biblia contamos los 66 libros y también las seis herramientas.
        if (categoryId === "bible") return 66 + resources.filter((item) => item.category === "bible").length;

        // Contamos los recursos de la categoría seleccionada.
        return resources.filter(
            (resource) => resource.category === categoryId
        ).length;
    }


    // =====================================================
    // CATEGORÍAS DISPONIBLES
    // =====================================================

    const categories = [
        {
            id: "all",
            name: "Todos los recursos",
            description: "Explorar el catálogo completo",
            icon: LayoutGrid,
        },

        // Incorporamos las categorías configuradas.
        ...RESOURCE_CATEGORIES,
    ];


    // =====================================================
    // CONTROL DE NAVEGACIÓN
    // =====================================================

    function handleCategoryClick(category) {

        // Comprobamos si es un módulo administrativo.
        if (category.isManagementModule) {

            // La biblioteca y el cancionero tienen rutas de gestión independientes.
            if (category.id === "solidarity_library" || category.id === "songbook") {

                // Navegamos respetando el rol administrativo.
                navigate(
                    category.id === "songbook"
                        ? `${administrationBasePath}/recursos/cancionero`
                        : `${administrationBasePath}/recursos/biblioteca-solidaria`
                );

                // Evitamos ejecutar el filtro tradicional.
                return;
            }
        }

        // Cada categoría de estudio abre una página con su propia URL.
        // Conservamos la misma página de administración, sin duplicar componentes.
        if (category.id === "all") {
            navigate(`${administrationBasePath}/recursos`);
        } else {
            navigate(`${administrationBasePath}/recursos/${category.id}`);
        }
        onSelectCategory?.(category.id);
    }


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section className="resources-categories">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="resources-categories__heading">

                <div>
                    <h2>
                        Categorías de recursos
                    </h2>

                    <p>
                        Organiza y consulta los contenidos
                        disponibles por categoría.
                    </p>
                </div>

                {/* Contador de categorías configuradas. */}
                <span className="resources-categories__total">
                    {RESOURCE_CATEGORIES.length} categorías
                </span>

            </div>


            {/* =========================================== */}
            {/* CUADRÍCULA DE CATEGORÍAS */}
            {/* =========================================== */}

            <div className="resources-categories__grid">

                {categories.map((category) => {

                    // Obtenemos el componente de icono.
                    const Icon = category.icon;

                    // Verificamos si la categoría está seleccionada.
                    const isSelected =
                        selectedCategory === category.id;

                    // Calculamos los recursos relacionados.
                    const count = getCategoryCount(category.id);

                    // Identificamos las categorías con módulo propio.
                    const isManagementModule =
                        category.isManagementModule === true;

                    return (
                        <button
                            key={category.id}

                            type="button"

                            className={
                                "resources-categories__card" +
                                (isSelected && !isManagementModule
                                    ? " resources-categories__card--active"
                                    : "")
                            }

                            // Ejecutamos navegación o filtro.
                            onClick={() => {
                                handleCategoryClick(category);
                            }}

                            // Ahora todas las tarjetas navegan; no son filtros de selección.
                            aria-label={`Abrir ${category.name}`}
                        >

                            {/* Icono de la categoría. */}
                            <div className="resources-categories__icon">

                                <Icon
                                    size={21}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                            </div>


                            {/* Información de la categoría. */}
                            <div className="resources-categories__info">

                                <strong>
                                    {category.name}
                                </strong>

                                <span>
                                    {category.description}
                                </span>

                            </div>


                            {/* Contador y navegación. */}
                            <div className="resources-categories__meta">

                                {/* Los módulos independientes no usan
                                    el contador de recursos generales. */}

                                {/* Las cantidades del cancionero y biblioteca son reales.
                                    Si su API falla, no mostramos un cero inventado. */}
                                <span className="resources-categories__count"
                                    title={count === null || count === undefined ? "Cantidad no disponible" : undefined}>
                                    {count ?? "—"}
                                </span>

                                {/* Icono para indicar acceso. */}
                                <ArrowRight
                                    size={16}
                                    aria-hidden="true"
                                />

                            </div>

                        </button>
                    );
                })}

            </div>

        </section>
    );
}


// =========================================================
// EXPORTACIÓN
// =========================================================

// Exportamos el componente administrativo.
export default ResourcesCategories;
