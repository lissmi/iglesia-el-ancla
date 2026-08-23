// Importamos los estilos exclusivos del menú.
import "../../../styles/components/admin/expenses/ExpenseNavigation.css";


// Creamos el componente encargado de navegar
// entre las diferentes secciones de gestión de gastos.
//
// activeSection indica qué sección se encuentra seleccionada.
// onSectionChange permite informar a la página cuando cambia.
function ExpenseNavigation({
  activeSection,
  onSectionChange,
}) {

  // Creamos las opciones disponibles dentro del módulo.
  const navigationItems = [
    {
      // Identificador interno.
      id: "summary",

      // Texto visible para el usuario.
      label: "Resumen",
    },
    {
      // Identificador interno.
      id: "charts",

      // Texto visible.
      label: "Análisis",
    },
    {
      // Identificador interno.
      id: "upcoming",

      // Texto visible.
      label: "Próximos gastos",
    },
    {
      // Identificador interno.
      id: "history",

      // Texto visible.
      label: "Historial",
    },
  ];


  // Retornamos el menú.
  return (
    <nav
      className="expense-navigation"
      aria-label="Secciones de gestión de gastos"
    >

      {/* Recorremos cada opción del menú. */}
      {navigationItems.map((item) => (

        // Creamos un botón por cada sección.
        <button
          key={item.id}
          type="button"
          className={`expense-navigation__button ${
            activeSection === item.id
              ? "expense-navigation__button--active"
              : ""
          }`}
          onClick={() =>
            onSectionChange(item.id)
          }
        >

          {/* Mostramos el nombre de la sección. */}
          {item.label}

        </button>

      ))}

    </nav>
  );
}


// Exportamos el componente.
export default ExpenseNavigation;