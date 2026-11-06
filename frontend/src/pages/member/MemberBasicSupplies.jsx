// =========================================================
// COLABORACIÓN EN INSUMOS BÁSICOS - IGLESIA EL ANCLA
// La reserva no altera el inventario hasta que se entregue.
// =========================================================
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { HandHeart, PackageCheck, PackageX, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { listBasicSuppliesNeeds, pledgeBasicSupply, cancelBasicSupplyPledge, basicSupplyApiError } from "../../services/basicSuppliesApi";
import "../../styles/pages/member/MemberBasicSupplies.css";

export default function MemberBasicSupplies() {
  const { refreshBasicSupplyNeeds } = useOutletContext() || {};
  const [supplies, setSupplies] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function reload() {
    setLoading(true); setError("");
    try {
      const data = await listBasicSuppliesNeeds();
      setSupplies(data.supplies || []);
    } catch (cause) { setError(basicSupplyApiError(cause)); }
    finally { setLoading(false); }
  }
  useEffect(() => { reload(); }, []);

  async function act(id, fn, success) {
    if (workingId) return;
    setWorkingId(id); setError(""); setMessage("");
    try {
      await fn();
      await reload();
      // Actualizamos los avisos sin crear una colección de notificaciones.
      refreshBasicSupplyNeeds?.();
      setMessage(success);
    } catch (cause) { setError(basicSupplyApiError(cause)); }
    finally { setWorkingId(""); }
  }

  return (
    <main className="member-basic-supplies">
      <div className="member-basic-supplies__container">
        <header className="member-basic-supplies__header">
          <span className="member-basic-supplies__eyebrow"><HandHeart size={17} /> Participemos juntos</span>
          <h1>Insumos básicos que necesitamos</h1>
          <p>Pequeños aportes pueden hacer una gran diferencia. Aquí puedes ver qué necesita la iglesia y, si deseas, anotarte para colaborar.</p>
          <button type="button" onClick={reload} disabled={loading || !!workingId}><RefreshCw size={16} /> Actualizar necesidades</button>
        </header>

        <div className="member-basic-supplies__note">
          <PackageCheck size={20} aria-hidden="true" />
          <p>Si te anotas, estaremos contando con tu ayuda. La cantidad se añadirá al inventario cuando un administrador confirme que la recibió. Puedes retirar tu compromiso antes de la entrega.</p>
        </div>
        {error && <p className="member-basic-supplies__error" role="alert">{error}</p>}
        {message && <p className="member-basic-supplies__success" role="status">{message}</p>}
        {loading ? <p role="status">Consultando lo que necesitamos...</p> : supplies.length === 0 ? (
          <div className="member-basic-supplies__empty"><CheckCircle2 size={32} /><h2>¡Estamos bien abastecidos!</h2><p>Por ahora no hay insumos que necesiten reposición. Gracias por estar atento a nuestra comunidad.</p></div>
        ) : (
          <div className="member-basic-supplies__grid">
            {supplies.map((supply) => {
              const available = supply.remainingToPromise;
              const pledged = supply.myCommitment > 0;
              const quantity = quantities[supply.id] ?? "1";
              const valid = Number.isSafeInteger(Number(quantity)) && Number(quantity) > 0 && Number(quantity) <= Math.min(500, available);
              return <article className="member-basic-supplies__card" key={supply.id}>
                <div className="member-basic-supplies__card-top">
                  <span className={`member-basic-supplies__status member-basic-supplies__status--${supply.status}`}>
                    {supply.status === "out" ? <PackageX size={15} /> : <PackageCheck size={15} />}
                    {supply.status === "out" ? "Agotado" : supply.status === "available" ? "Ya se repuso" : "Quedan pocas unidades"}
                  </span>
                  <span>{supply.category}</span>
                </div>
                <h2>{supply.name}</h2>
                <p>{supply.notes || "Un producto importante para nuestras actividades y reuniones."}</p>
                <div className="member-basic-supplies__figures">
                  <div><span>Tenemos</span><strong>{supply.stock} unidades</strong></div>
                  <div><span>Nos faltan por cubrir</span><strong>{available} unidades</strong></div>
                </div>
                {supply.committedQuantity > 0 && <p className="member-basic-supplies__people">Nuestra comunidad ya comprometió {supply.committedQuantity} unidades.</p>}
                {pledged ? <div className="member-basic-supplies__pledged">
                  <strong><CheckCircle2 size={18} /> Gracias por sumarte</strong>
                  <p>Te anotaste con {supply.myCommitment} unidades.</p>
                  <button type="button" disabled={!!workingId} onClick={() => act(supply.id, () => cancelBasicSupplyPledge(supply.id), "Retiramos tu compromiso.")}><XCircle size={16} /> Retirar mi compromiso</button>
                </div> : available > 0 ? <form className="member-basic-supplies__form" onSubmit={(event) => { event.preventDefault(); act(supply.id, () => pledgeBasicSupply(supply.id, Number(quantity)), "¡Gracias por ofrecer tu ayuda!"); }}>
                  <label htmlFor={`qty-${supply.id}`}>¿Con cuántas unidades te gustaría colaborar?</label>
                  <div className="member-basic-supplies__form-row">
                    <input id={`qty-${supply.id}`} type="number" min="1" max={Math.min(500, available)} step="1" value={quantity} onChange={(event) => setQuantities((old) => ({ ...old, [supply.id]: event.target.value }))} />
                    <button type="submit" disabled={!valid || !!workingId}><HandHeart size={17} /> {workingId === supply.id ? "Guardando..." : "Quiero colaborar"}</button>
                  </div>
                </form> : <p className="member-basic-supplies__covered">Las cantidades necesarias ya están comprometidas. ¡Gracias a todos!</p>}
              </article>;
            })}
          </div>
        )}
      </div>
    </main>
  );
}
