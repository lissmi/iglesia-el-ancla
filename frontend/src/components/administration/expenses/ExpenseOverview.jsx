// =========================================================
// INDICADORES COMPLEMENTARIOS DEL RESUMEN FINANCIERO
// =========================================================
import { useMemo } from "react";
import { AlertTriangle, ClipboardCheck, Clock3, Wallet } from "lucide-react";
import { formatExpenseCurrency, getExpenseLocalDate } from "../../../utils/expenseUtils";
import "../../../styles/components/administration/expenses/ExpenseOverview.css";

// Identificamos comprobantes almacenados como objeto o URL.
function hasReceipt(expense) {
  return expense?.hasReceipt === true;
}

function ExpenseOverview({ expenses = [] }) {
  // Actualizamos automáticamente las métricas al cambiar los gastos.
  const overview = useMemo(() => {
    const today = getExpenseLocalDate();
    const pending = expenses.filter((item) => item.status === "Pendiente");
    const paid = expenses.filter((item) => item.status === "Pagado");
    const outstanding = pending.reduce((sum, item) => {
      const amount = Number(item.amount);
      return sum + (Number.isSafeInteger(amount) && amount > 0 ? amount : 0);
    }, 0);
    const overdue = pending.filter((item) =>
      /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate ?? "") && item.dueDate < today
    ).length;
    const withReceipt = paid.filter(hasReceipt).length;
    return { pending: pending.length, outstanding, overdue, withReceipt, paid: paid.length };
  }, [expenses]);

  // No repetimos el desglose por categorías ni el gráfico anual.
  const cards = [
    { id: "pending", icon: Clock3, label: "Pagos pendientes", value: overview.pending, detail: "Compromisos por regularizar" },
    { id: "amount", icon: Wallet, label: "Monto comprometido", value: formatExpenseCurrency(overview.outstanding), detail: "Importe aún no pagado" },
    { id: "overdue", icon: AlertTriangle, label: "Pagos vencidos", value: overview.overdue, detail: "Según fecha de vencimiento" },
    { id: "receipts", icon: ClipboardCheck, label: "Pagados con comprobante", value: `${overview.withReceipt} / ${overview.paid}`, detail: "Respaldo documental adjunto" },
  ];

  return (
    <section className="expense-overview" aria-labelledby="expense-overview-title">
      <div className="expense-overview__heading">
        <div>
          <span className="expense-overview__eyebrow">CONTROL ADMINISTRATIVO</span>
          <h2 id="expense-overview-title">Estado de los compromisos</h2>
          <p>Situación de pagos y documentación de respaldo.</p>
        </div>
      </div>
      <div className="expense-overview__grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="expense-overview__card" key={card.id}>
              <div className="expense-overview__card-top">
                <span>{card.label}</span>
                <span className="expense-overview__icon"><Icon size={19} aria-hidden="true" /></span>
              </div>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ExpenseOverview;
