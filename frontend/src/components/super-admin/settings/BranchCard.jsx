// =========================================================
// TARJETA DE SUCURSAL — SOLO CONSULTA
// =========================================================
import { Building2, Church, Mail, MapPin, Phone, Clock3, Hash, Pencil, Power, PowerOff } from "lucide-react";
import "../../../styles/components/super-admin/settings/BranchCard.css";

function BranchCard({ branch, onEdit, onChangeStatus, disabled = false }) {
  // La API devuelve el identificador como id, no como _id.
  const address = branch.address || {};
  const street = [address.street, address.number].filter(Boolean).join(" ");
  const locality = [address.sector, address.city, address.region, address.country]
    .filter(Boolean).join(", ");

  return (
    <article className="branch-card">
      <div className="branch-card__top">
        <div className="branch-card__identity">
          <span className="branch-card__icon"><Building2 size={23} aria-hidden="true" /></span>
          <div>
            <span className="branch-card__code"><Hash size={13} aria-hidden="true" />{branch.code}</span>
            <h3>{branch.name}</h3>
          </div>
        </div>
        <div className="branch-card__badges">
          {branch.isHeadquarters && <span className="branch-card__badge branch-card__badge--headquarters"><Church size={13} /> Sede principal</span>}
          <span className={`branch-card__badge ${branch.isActive ? "branch-card__badge--active" : "branch-card__badge--inactive"}`}>
            {branch.isActive ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>
      <div className="branch-card__details">
        <div className="branch-card__detail"><MapPin size={17} /><div><small>Dirección</small><strong>{street || "Sin dirección"}</strong><span>{locality || "Ubicación no disponible"}</span></div></div>
        <div className="branch-card__detail"><Mail size={17} /><div><small>Correo de contacto</small><strong>{branch.contactEmail || "Por configurar"}</strong></div></div>
        <div className="branch-card__detail"><Phone size={17} /><div><small>Teléfono de contacto</small><strong>{branch.contactPhone || "Por configurar"}</strong></div></div>
        <div className="branch-card__detail"><Clock3 size={17} /><div><small>Zona horaria</small><strong>{branch.timezone || "Por configurar"}</strong></div></div>
      </div>
      <footer className="branch-card__footer"><span>Información sincronizada con MongoDB</span><div className="branch-card__buttons">
        <button className="branch-card__edit" type="button" onClick={() => onEdit(branch)} disabled={disabled}><Pencil size={15}/> Editar sucursal</button>
        <button
          type="button"
          className={`branch-card__status ${branch.isActive ? "branch-card__status--disable" : "branch-card__status--enable"}`}
          onClick={() => onChangeStatus(branch)}
          disabled={disabled || (branch.isActive && branch.isHeadquarters)}
          title={branch.isActive && branch.isHeadquarters ? "La sede principal no puede desactivarse" : undefined}
        >
          {branch.isActive ? <PowerOff size={15}/> : <Power size={15}/>}
          {branch.isActive ? "Desactivar" : "Activar"}
        </button>
      </div></footer>
    </article>
  );
}

export default BranchCard;
