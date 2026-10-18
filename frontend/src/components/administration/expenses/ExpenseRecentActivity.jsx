// =========================================================
// MOVIMIENTOS RECIENTES CON ACCESO A LOS DETALLES
// =========================================================
import { useMemo } from "react";
import { ArrowUpRight, History, ReceiptText } from "lucide-react";
import { formatExpenseCurrency, formatExpenseDate } from "../../../utils/expenseUtils";
import "../../../styles/components/administration/expenses/ExpenseRecentActivity.css";

function ExpenseRecentActivity({ expenses = [], onViewExpense }) {
  // El orden se establece por la fecha registrada, sin inventar fecha de creación.
  const recentExpenses = useMemo(() => [...expenses]
    .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")))
    .slice(0, 5), [expenses]);

  return (
    <section className="expense-recent" aria-labelledby="expense-recent-title">
      <div className="expense-recent__header">
        <div>
          <span className="expense-recent__eyebrow"><History size={14} aria-hidden="true" /> ACTIVIDAD RECIENTE</span>
          <h2 id="expense-recent-title">Últimos movimientos</h2>
          <p>Los cinco gastos con fecha de registro más reciente.</p>
        </div>
      </div>
      {recentExpenses.length === 0 ? (
        <div className="expense-recent__empty">Todavía no se registraron gastos.</div>
      ) : (
        <div className="expense-recent__list">
          {recentExpenses.map((expense) => {
            const receipt = expense.receiptImage;
            const hasReceipt = typeof receipt === "string" ? !!receipt.trim() : !!receipt?.url?.trim?.();
            return (
              <button type="button" key={expense.id} className="expense-recent__item" onClick={() => onViewExpense?.(expense)} disabled={!onViewExpense}>
                <span className="expense-recent__icon"><ReceiptText size={18} aria-hidden="true" /></span>
                <span className="expense-recent__copy">
                  <strong>{expense.description || "Gasto sin descripción"}</strong>
                  <small>{expense.date ? formatExpenseDate(expense.date) : "Sin fecha"} · {expense.status || "Sin estado"}{hasReceipt ? " · Con comprobante" : ""}</small>
                </span>
                <span className="expense-recent__amount">{formatExpenseCurrency(expense.amount)}</span>
                <ArrowUpRight size={17} className="expense-recent__arrow" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ExpenseRecentActivity;
