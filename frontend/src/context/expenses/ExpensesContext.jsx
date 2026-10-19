
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// Importamos los gastos de demostración existentes.
import {
  expenses as initialExpenses,
} from "../../data/admin/expensesData";

// =========================================================
// CREAR CONTEXTO
// =========================================================

// Este contexto permitirá compartir los gastos
// entre diferentes componentes administrativos.
const ExpensesContext = createContext(null);


// =========================================================
// PROVEEDOR DE GASTOS
// =========================================================

export function ExpensesProvider({ children }) {

  // Inicializamos los gastos con los registros existentes.
  // Más adelante estos datos vendrán de MongoDB.
  const [expenses, setExpenses] = useState(() =>
    initialExpenses.map((expense) => ({
      ...expense,
    }))
  );


  // =======================================================
  // GUARDAR O ACTUALIZAR GASTO
  // =======================================================

  const saveExpense = useCallback((
    expenseData,
    expenseToEdit = null
  ) => {

    // Si existe un gasto seleccionado, lo actualizamos.
    if (expenseToEdit) {

      setExpenses((previousExpenses) =>
        previousExpenses.map((expense) =>
          expense.id === expenseToEdit.id
            ? {
                ...expense,
                ...expenseData,
                id: expense.id,
              }
            : expense
        )
      );

      return;
    }

    // Creamos un nuevo gasto con un ID temporal.
    const newExpense = {
      ...expenseData,
      id: crypto.randomUUID(),
    };

    // Lo agregamos al comienzo del listado.
    setExpenses((previousExpenses) => [
      newExpense,
      ...previousExpenses,
    ]);

  }, []);


  // =======================================================
  // ELIMINAR GASTO
  // =======================================================

  const deleteExpense = useCallback((expenseId) => {

    // Eliminamos únicamente el registro indicado.
    setExpenses((previousExpenses) =>
      previousExpenses.filter(
        (expense) => expense.id !== expenseId
      )
    );

  }, []);


  // =======================================================
  // COMPARTIR INFORMACIÓN
  // =======================================================

  // useMemo evita crear innecesariamente
  // un nuevo objeto de contexto.
  const value = useMemo(() => ({
    expenses,
    saveExpense,
    deleteExpense,
  }), [
    expenses,
    saveExpense,
    deleteExpense,
  ]);


  // Hacemos que los componentes hijos
  // puedan acceder a estos datos.
  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}


// =========================================================
// HOOK PERSONALIZADO
// =========================================================

export function useExpenses() {

  // Accedemos al contexto de gastos.
  const context = useContext(ExpensesContext);

  // Detectamos si se utiliza fuera del proveedor.
  if (!context) {
    throw new Error(
      "useExpenses requiere ExpensesProvider."
    );
  }

  // Devolvemos las funciones y los registros.
  return context;
}
