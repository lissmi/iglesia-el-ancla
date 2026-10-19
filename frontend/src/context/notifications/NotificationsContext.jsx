// =========================================================
// NOTIFICACIONES: REGISTROS FINANCIEROS COMPARTIDOS
// =========================================================
// Etapa 2: alertas derivadas de gastos existentes.
// No se crean registros ficticios ni se guarda información en el servidor.

import {
  createContext, useCallback, useContext, useMemo, useState,
} from "react";
import { useExpenses } from "../expenses/ExpensesContext";

const NotificationsContext = createContext(null);

// Obtenemos la fecha local, sin convertirla a UTC.
function getTodayLocal() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Validamos una fecha de vencimiento en formato AAAA-MM-DD.
function isValidDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const test = new Date(year, month - 1, day);
  return test.getFullYear() === year && test.getMonth() + 1 === month && test.getDate() === day;
}

function formatMoney(amount) {
  const number = Number(amount);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(number)
    : "monto no disponible";
}

// Una alerta por gasto vencido. ID estable para evitar duplicaciones.
function deriveExpenseNotifications(expenses, basePath) {
  const today = getTodayLocal();
  return expenses
    .filter((expense) =>
      expense?.id != null &&
      expense.status === "Pendiente" &&
      isValidDateOnly(expense.dueDate) &&
      expense.dueDate < today
    )
    .map((expense) => ({
      id: `expense-overdue:${String(expense.id)}:${expense.dueDate}`,
      category: "finance",
      title: "Pago vencido",
      message: `${expense.description || "Gasto sin descripción"} · ${formatMoney(expense.amount)}. Fecha de vencimiento: ${expense.dueDate}.`,
      dateLabel: `Vencimiento: ${new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${expense.dueDate}T12:00:00`))}`,
      path: `${basePath}/finanzas/gastos`,
      source: "expense",
      // Referencia al gasto para abrir directamente su ficha.
      expenseId: String(expense.id),
    }));
}

// basePath procede del panel activo, nunca de campos editables del gasto.
export function NotificationsProvider({ children, initialNotifications = [], basePath = "/admin" }) {
  const { expenses } = useExpenses();
  const [readIds, setReadIds] = useState(() => new Set());
  const [manualNotifications] = useState(() =>
    Array.isArray(initialNotifications) ? initialNotifications : []
  );

  // Se calculan al modificar el arreglo compartido de gastos.
  const derived = useMemo(
    () => deriveExpenseNotifications(expenses, basePath),
    [expenses, basePath]
  );

  // Solo guardamos IDs leídos en memoria. No se persisten al recargar.
  const notifications = useMemo(() => [
    ...derived.map((item) => ({ ...item, read: readIds.has(item.id) })),
    ...manualNotifications.map((item) => ({
      ...item,
      read: Boolean(item.read) || readIds.has(item.id),
    })),
  ], [derived, manualNotifications, readIds]);

  const markAsRead = useCallback((id) => {
    setReadIds((previous) => new Set([...previous, id]));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((previous) => new Set([
      ...previous,
      ...derived.map((item) => item.id),
      ...manualNotifications.map((item) => item.id),
    ]));
  }, [derived, manualNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const value = useMemo(() => ({
    notifications, unreadCount, markAsRead, markAllAsRead,
  }), [notifications, unreadCount, markAsRead, markAllAsRead]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications requiere NotificationsProvider.");
  return context;
}
