// =========================================================
// CONTEXTO GLOBAL DE GASTOS - IGLESIA EL ANCLA
// MongoDB es la fuente de verdad. No cargamos datos ficticios.
// =========================================================

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";

import {
  deleteGasto as deleteExpenseRequest, createExpense, expenseApiError, listExpenses, updateExpense,
} from "../../services/expensesApi";

const ExpensesContext = createContext(null);

export function ExpensesProvider({ children }) {
  // La misma colección alimenta el resumen, gráficos y notificaciones.
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Se solicita al entrar al panel administrativo; evita consultar finanzas
  // desde páginas públicas y antes de que exista una sesión activa.
  const refreshExpenses = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const records = await listExpenses();
      setExpenses(records);
      return records;
    } catch (requestError) {
      const message = expenseApiError(requestError);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // AdminLayout monta este proveedor solo dentro de rutas administrativas.
  // Cargamos una vez al entrar para poblar también el encabezado y las alertas.
  useEffect(() => {
    refreshExpenses().catch(() => {
      // El mensaje ya está en error; se muestra en la pantalla de gastos.
    });
  }, [refreshExpenses]);

  // Guardado completo, sin estados temporales ni identificadores inventados.
  const saveExpense = useCallback(async (expenseData, expenseToEdit = null, receiptFile = null) => {
    const { receiptImage, ...fields } = expenseData;
    // receiptImage es solo la vista previa local del formulario, NUNCA se persiste.
    void receiptImage;
    try {
      const updated = expenseToEdit
        ? await updateExpense(expenseToEdit.id, fields, expenseToEdit.version, receiptFile)
        : await createExpense(fields, receiptFile);
      setExpenses((previous) => expenseToEdit
        ? previous.map((item) => item.id === updated.id ? updated : item)
        : [updated, ...previous]);
      setError("");
      return updated;
    } catch (requestError) {
      throw new Error(expenseApiError(requestError));
    }
  }, []);

  // Eliminación definitiva: MongoDB y auditoría se confirman en una transacción.
  const deleteExpense = useCallback(async (id) => {
    const current = expenses.find((item) => item.id === id);
    if (!current) throw new Error("No se encontró el gasto solicitado");
    try {
      const result = await deleteExpenseRequest(id, current.version);
      setExpenses((previous) => previous.filter((item) => item.id !== id));
      setError("");
      return result;
    } catch (requestError) {
      throw new Error(expenseApiError(requestError));
    }
  }, [expenses]);

  const value = useMemo(() => ({
    expenses, isLoading, error, refreshExpenses, saveExpense, deleteExpense,
  }), [expenses, isLoading, error, refreshExpenses, saveExpense, deleteExpense]);

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) throw new Error("useExpenses requiere ExpensesProvider.");
  return context;
}
