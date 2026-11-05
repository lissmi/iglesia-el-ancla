// =========================================================
// GESTIÓN DE VOLUNTARIOS - DATOS REALES
// =========================================================
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, RefreshCw, UserRoundPlus, Trash2, X } from "lucide-react";
import api from "../../services/api";

// Conservamos los componentes visuales del módulo actual.
import VolunteersHeader from "../../components/administration/volunteers/VolunteersHeader";
import VolunteersSummary from "../../components/administration/volunteers/VolunteersSummary";
import VolunteersTeams, { VOLUNTEER_TEAMS } from "../../components/administration/volunteers/VolunteersTeams";
import VolunteersToolbar from "../../components/administration/volunteers/VolunteersToolbar";
import VolunteersSchedule from "../../components/administration/volunteers/VolunteersSchedule";
import VolunteersAssignments from "../../components/administration/volunteers/VolunteersAssignments";
import VolunteerAssignmentFormModal from "../../components/administration/volunteers/VolunteerAssignmentFormModal";
import VolunteerParticipantsModal from "../../components/administration/volunteers/VolunteerParticipantsModal";
import VolunteerDetailsModal from "../../components/administration/volunteers/VolunteerDetailsModal";
import VolunteerDeleteModal from "../../components/administration/volunteers/VolunteerDeleteModal";

import "../../styles/pages/administration/VolunteersManagement.css";
import "../../styles/pages/administration/VolunteersManagementConnected.css";

// Fecha YYYY-MM-DD con hora civil de Chile, también en Vercel.
function todayInChile() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function parseLocalDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const result = new Date(y, m - 1, d, 12);
  return result.getFullYear() === y && result.getMonth() === m - 1 && result.getDate() === d ? result : null;
}

function effectiveStatus(item) {
  return item.status === "cancelled" ? "cancelled" : !(item.participants || []).length ? "unassigned" : item.status;
}

function errorMessage(error) {
  return error?.response?.data?.message || error?.message || "No se pudo completar la operación";
}

function VolunteersManagement() {
  // Ahora todas las listas provienen de MongoDB y no de ejemplos locales.
  const [volunteers, setVolunteers] = useState([]);
  const [eligibleMembers, setEligibleMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Controles existentes de búsqueda, calendario y modales.
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_asc");
  const [showCalendar, setShowCalendar] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Nuevo bloque: incorporación real de miembros a los equipos.
  const [memberId, setMemberId] = useState("");
  const [editingVolunteerId, setEditingVolunteerId] = useState("");
  const [volunteerTeams, setVolunteerTeams] = useState([]);
  const [volunteerStatus, setVolunteerStatus] = useState("active");
  const [savingVolunteer, setSavingVolunteer] = useState(false);
  const [removingVolunteer, setRemovingVolunteer] = useState(null);

  // =========================================================
  // CONSULTAS AL BACKEND (SIN DATOS DEMOSTRATIVOS)
  // =========================================================
  const reload = useCallback(() => setRefreshKey((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");

    async function load() {
      try {
        // Las cuatro fuentes pertenecen al mismo módulo protegido.
        const [rosterRes, assignmentsRes, activitiesRes] = await Promise.all([
          api.get("/volunteers/roster", { signal: controller.signal }),
          api.get("/volunteers/assignments", { signal: controller.signal }),
          api.get("/volunteers/activities", { signal: controller.signal }),
        ]);
        // Consultamos todas las páginas, sin asumir un máximo de 100 miembros.
        const members = [];
        let page = 1;
        let pages = 1;
        while (page <= pages) {
          const result = await api.get("/volunteers/eligible-members", {
            params: { page, limit: 100 }, signal: controller.signal,
          });
          if (!result.data?.success || !Array.isArray(result.data?.members) ||
              !Number.isInteger(result.data?.pagination?.totalPages)) {
            throw new Error("No se pudo cargar la lista de miembros disponibles");
          }
          members.push(...result.data.members);
          pages = result.data.pagination.totalPages;
          page += 1;
        }
        if (controller.signal.aborted) return;
        if (![rosterRes.data, assignmentsRes.data, activitiesRes.data].every((data) => data?.success)) {
          throw new Error("El servidor no devolvió los datos esperados");
        }
        setVolunteers(rosterRes.data.volunteers || []);
        setAssignments(assignmentsRes.data.assignments || []);
        setEligibleMembers(members);
        setActivities(activitiesRes.data.activities || []);
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") return;
        // Evitamos mostrar datos antiguos después de una falla.
        setVolunteers([]); setAssignments([]); setEligibleMembers([]); setActivities([]);
        setLoadError(errorMessage(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [refreshKey]);

  const todayKey = todayInChile();
  const getVolunteerName = useCallback((volunteerId) => {
    const volunteer = volunteers.find((item) => String(item.id) === String(volunteerId));
    return volunteer?.name || "";
  }, [volunteers]);

  // =========================================================
  // FILTRADO Y ORDENAMIENTO DEL LISTADO REAL
  // =========================================================
  const filteredAssignments = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase("es-CL");
    const today = parseLocalDate(todayKey);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const result = assignments.filter((item) => {
      if (selectedTeam !== "all" && item.teamId !== selectedTeam) return false;
      if (statusFilter !== "all") {
        // Un servicio puede tener respuestas diferentes entre sus voluntarios.
        if (["pending", "confirmed", "declined"].includes(statusFilter)) {
          if (!(item.participants || []).some((person) => person.status === statusFilter) || item.status === "cancelled") return false;
        } else if (effectiveStatus(item) !== statusFilter) return false;
      }
      if (search) {
        const searchable = [item.title, item.description, item.location,
          ...(item.participants || []).map((person) => getVolunteerName(person.volunteerId))]
          .filter(Boolean).join(" ").toLocaleLowerCase("es-CL");
        if (!searchable.includes(search)) return false;
      }
      if (dateFilter !== "all") {
        const date = parseLocalDate(item.date);
        if (!date) return false;
        if (dateFilter === "today" && item.date !== todayKey) return false;
        if (dateFilter === "week" && (date < weekStart || date > weekEnd)) return false;
        if (dateFilter === "month" && (date.getMonth() !== today.getMonth() || date.getFullYear() !== today.getFullYear())) return false;
        if (dateFilter === "upcoming" && item.date < todayKey) return false;
        if (dateFilter === "past" && item.date >= todayKey) return false;
      }
      return true;
    });

    const groupName = (item) => (item.participants || [])
      .map((person) => getVolunteerName(person.volunteerId)).sort((a, b) => a.localeCompare(b, "es")).join(", ");
    result.sort((a, b) => {
      if (sortBy === "volunteer_asc") return groupName(a).localeCompare(groupName(b), "es");
      if (sortBy === "volunteer_desc") return groupName(b).localeCompare(groupName(a), "es");
      if (sortBy === "team_asc") return a.teamId.localeCompare(b.teamId, "es");
      const left = `${a.date} ${a.startTime}`;
      const right = `${b.date} ${b.startTime}`;
      return sortBy === "date_desc" ? right.localeCompare(left) : left.localeCompare(right);
    });
    return result;
  }, [assignments, selectedTeam, statusFilter, searchTerm, dateFilter, sortBy, todayKey, getVolunteerName]);

  // =========================================================
  // EDICIÓN DE EQUIPOS: LAS PERSONAS YA EXISTEN EN USER
  // =========================================================
  function resetVolunteerForm() {
    setMemberId(""); setEditingVolunteerId(""); setVolunteerTeams([]); setVolunteerStatus("active");
    setActionError("");
  }

  function editVolunteer(volunteer) {
    setEditingVolunteerId(volunteer.id);
    setMemberId(volunteer.id);
    setVolunteerTeams([...volunteer.teams]);
    setVolunteerStatus(volunteer.status);
    setActionError(""); setSuccess("");
    document.getElementById("volunteers-roster-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function toggleTeam(teamId) {
    setVolunteerTeams((previous) => previous.includes(teamId)
      ? previous.filter((item) => item !== teamId) : [...previous, teamId]);
  }

  async function saveVolunteer(event) {
    event.preventDefault();
    if (!memberId || volunteerTeams.length === 0 || savingVolunteer) return;
    setSavingVolunteer(true); setActionError(""); setSuccess("");
    try {
      if (editingVolunteerId) {
        await api.patch(`/volunteers/roster/${editingVolunteerId}`, { teams: volunteerTeams, status: volunteerStatus });
        setSuccess("Equipos del voluntario actualizados");
      } else {
        await api.post("/volunteers/roster", { userId: memberId, teams: volunteerTeams, status: "active" });
        setSuccess("El miembro ya forma parte del voluntariado");
      }
      resetVolunteerForm();
      reload();
    } catch (error) { setActionError(errorMessage(error)); }
    finally { setSavingVolunteer(false); }
  }

  async function removeVolunteer() {
    if (!removingVolunteer) return;
    setSavingVolunteer(true); setActionError("");
    try {
      await api.delete(`/volunteers/roster/${removingVolunteer.id}`);
      setRemovingVolunteer(null); resetVolunteerForm();
      setSuccess("Voluntario retirado sin eliminar su cuenta");
      reload();
    } catch (error) { setActionError(errorMessage(error)); }
    finally { setSavingVolunteer(false); }
  }

  // Solo mostramos miembros que aún no pertenecen a un equipo.
  const availableMembers = eligibleMembers.filter((member) =>
    !volunteers.some((volunteer) => volunteer.id === member.id));

  // =========================================================
  // CRUD DE ASIGNACIONES CON RESPUESTA REAL DEL SERVIDOR
  // =========================================================
  function closeModal() { setActiveModal(null); setSelectedAssignment(null); }
  function openModal(name, assignment = null) { setSelectedAssignment(assignment); setActiveModal(name); setActionError(""); }

  // Cambia únicamente los datos del servicio, sin tocar la lista de personas.
  async function saveAssignment(payload, original) {
    try {
      if (original) {
        await api.patch(`/volunteers/assignments/${original.id}/service`, payload);
      } else {
        // Los servicios nuevos comienzan con cupo 1, sin participantes.
        // Luego se usa el botón "Gestionar voluntarios" para incorporarlos.
        await api.post("/volunteers/assignments", {
          ...payload,
          requiredVolunteers: 1,
          volunteerIds: [],
        });
      }
      closeModal();
      setSuccess(original
        ? "Servicio actualizado. Las personas asignadas se mantienen."
        : "Servicio creado. Ahora presiona «Gestionar voluntarios» para asignar personas.");
      reload();
    } catch (error) { throw new Error(errorMessage(error)); }
  }

  // Este endpoint solo admite cupos e IDs: protege el resto del servicio.
  async function saveParticipants(payload, original) {
    try {
      await api.patch(`/volunteers/assignments/${original.id}/participants`, payload);
      closeModal();
      setSuccess("Voluntarios y cupos actualizados correctamente.");
      reload();
    } catch (error) { throw new Error(errorMessage(error)); }
  }

  // Si no hay candidatos, dirigimos al formulario que incorpora miembros a equipos.
  function goToVolunteerRoster() {
    closeModal();
    requestAnimationFrame(() => {
      document.getElementById("volunteers-roster-form")?.scrollIntoView({
        behavior: "smooth", block: "center",
      });
    });
  }

  async function deleteAssignment(assignment) {
    try {
      await api.delete(`/volunteers/assignments/${assignment.id}`);
      closeModal(); setSuccess("Asignación eliminada"); reload();
    } catch (error) { throw new Error(errorMessage(error)); }
  }

  function clearFilters() { setSelectedTeam("all"); setSearchTerm(""); setStatusFilter("all"); setDateFilter("all"); setSortBy("date_asc"); }

  // =========================================================
  // INTERFAZ PRINCIPAL
  // =========================================================
  return (
    <main className="volunteers-management">
      <div className="volunteers-management__container">
        <VolunteersHeader
          onCreateAssignment={() => openModal("form")}
          onViewCalendar={() => setShowCalendar((previous) => !previous)}
        />

        {loadError && (
          <div className="volunteers-connected__alert" role="alert">
            <AlertCircle size={19} /> {loadError}
            <button type="button" onClick={reload}><RefreshCw size={15} /> Reintentar</button>
          </div>
        )}
        {success && <p className="volunteers-connected__success" role="status"><Check size={17} /> {success}</p>}
        {actionError && <p className="volunteers-connected__alert" role="alert"><AlertCircle size={17} /> {actionError}</p>}

        {loading ? (
          <div className="volunteers-connected__loading" role="status">Cargando equipos y asignaciones...</div>
        ) : !loadError ? (
          <>
            <VolunteersSummary volunteers={volunteers} assignments={assignments} />

            {/* Inscribir un miembro real o modificar sus equipos existentes. */}
            <section className="volunteers-connected__roster" aria-labelledby="volunteers-roster-title">
              <div className="volunteers-connected__roster-head">
                <div>
                  <span className="volunteers-connected__eyebrow">MIEMBROS QUE SIRVEN</span>
                  <h2 id="volunteers-roster-title">Voluntarios registrados</h2>
                  <p>Incorpora miembros de la iglesia a sus equipos de servicio, sin crear cuentas nuevas.</p>
                </div>
                <div className="volunteers-connected__roster-controls">
                  <button type="button" onClick={reload}><RefreshCw size={15} /> Actualizar</button>
                  <span className="volunteers-connected__count">{volunteers.length} voluntarios</span>
                </div>
              </div>

              <form id="volunteers-roster-form" className="volunteers-connected__form" onSubmit={saveVolunteer}>
                <div className="volunteers-connected__form-top">
                  <span className="volunteers-connected__form-icon"><UserRoundPlus size={20} /></span>
                  <div><strong>{editingVolunteerId ? "Editar equipos del voluntario" : "Incorporar miembro"}</strong>
                    <small>Selecciona una persona registrada y los equipos en que prestará servicio.</small></div>
                  {editingVolunteerId && <button type="button" className="volunteers-connected__cancel" onClick={resetVolunteerForm}><X size={15} /> Cancelar edición</button>}
                </div>

                <div className="volunteers-connected__form-grid">
                  <label>Miembro de la iglesia
                    <select value={memberId} disabled={Boolean(editingVolunteerId) || savingVolunteer}
                      onChange={(event) => setMemberId(event.target.value)} required>
                      <option value="">Seleccionar miembro</option>
                      {editingVolunteerId ? (
                        volunteers.filter((person) => person.id === editingVolunteerId).map((person) => (
                          <option key={person.id} value={person.id}>{person.name}</option>
                        ))
                      ) : availableMembers.map((person) => (
                        <option key={person.id} value={person.id}>{person.name} · {person.email}</option>
                      ))}
                    </select>
                  </label>
                  {editingVolunteerId && <label>Estado de voluntariado
                    <select value={volunteerStatus} onChange={(event) => setVolunteerStatus(event.target.value)}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </label>}
                </div>

                <fieldset className="volunteers-connected__teams-fieldset">
                  <legend>Equipos de servicio *</legend>
                  <div className="volunteers-connected__team-options">
                    {VOLUNTEER_TEAMS.map((team) => (
                      <label key={team.id} className={volunteerTeams.includes(team.id) ? "volunteers-connected__team-option volunteers-connected__team-option--selected" : "volunteers-connected__team-option"}>
                        <input type="checkbox" checked={volunteerTeams.includes(team.id)} onChange={() => toggleTeam(team.id)} />
                        <span>{team.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button type="submit" className="volunteers-connected__save" disabled={!memberId || volunteerTeams.length === 0 || savingVolunteer}>
                  <Check size={16} /> {savingVolunteer ? "Guardando..." : editingVolunteerId ? "Guardar equipos" : "Agregar voluntario"}
                </button>
              </form>

              {volunteers.length > 0 && <div className="volunteers-connected__roster-list">
                {volunteers.map((person) => (
                  <article key={person.id} className="volunteers-connected__person">
                    <div className="volunteers-connected__avatar" aria-hidden="true">{person.name.split(" ").slice(0, 2).map((name) => name[0]).join("").toUpperCase()}</div>
                    <div className="volunteers-connected__person-info"><strong>{person.name}</strong><small>{person.email}</small>
                      <span>{person.teams.map((id) => VOLUNTEER_TEAMS.find((team) => team.id === id)?.name).filter(Boolean).join(" · ")}</span>
                    </div>
                    <span className={person.status === "active" ? "volunteers-connected__badge" : "volunteers-connected__badge volunteers-connected__badge--inactive"}>{person.status === "active" ? "Activo" : "Inactivo"}</span>
                    <div className="volunteers-connected__person-actions">
                      <button type="button" onClick={() => editVolunteer(person)}>Editar equipos</button>
                      <button type="button" className="volunteers-connected__danger" onClick={() => { setRemovingVolunteer(person); setActionError(""); }} aria-label={`Retirar a ${person.name} del voluntariado`}><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>}
              {volunteers.length === 0 && <p className="volunteers-connected__empty">Todavía no hay voluntarios inscritos. Incorpora un miembro para comenzar.</p>}
            </section>

            <VolunteersTeams volunteers={volunteers} assignments={assignments} selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />
            <VolunteersToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm}
              statusFilter={statusFilter} onStatusChange={setStatusFilter}
              dateFilter={dateFilter} onDateChange={setDateFilter}
              sortBy={sortBy} onSortChange={setSortBy} onClearFilters={clearFilters} />
            {showCalendar && <div className="volunteers-management__calendar">
              <VolunteersSchedule assignments={assignments} volunteers={volunteers} selectedTeam={selectedTeam} onViewAssignment={(item) => openModal("details", item)} />
            </div>}
            <VolunteersAssignments assignments={filteredAssignments} volunteers={volunteers}
              onView={(item) => openModal("details", item)} onEdit={(item) => openModal("form", item)}
              onManage={(item) => openModal("participants", item)}
              onDelete={(item) => openModal("delete", item)} onCreate={() => openModal("form")} />

            <VolunteerAssignmentFormModal isOpen={activeModal === "form"} assignment={selectedAssignment}
              activities={activities} onClose={closeModal} onSave={saveAssignment} />
            <VolunteerParticipantsModal isOpen={activeModal === "participants"}
              assignment={selectedAssignment} volunteers={volunteers} assignments={assignments}
              onClose={closeModal} onSave={saveParticipants} onGoToRoster={goToVolunteerRoster} />
            <VolunteerDetailsModal isOpen={activeModal === "details"} assignment={selectedAssignment}
              volunteers={volunteers} activities={activities} onClose={closeModal}
              onEdit={(item) => openModal("form", item)}
              onManage={(item) => openModal("participants", item)} />
            <VolunteerDeleteModal isOpen={activeModal === "delete"} assignment={selectedAssignment}
              volunteers={volunteers} onClose={closeModal} onConfirm={deleteAssignment} />

            {/* Confirmación visual antes de retirar a una persona del voluntariado. */}
            {removingVolunteer && <div className="volunteers-connected__overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingVolunteer) setRemovingVolunteer(null); }}>
              <section className="volunteers-connected__confirm" role="alertdialog" aria-modal="true" aria-labelledby="volunteers-remove-title">
                <span className="volunteers-connected__confirm-icon"><AlertCircle size={25} /></span>
                <h2 id="volunteers-remove-title">¿Retirar del voluntariado?</h2>
                <p>Se retirará a <strong>{removingVolunteer.name}</strong> de sus equipos. Su cuenta de miembro no será eliminada.</p>
                <p>Si tiene turnos futuros asignados, primero deberás reasignarlos o cancelarlos.</p>
                {actionError && <p className="volunteers-connected__alert" role="alert">{actionError}</p>}
                <div className="volunteers-connected__confirm-actions">
                  <button type="button" onClick={() => setRemovingVolunteer(null)} disabled={savingVolunteer}>Cancelar</button>
                  <button type="button" className="volunteers-connected__confirm-danger" onClick={removeVolunteer} disabled={savingVolunteer}>{savingVolunteer ? "Retirando..." : "Retirar voluntario"}</button>
                </div>
              </section>
            </div>}
          </>
        ) : null}
      </div>
    </main>
  );
}

export default VolunteersManagement;
