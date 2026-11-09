// Historial privado de aportes de la cuenta que inició sesión.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, HandHeart, HeartHandshake, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import api from "../../services/api";
import "../../styles/pages/member/MemberDonations.css";

// Utilizamos formato de pesos y fechas de Chile.
const money = (value) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value || 0);
const dateChile = (value) => value ? new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "America/Santiago" }).format(new Date(value)) : "Fecha no disponible";
const AMOUNTS = [5000, 10000, 20000, 50000];

function MemberDonations() {
  // Guardamos únicamente información entregada por el servidor.
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amountText, setAmountText] = useState("5000");
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState("");
  const paymentFormRef = useRef(null);

  // La sesión viaja en cookie segura; nunca enviamos IDs de otras cuentas.
  const loadDonations = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/donaciones/mis-donaciones", { params: { page }, signal });
      if (!data?.success || !Array.isArray(data.donations)) throw new Error("No se pudieron consultar los aportes.");
      if (signal?.aborted) return;
      setDonations(data.donations);
      setSummary(data.summary || { total: 0, count: 0 });
      setPagination(data.pagination || { page: 1, pages: 0, total: 0 });
    } catch (requestError) {
      if (signal?.aborted || requestError?.code === "ERR_CANCELED") return;
      setError(requestError?.response?.status === 401 ? "Tu sesión ha terminado. Inicia sesión nuevamente para ver tus aportes." : "No pudimos cargar tus donaciones. Vuelve a intentarlo.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const controller = new AbortController();
    loadDonations(controller.signal);
    return () => controller.abort();
  }, [loadDonations]);

  const startDonation = async (event) => {
    event.preventDefault();
    if (processing) return;
    const amount = Number(amountText);
    if (!Number.isInteger(amount) || amount < 1000 || amount > 5000000) {
      setFormError("Ingresa un monto entre $1.000 y $5.000, sin decimales.");
      return;
    }
    setProcessing(true);
    setFormError("");
    try {
      const { data } = await api.post("/donaciones/iniciar-miembro", { monto: amount });
      const target = data?.data;
      if (!data?.success || !target?.token || !target?.url) throw new Error("Respuesta de pago incompleta.");
      // Transbank solicita enviar token_ws por POST a su propio formulario.
      const targetUrl = new URL(target.url);
      if (targetUrl.protocol !== "https:") throw new Error("Dirección de pago no segura.");
      const form = paymentFormRef.current;
      if (!form) throw new Error("No se pudo abrir el pago.");
      form.action = targetUrl.toString();
      form.elements.namedItem("token_ws").value = target.token;
      form.submit();
    } catch (requestError) {
      setFormError(requestError?.response?.data?.message || "No pudimos iniciar el aporte. Puedes volver a intentarlo.");
      setProcessing(false);
    }
  };

  return (
    <main className="member-donations">
      <div className="member-donations__container">
        <Link to="/member" className="member-donations__back"><ArrowLeft size={16} /> Mi espacio</Link>
        <header className="member-donations__hero">
          <div className="member-donations__hero-icon"><HandHeart size={30} aria-hidden="true" /></div>
          <div><span className="member-donations__eyebrow">MI ESPACIO PERSONAL</span><h1>Mis donaciones</h1>
            <p>Consulta los aportes realizados desde tu cuenta y conoce sus resultados confirmados.</p></div>
        </header>
        <div className="member-donations__notice"><ShieldCheck size={20} /><p>Este historial es privado: solo tú puedes consultar las donaciones vinculadas a tu cuenta.</p></div>
        <section className="member-donations__summary" aria-label="Resumen de aportes">
          <div><span>Donaciones confirmadas</span><strong>{loading ? "—" : summary.count}</strong></div>
          <div><span>Total de aportes confirmados</span><strong>{loading ? "—" : money(summary.total)}</strong></div>
        </section>
        <section className="member-donations__panel">
          <div className="member-donations__section-header"><div><h2>Historial de donaciones</h2><p>Aparecen los aportes aprobados y asociados a tu cuenta.</p></div>
            <button type="button" className="member-donations__refresh" onClick={() => loadDonations()} disabled={loading}><RefreshCw size={16}/> Actualizar</button></div>
          {loading ? <div className="member-donations__feedback" role="status"><LoaderCircle className="member-donations__spin" size={22} /> Cargando tus aportes...</div>
            : error ? <div className="member-donations__feedback member-donations__feedback--error" role="alert"><AlertCircle size={20} /> {error}</div>
            : donations.length === 0 ? <div className="member-donations__empty"><HeartHandshake size={36} /><h3>Aún no tienes donaciones registradas</h3><p>Cuando realices un aporte desde tu cuenta y se confirme, aparecerá aquí.</p></div>
            : <div className="member-donations__table-scroll"><table className="member-donations__table"><thead><tr><th>Fecha</th><th>Referencia</th><th>Monto</th><th>Estado</th></tr></thead><tbody>{donations.map((donation) => <tr key={donation.id}><td>{dateChile(donation.date)}</td><td className="member-donations__reference">{donation.reference}</td><td className="member-donations__amount">{money(donation.amount)}</td><td><span className="member-donations__approved"><CheckCircle2 size={15}/> Confirmada</span></td></tr>)}</tbody></table></div>}
          {!loading && !error && pagination.pages > 1 && <div className="member-donations__pager"><button type="button" onClick={() => setPage((n) => Math.max(1, n-1))} disabled={page <= 1}><ChevronLeft size={16}/> Anterior</button><span>Página {page} de {pagination.pages}</span><button type="button" onClick={() => setPage((n) => Math.min(pagination.pages, n+1))} disabled={page >= pagination.pages}>Siguiente <ChevronRight size={16}/></button></div>}
        </section>
        <section className="member-donations__panel" aria-labelledby="member-donations-new-title">
          <div className="member-donations__section-header"><div><h2 id="member-donations-new-title">Realizar una donación</h2><p>Si deseas aportar, puedes hacerlo de forma voluntaria y segura.</p></div></div>
          <p className="member-donations__info">Los aportes se procesan en la página protegida de Webpay. Tu donación quedará asociada a esta cuenta cuando se confirme el pago.</p>
          <form onSubmit={startDonation} className="member-donations__form">
            <div className="member-donations__amount-options" aria-label="Montos sugeridos">{AMOUNTS.map((value) => <button key={value} type="button" className={Number(amountText) === value ? "member-donations__preset member-donations__preset--selected" : "member-donations__preset"} onClick={() => {setAmountText(String(value));setFormError("");}} disabled={processing}>{money(value)}</button>)}</div>
            <label htmlFor="member-donation-amount">Monto en pesos chilenos</label><input id="member-donation-amount" type="number" min="1000" max="5000000" step="1" value={amountText} onChange={(event) => setAmountText(event.target.value)} required disabled={processing}/>
            {formError && <p role="alert" className="member-donations__form-error"><AlertCircle size={16}/>{formError}</p>}
            <button type="submit" className="member-donations__donate" disabled={processing}>{processing ? <><LoaderCircle className="member-donations__spin" size={18}/> Preparando el aporte...</> : <><HandHeart size={18}/> Continuar con Webpay</>}</button>
          </form>
          <p className="member-donations__disclaimer">Actualmente estamos utilizando el entorno de pruebas de Webpay. No se realizan cobros reales.</p>
        </section>
        {/* Webpay requiere este envío estándar; no ponemos datos bancarios en React. */}
        <form ref={paymentFormRef} method="POST" style={{ display: "none" }} aria-hidden="true"><input type="hidden" name="token_ws" defaultValue="" /></form>
      </div>
    </main>
  );
}

export default MemberDonations;
