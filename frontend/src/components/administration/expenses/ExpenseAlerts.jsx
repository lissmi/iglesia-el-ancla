// =========================================================
// ALERTAS DEL RESUMEN: COMPROBANTES Y VENCIMIENTOS
// =========================================================
import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, FileQuestion, ArrowUpRight } from "lucide-react";
import { formatExpenseCurrency, formatExpenseDate, getExpenseLocalDate } from "../../../utils/expenseUtils";
import "../../../styles/components/administration/expenses/ExpenseAlerts.css";

// El comprobante es opcional; su ausencia se señala como revisión, no como infracción.
function hasReceipt(expense) {
  return expense?.hasReceipt === true;
}

function ExpenseAlerts({ expenses = [], onViewExpense }) {
  const alerts = useMemo(() => {
    const today = getExpenseLocalDate();
    const items = [];
    expenses.forEach((expense) => {
      const due = expense.dueDate;
      if (expense.status === "Pendiente" && /^\d{4}-\d{2}-\d{2}$/.test(due ?? "") && due < today) {
        items.push({ id: `${expense.id}-late`, expense, type: "overdue", title: "Pago vencido", description: `${expense.description} · ${formatExpenseCurrency(expense.amount)} · Venció el ${formatExpenseDate(due)}` });
      }
      // Se revisan solamente los pagos realizados sin imagen de boleta.
      if (expense.status === "Pagado" && !hasReceipt(expense)) {
        items.push({ id: `${expense.id}-receipt`, expense, type: "receipt", title: "Sin comprobante adjunto", description: `${expense.description} · ${formatExpenseCurrency(expense.amount)}` });
      }
    });
    // Mostramos primero los vencidos y luego la documentación pendiente de revisar.
    items.sort((a, b) => Number(a.type !== "overdue") - Number(b.type !== "overdue"));
    return items;
  }, [expenses]);

  return (
    <section className="expense-alerts" aria-labelledby="expense-alerts-title">
      <div className="expense-alerts__header">
        <div>
          <span className="expense-alerts__eyebrow">SEGUIMIENTO</span>
          <h2 id="expense-alerts-title">Alertas para revisar</h2>
          <p>Asuntos que podrían requerir seguimiento administrativo.</p>
        </div>
        <span className="expense-alerts__count">{alerts.length} avisos</span>
      </div>
      {alerts.length === 0 ? (
        <div className="expense-alerts__empty"><CheckCircle2 size={22} aria-hidden="true" /><span>No se encontraron pagos vencidos ni pagos sin comprobante.</span></div>
      ) : (
        <>
          <div className="expense-alerts__list">
            {alerts.slice(0, 4).map((item) => {
              const Icon = item.type === "overdue" ? AlertTriangle : FileQuestion;
              return (
                <button key={item.id} type="button" className="expense-alerts__item" onClick={() => onViewExpense?.(item.expense)} disabled={!onViewExpense}>
                  <span className={`expense-alerts__icon expense-alerts__icon--${item.type}`}><Icon size={18} aria-hidden="true" /></span>
                  <span className="expense-alerts__copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          {alerts.length > 4 && <p className="expense-alerts__more">Hay {alerts.length - 4} avisos adicionales. Puedes consultar los registros en Historial.</p>}
        </>
      )}
      <p className="expense-alerts__note">Adjuntar comprobantes es opcional; este panel solo facilita su revisión.</p>
    </section>
  );
}

export default ExpenseAlerts;
