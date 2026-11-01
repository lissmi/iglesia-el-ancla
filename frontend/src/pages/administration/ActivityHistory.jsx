import { useMemo, useState } from "react";

import { History, Info, LockKeyhole, ShieldCheck } from "lucide-react";
// =========================================================
// COMPONENTES
// =========================================================

import ActivityFilters from "../../components/administration/activity/ActivityFilters";

import ActivityTable from "../../components/administration/activity/ActivityTable";

// =========================================================
// ESTILOS
// =========================================================

import "../../styles/pages/administration/ActivityHistory.css";

// =========================================================
// DATOS TEMPORALES DE DEMOSTRACIÓN
// =========================================================

// Estos registros son completamente ficticios.
// Se reemplazarán por datos obtenidos del backend.
//
// createdAt representa la fecha y hora exactas
// en que se completó una modificación.

const DEMO_ACTIVITIES = [
  {
    id: "demo-001",
    actorName: "María González",
    actorEmail: "maria@example.com",
    createdAt: "2026-10-08T18:45:00Z",
    description:
      "Actualizó la información de contacto de un miembro.",
  },
  {
    id: "demo-002",
    actorName: "Carlos Muñoz",
    actorEmail: "carlos@example.com",
    createdAt: "2026-10-08T15:20:00Z",
    description:
      "Modificó la fecha de una actividad comunitaria.",
  },
  {
    id: "demo-003",
    actorName: "María González",
    actorEmail: "maria@example.com",
    createdAt: "2026-10-07T21:10:00Z",
    description:
      "Registró un nuevo usuario con rol de miembro.",
  },
  {
    id: "demo-004",
    actorName: "Ana Torres",
    actorEmail: "ana@example.com",
    createdAt: "2026-10-07T14:30:00Z",
    description:
      "Actualizó la información de un recurso.",
  },
  {
    id: "demo-005",
    actorName: "Carlos Muñoz",
    actorEmail: "carlos@example.com",
    createdAt: "2026-10-06T19:15:00Z",
    description:
      "Desactivó una cuenta de usuario.",
  },
];

// =========================================================
// UTILIDAD PARA FILTRAR POR FECHA EN CHILE
// =========================================================

const DATE_FILTER_FORMATTER = new Intl.DateTimeFormat(
  "en-CA",
  {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }
);

function getChileDate(isoDate) {
  const parts = DATE_FILTER_FORMATTER.formatToParts(
    new Date(isoDate)
  );

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

// =========================================================
// PÁGINA PRINCIPAL
// =========================================================

function ActivityHistory() {

  // =========================================================
  // ESTADOS DE LOS FILTROS
  // =========================================================

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // =========================================================
  // FILTRADO DE REGISTROS
  // =========================================================

  const filteredActivities = useMemo(() => {
    const normalizedSearch =
      search.trim().toLocaleLowerCase("es-CL");

    return DEMO_ACTIVITIES
      .filter((activity) => {
        const searchableText = [
          activity.actorName,
          activity.actorEmail,
          activity.description,
        ]
          .join(" ")
          .toLocaleLowerCase("es-CL");

        const matchesSearch =
          !normalizedSearch ||
          searchableText.includes(normalizedSearch);

        const matchesDate =
          !selectedDate ||
          getChileDate(activity.createdAt) ===
            selectedDate;

        return matchesSearch && matchesDate;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [search, selectedDate]);

  // =========================================================
  // LIMPIAR FILTROS
  // =========================================================

  const handleResetFilters = () => {
    setSearch("");
    setSelectedDate("");
  };

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div className="activity-history-page">

      

      {/* ============================================= */}
      {/* ENCABEZADO */}
      {/* ============================================= */}

      <header className="activity-history-page__header">
        <div>
          <span className="activity-history-page__eyebrow">
            ADMINISTRACIÓN / AUDITORÍA
          </span>

          <h1>
            <History
              size={29}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            Historial de actividad
          </h1>

          <p>
            Consulta quién realizó modificaciones
            en el sistema, cuándo ocurrieron
            y qué información fue modificada.
          </p>
        </div>

        <div className="activity-history-page__badge">
          <ShieldCheck
            size={17}
            aria-hidden="true"
          />

          <span>Solo lectura</span>
        </div>
      </header>

      {/* ============================================= */}
      {/* AVISO DE DEMOSTRACIÓN */}
      {/* ============================================= */}

      <div
        className="activity-history-page__notice"
        role="note"
      >
        <Info
          size={20}
          aria-hidden="true"
        />

        <div>
          <strong>
            Registros de demostración
          </strong>

          <p>
            Los registros mostrados son ficticios
            y permiten visualizar el diseño.
            El historial real se cargará desde
            el backend cuando implementemos
            la auditoría de modificaciones.
          </p>
        </div>
      </div>

      {/* ============================================= */}
      {/* FILTROS */}
      {/* ============================================= */}

      <ActivityFilters
        search={search}
        onSearchChange={setSearch}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onReset={handleResetFilters}
      />

      {/* ============================================= */}
      {/* TABLA DE REGISTROS */}
      {/* ============================================= */}

      <ActivityTable
        activities={filteredActivities}
      />

      {/* ============================================= */}
      {/* INFORMACIÓN DE SEGURIDAD */}
      {/* ============================================= */}

      <footer className="activity-history-page__footer">
        <LockKeyhole
          size={18}
          aria-hidden="true"
        />

        <p>
          El historial es exclusivamente de consulta.
          Los registros reales deberán generarse
          y protegerse desde el servidor, sin
          permitir modificaciones desde este módulo.
        </p>
      </footer>

    </div>
  );
}

export default ActivityHistory;




