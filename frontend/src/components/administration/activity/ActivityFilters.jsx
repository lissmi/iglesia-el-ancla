
import {
  CalendarDays,
  RotateCcw,
  Search,
} from "lucide-react";

import "../../../styles/components/administration/activity/ActivityFilters.css";

// =========================================================
// FILTROS DEL HISTORIAL
// =========================================================

function ActivityFilters({
  search,
  onSearchChange,
  selectedDate,
  onDateChange,
  onReset,
}) {
  return (
    <section
      className="activity-filters"
      aria-label="Filtros del historial"
    >
      <div className="activity-filters__search">
        <Search
          size={19}
          aria-hidden="true"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Buscar administrador, correo o modificación..."
          aria-label="Buscar en el historial"
        />
      </div>

      <div className="activity-filters__date">
        <CalendarDays
          size={18}
          aria-hidden="true"
        />

        <input
          type="date"
          value={selectedDate}
          onChange={(event) =>
            onDateChange(event.target.value)
          }
          aria-label="Filtrar por fecha"
        />
      </div>

      <button
        className="activity-filters__reset"
        type="button"
        onClick={onReset}
      >
        <RotateCcw
          size={16}
          aria-hidden="true"
        />

        Limpiar
      </button>
    </section>
  );
}

export default ActivityFilters;
