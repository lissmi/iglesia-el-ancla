// =========================================================
// GESTIONAR VOLUNTARIOS DE UN SERVICIO
// Esta pantalla NO edita fecha, hora, lugar ni instrucciones.
// Cada participante conserva su confirmación individual.
// =========================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { X, UsersRound, Search, Save, Info, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { VOLUNTEER_TEAMS } from "./VolunteersTeams";
import "../../../styles/components/administration/volunteers/VolunteerParticipantsModal.css";

const RESPONSE_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  declined: "No disponible",
};

function VolunteerParticipantsModal({
  isOpen = false,
  assignment = null,
  volunteers = [],
  assignments = [],
  onClose,
  onSave,
  onGoToRoster,
}) {
  const [required, setRequired] = useState(1);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  // Los valores se restauran cada vez que se abre un servicio distinto.
  useEffect(() => {
    if (!isOpen || !assignment) return;
    const ids = assignment.volunteerIds ||
      (assignment.volunteerId ? [assignment.volunteerId] : []);
    setRequired(Math.max(1, Number(assignment.requiredVolunteers) || 1, ids.length));
    setSelected(ids.map(String));
    setSearch("");
    setError("");
    setSaving(false);
  }, [isOpen, assignment]);

  // Bloqueamos el fondo y facilitamos el uso con teclado.
  useEffect(() => {
    if (!isOpen || !assignment) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const keyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose?.();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const elements = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled])')]
        .filter((item) => item.getClientRects().length > 0);
      if (!elements.length) return;
      if (event.shiftKey && document.activeElement === elements[0]) {
        event.preventDefault(); elements[elements.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === elements[elements.length - 1]) {
        event.preventDefault(); elements[0].focus();
      }
    };
    document.addEventListener("keydown", keyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keyDown);
      if (previousFocused?.isConnected) previousFocused.focus();
    };
  }, [isOpen, assignment, saving, onClose]);

  // Se ofrece únicamente gente activa del equipo y de la sede del servicio.
  // Los participantes antiguos también se muestran para permitir retirarlos.
  const eligible = useMemo(() => {
    if (!assignment) return [];
    const currentIds = new Set(assignment.volunteerIds || []);
    return volunteers.filter((person) =>
      (person.teams || []).includes(assignment.teamId) &&
      (person.branchIds || []).includes(assignment.branchId) &&
      (person.status === "active" || currentIds.has(person.id))
    ).sort((a, b) => (a.name || "").localeCompare(b.name || "", "es"));
  }, [assignment, volunteers]);

  const overlapping = useMemo(() => {
    if (!assignment) return new Set();
    const conflicting = new Set();
    for (const other of assignments) {
      if (other.id === assignment.id || other.date !== assignment.date || other.status === "cancelled") continue;
      // Dos servicios contiguos (11:00-13:00 y 13:00-15:00) son compatibles.
      if (!(assignment.startTime < other.endTime && assignment.endTime > other.startTime)) continue;
      for (const participant of (other.participants || [])) {
        if (participant.status !== "declined") conflicting.add(String(participant.volunteerId));
      }
      if (!other.participants && other.volunteerId && other.status !== "declined") {
        conflicting.add(String(other.volunteerId));
      }
    }
    return conflicting;
  }, [assignment, assignments]);

  const filtered = eligible.filter((person) =>
    `${person.name} ${person.email}`.toLocaleLowerCase("es-CL")
      .includes(search.trim().toLocaleLowerCase("es-CL"))
  );
  const statuses = new Map((assignment?.participants || [])
    .map((person) => [String(person.volunteerId), person.status]));
  const missingIds = selected.filter((id) => !eligible.some((person) => String(person.id) === id));
  const teamName = VOLUNTEER_TEAMS.find((team) => team.id === assignment?.teamId)?.name || "Equipo de servicio";

  function toggle(id) {
    setError("");
    setSelected((previous) => {
      if (previous.includes(id)) return previous.filter((item) => item !== id);
      if (previous.length >= required) {
        setError("Aumenta el número de cupos antes de incorporar otra persona.");
        return previous;
      }
      return [...previous, id];
    });
  }

  async function save(event) {
    event.preventDefault();
    if (!assignment || saving || !onSave) return;
    if (!Number.isInteger(required) || required < 1 || required > 20) {
      setError("Indica entre 1 y 20 personas necesarias."); return;
    }
    if (selected.length > required) {
      setError("Hay más participantes seleccionados que cupos disponibles."); return;
    }
    if (missingIds.length) {
      setError("Hay participantes que ya no están en el equipo o la sede. Retíralos antes de guardar."); return;
    }
    if (selected.some((id) => overlapping.has(id))) {
      setError("Una de las personas seleccionadas tiene otro servicio en ese mismo horario."); return;
    }
    const invalid = selected.find((id) => eligible.some((person) => String(person.id) === id && person.status !== "active"));
    if (invalid) {
      setError("Retira a los voluntarios inactivos antes de guardar."); return;
    }
    setSaving(true);
    setError("");
    try {
      // La API de participantes acepta SOLO cupos e identificadores.
      await onSave({ requiredVolunteers: required, volunteerIds: selected }, assignment);
    } catch (requestError) {
      setError(requestError?.message || "No se pudieron actualizar los voluntarios.");
    } finally { setSaving(false); }
  }

  if (!isOpen || !assignment) return null;

  return (
    <div className="volunteer-participants__overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose?.();
    }}>
      <section ref={dialogRef} className="volunteer-participants__modal"
        role="dialog" aria-modal="true" aria-labelledby="volunteer-participants-title" aria-busy={saving}>
        <header className="volunteer-participants__header">
          <div className="volunteer-participants__heading-icon"><UsersRound size={23} /></div>
          <div className="volunteer-participants__heading">
            <h2 id="volunteer-participants-title">Gestionar voluntarios</h2>
            <p>{assignment.title} · {teamName}</p>
          </div>
          <button type="button" ref={closeRef} disabled={saving} onClick={() => onClose?.()}
            aria-label="Cerrar gestión de voluntarios" className="volunteer-participants__close"><X size={21} /></button>
        </header>

        <form className="volunteer-participants__form" onSubmit={save}>
          <div className="volunteer-participants__body">
            <div className="volunteer-participants__service">
              <span>{assignment.date} · {assignment.startTime}–{assignment.endTime}</span>
              <span>{selected.length} de {required} cupos ocupados</span>
            </div>

            <div className="volunteer-participants__capacity">
              <div><label htmlFor="volunteer-required">Personas necesarias</label>
                <p>El servicio se guarda una sola vez, aunque participen varias personas.</p></div>
              <input id="volunteer-required" type="number" inputMode="numeric" min={1} max={20} step={1}
                value={required} disabled={saving || assignment.serviceStatus === "cancelled"}
                onChange={(event) => { setRequired(Number(event.target.value)); setError(""); }} />
            </div>

            <label className="volunteer-participants__search" htmlFor="volunteer-participants-search">
              <Search size={18}/>
              <input id="volunteer-participants-search" type="search" value={search}
                onChange={(event) => setSearch(event.target.value)} placeholder="Buscar voluntario por nombre o correo..." />
            </label>

            <div className="volunteer-participants__list" aria-label="Voluntarios disponibles para este turno">
              {filtered.map((person) => {
                const id = String(person.id);
                const checked = selected.includes(id);
                const conflicting = overlapping.has(id);
                const inactive = person.status !== "active";
                const currentStatus = statuses.get(id);
                const locked = !checked && (conflicting || inactive || assignment.serviceStatus === "cancelled");
                return (
                  <label key={id} className={`volunteer-participants__item${checked ? " volunteer-participants__item--checked" : ""}${locked ? " volunteer-participants__item--locked" : ""}`}>
                    <input type="checkbox" checked={checked} disabled={saving || locked || assignment.serviceStatus === "cancelled"}
                      onChange={() => toggle(id)} />
                    <span className="volunteer-participants__person"><strong>{person.name}</strong><small>{person.email}</small></span>
                    {checked && currentStatus && <span className={`volunteer-participants__state volunteer-participants__state--${currentStatus}`}>
                      {currentStatus === "confirmed" ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                      {RESPONSE_LABELS[currentStatus] || currentStatus}
                    </span>}
                    {conflicting && <span className="volunteer-participants__unavailable">Horario ocupado</span>}
                    {inactive && <span className="volunteer-participants__unavailable">Inactivo</span>}
                  </label>
                );
              })}
              {missingIds.map((id) => (
                <label key={id} className="volunteer-participants__item volunteer-participants__item--checked">
                  <input type="checkbox" checked={true} disabled={saving || assignment.serviceStatus === "cancelled"}
                    onChange={() => toggle(id)} />
                  <span className="volunteer-participants__person">
                    <strong>Participante anterior no disponible</strong>
                    <small>Retíralo de esta asignación para poder guardar los cambios.</small>
                  </span>
                  <span className="volunteer-participants__unavailable">Revisar</span>
                </label>
              ))}
              {!filtered.length && !missingIds.length && <div className="volunteer-participants__empty">
                <UsersRound size={22} />
                <strong>{eligible.length ? "No hay coincidencias" : "No hay voluntarios activos en este equipo y sede"}</strong>
                <p>{eligible.length ? "Prueba con otro nombre." : "Incorpora miembros al equipo desde Voluntarios registrados para poder asignarles turnos."}</p>
                {!eligible.length && onGoToRoster && <button type="button" onClick={onGoToRoster}>Ir a equipos de voluntarios</button>}
              </div>}
            </div>
            {!!missingIds.length && <p className="volunteer-participants__warning"><AlertCircle size={16}/> Hay participantes anteriores que ya no aparecen en el equipo o sede. Revisa esas asignaciones antes de guardar.</p>}
            {assignment.serviceStatus === "cancelled" && <p className="volunteer-participants__warning"><Info size={16}/> Este servicio está cancelado. Reactívalo desde «Editar servicio» antes de asignar personas.</p>}
            <p className="volunteer-participants__hint"><Info size={16}/> Cada miembro responde desde «Mis turnos». Sus confirmaciones actuales se conservarán si permanece asignado y no cambia la fecha, hora o equipo.</p>
            {error && <p className="volunteer-participants__error" role="alert"><AlertCircle size={16}/>{error}</p>}
          </div>

          <footer className="volunteer-participants__footer">
            <button type="button" className="volunteer-participants__cancel" disabled={saving} onClick={() => onClose?.()}>Cancelar</button>
            <button type="submit" className="volunteer-participants__save" disabled={saving || !onSave || assignment.serviceStatus === "cancelled"}>
              {saving ? <Clock3 size={17}/> : <Save size={17}/>}
              {saving ? "Guardando..." : "Guardar participantes"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default VolunteerParticipantsModal;
