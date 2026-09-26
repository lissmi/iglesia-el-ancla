//frontend/src/pages/super-admin/AdminDashboard.jsx

// Importamos Link para navegar hacia
// las páginas administrativas disponibles.
import { Link } from "react-router-dom";

// Importamos useMemo para memorizar
// los cálculos realizados con los gastos.
import { useMemo } from "react";

// Importamos los iconos utilizados en el dashboard.
import {
  CalendarDays,
  HandHeart,
  Users,
  WalletCards,
  ReceiptText,
  BadgeDollarSign,
  BookPlus,
  Megaphone,
  ArrowRight,
  Clock3,
  MapPin,
  CircleDollarSign,
} from "lucide-react";

// Importamos los gastos temporales
// que actualmente simulan la información de MongoDB.
import {
  expenses,
} from "../../data/admin/expensesData";

// Importamos los estilos exclusivos de la página.
import "../../styles/pages/super-admin/AdminDashboard.css";


// Creamos el componente principal
// de la página de inicio administrativa.
function AdminDashboard() {

  // ---------------------------------------------------------
  // DATOS TEMPORALES DE EVENTOS
  // ---------------------------------------------------------

  // Estos eventos serán reemplazados posteriormente
  // por información obtenida desde MongoDB.
  const upcomingEvents = [
    {
      // Identificador temporal del evento.
      id: 1,

      // Nombre de la actividad.
      title: "Culto general",

      // Día en el que se realizará.
      date: "Domingo",

      // Hora de inicio.
      time: "11:00 hrs",

      // Modalidad o ubicación.
      location: "Presencial y online",
    },
    {
      id: 2,
      title: "Descubriendo la Biblia",
      date: "Martes",
      time: "20:00 hrs",
      location: "Online",
    },
    {
      id: 3,
      title: "Reunión de oración",
      date: "Miércoles",
      time: "21:00 hrs",
      location: "Online",
    },
    {
      id: 4,
      title: "Estudio bíblico",
      date: "Jueves",
      time: "20:00 hrs",
      location: "Online",
    },
  ];


  // ---------------------------------------------------------
  // PETICIONES DE ORACIÓN TEMPORALES
  // ---------------------------------------------------------

  // Estas peticiones también llegarán posteriormente
  // desde la API del backend.
  const recentPrayerRequests = [
    {
      // Identificador temporal.
      id: 1,

      // Nombre mostrado al administrador.
      requester: "Solicitud anónima",

      // Texto resumido de la petición.
      summary:
        "Oración por una situación familiar y dirección para tomar decisiones.",

      // Estado actual de la solicitud.
      status: "Pendiente",

      // Tiempo transcurrido desde su recepción.
      receivedAt: "Hace 2 horas",
    },
    {
      id: 2,
      requester: "María",
      summary:
        "Oración por la recuperación de un familiar que se encuentra enfermo.",

      status: "En oración",
      receivedAt: "Hace 5 horas",
    },
    {
      id: 3,
      requester: "Solicitud privada",
      summary:
        "Esta petición contiene información privada para el equipo de liderazgo.",

      status: "Pendiente",
      receivedAt: "Ayer",
    },
  ];


  // ---------------------------------------------------------
  // FORMATEADOR DE MONEDA
  // ---------------------------------------------------------

  // Creamos una función reutilizable para mostrar
  // valores utilizando pesos chilenos.
  const formatCurrency = (value) => {

    // Utilizamos Intl.NumberFormat para aplicar
    // correctamente el formato monetario nacional.
    return new Intl.NumberFormat("es-CL", {

      // Indicamos que queremos mostrar una moneda.
      style: "currency",

      // Definimos el peso chileno.
      currency: "CLP",

      // Evitamos mostrar decimales.
      maximumFractionDigits: 0,

    }).format(value);
  };


  // ---------------------------------------------------------
  // RESUMEN DE GASTOS
  // ---------------------------------------------------------

  // Calculamos los valores financieros utilizando
  // los gastos temporales que ya existen en el proyecto.
  const financialSummary = useMemo(() => {

    // Sumamos todos los gastos que fueron pagados.
    const paidTotal = expenses

      // Dejamos solamente los movimientos pagados.
      .filter(
        (expense) =>
          expense.status === "Pagado"
      )

      // Sumamos sus montos.
      .reduce(
        (total, expense) =>
          total + expense.amount,
        0
      );


    // Sumamos todos los gastos pendientes.
    const pendingTotal = expenses

      // Dejamos solamente los movimientos pendientes.
      .filter(
        (expense) =>
          expense.status === "Pendiente"
      )

      // Sumamos sus montos.
      .reduce(
        (total, expense) =>
          total + expense.amount,
        0
      );


    // Contamos cuántos gastos siguen pendientes.
    const pendingCount = expenses.filter(
      (expense) =>
        expense.status === "Pendiente"
    ).length;


    // Retornamos todos los resultados calculados.
    return {
      paidTotal,
      pendingTotal,
      pendingCount,
    };

  }, []);


  // ---------------------------------------------------------
  // TARJETAS DE INDICADORES
  // ---------------------------------------------------------

  // Creamos la información que aparecerá
  // en las tarjetas superiores del dashboard.
  const summaryCards = [
    {
      // Nombre del indicador.
      label: "Próximas actividades",

      // Valor principal.
      value: upcomingEvents.length,

      // Información complementaria.
      detail: "Actividades semanales",

      // Icono correspondiente.
      icon: CalendarDays,

      // Clase utilizada para personalizar su color.
      color: "blue",
    },
    {
      label: "Peticiones pendientes",
      value: 2,
      detail: "Requieren revisión",
      icon: HandHeart,
      color: "gold",
    },
    {
      label: "Miembros registrados",
      value: 48,
      detail: "Información temporal",
      icon: Users,
      color: "green",
    },
    {
      label: "Gastos pendientes",
      value: financialSummary.pendingCount,
      detail: formatCurrency(
        financialSummary.pendingTotal
      ),
      icon: WalletCards,
      color: "red",
    },
  ];


  // ---------------------------------------------------------
  // ACCIONES RÁPIDAS
  // ---------------------------------------------------------

  // Creamos las principales acciones que podrá
  // realizar el administrador desde el inicio.
  const quickActions = [
    {
      // Nombre visible de la acción.
      label: "Crear evento",

      // Descripción breve.
      description:
        "Publicar una nueva actividad para la comunidad.",

      // Icono de la acción.
      icon: CalendarDays,

      // Ruta futura de la acción.
      path: "/admin/eventos/nuevo",

      // Indicamos que todavía no está disponible.
      available: false,
    },
    {
      label: "Publicar aviso",
      description:
        "Enviar información importante a la comunidad.",

      icon: Megaphone,
      path: "/admin/avisos/nuevo",
      available: false,
    },
    {
      label: "Registrar ingreso",
      description:
        "Agregar un nuevo movimiento de entrada.",

      icon: BadgeDollarSign,
      path: "/admin/finanzas/ingresos",
      available: false,
    },
    {
      label: "Registrar gasto",
      description:
        "Ir al módulo de gastos de la iglesia.",

      icon: ReceiptText,
      path: "/admin/finanzas/gastos",
      available: true,
    },
    {
      label: "Agregar recurso",
      description:
        "Publicar un nuevo material para la comunidad.",

      icon: BookPlus,
      path: "/admin/recursos/nuevo",
      available: false,
    },
  ];


  // ---------------------------------------------------------
  // INTERFAZ
  // ---------------------------------------------------------

  // Retornamos la página completa.
  return (
    <main className="admin-dashboard">

      {/* ================================================= */}
      {/* ENCABEZADO DE BIENVENIDA */}
      {/* ================================================= */}

      <section className="admin-dashboard__welcome">

        {/* Agrupamos el título y la descripción. */}
        <div className="admin-dashboard__welcome-content">

          {/* Texto pequeño superior. */}
          <span className="admin-dashboard__eyebrow">
            Administración general
          </span>

          {/* Título principal del dashboard. */}
          <h1 className="admin-dashboard__title">
            Bienvenido al panel administrativo
          </h1>

          {/* Explicamos brevemente el propósito de la página. */}
          <p className="admin-dashboard__description">
            Revisa la actividad de la iglesia y accede
            rápidamente a sus principales herramientas
            de gestión.
          </p>

        </div>


        {/* Permitimos visitar la parte pública de la PWA. */}
        <a
          className="admin-dashboard__public-button"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Mostramos el texto del enlace. */}
          Ver sitio público

          {/* Mostramos una flecha complementaria. */}
          <ArrowRight
            size={18}
            strokeWidth={2}
            aria-hidden="true"
          />
        </a>

      </section>


      {/* ================================================= */}
      {/* TARJETAS DE INDICADORES */}
      {/* ================================================= */}

      <section
        className="admin-dashboard__summary"
        aria-label="Resumen administrativo"
      >

        {/* Recorremos las tarjetas de resumen. */}
        {summaryCards.map((card) => {

          // Guardamos el componente del icono.
          const Icon = card.icon;


          // Retornamos una tarjeta por indicador.
          return (
            <article
              className="admin-dashboard-summary-card"
              key={card.label}
            >

              {/* Mostramos el icono de la tarjeta. */}
              <div
                className={`
                  admin-dashboard-summary-card__icon
                  admin-dashboard-summary-card__icon--${card.color}
                `}
              >
                <Icon
                  size={23}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>


              {/* Mostramos la información principal. */}
              <div className="admin-dashboard-summary-card__content">

                {/* Nombre del indicador. */}
                <span className="admin-dashboard-summary-card__label">
                  {card.label}
                </span>

                {/* Valor principal del indicador. */}
                <strong className="admin-dashboard-summary-card__value">
                  {card.value}
                </strong>

                {/* Información complementaria. */}
                <span className="admin-dashboard-summary-card__detail">
                  {card.detail}
                </span>

              </div>

            </article>
          );

        })}

      </section>


      {/* ================================================= */}
      {/* ACCIONES RÁPIDAS */}
      {/* ================================================= */}

      <section className="admin-dashboard-section">

        {/* Creamos el encabezado de la sección. */}
        <div className="admin-dashboard-section__header">

          {/* Agrupamos título y descripción. */}
          <div>

            {/* Título de la sección. */}
            <h2>
              Acciones rápidas
            </h2>

            {/* Descripción de la sección. */}
            <p>
              Accede directamente a las tareas administrativas
              más utilizadas.
            </p>

          </div>

        </div>


        {/* Creamos la cuadrícula de acciones. */}
        <div className="admin-dashboard__quick-actions">

          {/* Recorremos todas las acciones. */}
          {quickActions.map((action) => {

            // Guardamos el componente del icono.
            const Icon = action.icon;


            // Si el módulo está disponible,
            // mostramos un enlace de navegación.
            if (action.available) {
              return (
                <Link
                  className="admin-quick-action"
                  to={action.path}
                  key={action.label}
                >

                  {/* Mostramos el icono. */}
                  <div className="admin-quick-action__icon">
                    <Icon
                      size={22}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>


                  {/* Agrupamos los textos. */}
                  <div className="admin-quick-action__content">

                    {/* Nombre de la acción. */}
                    <strong>
                      {action.label}
                    </strong>

                    {/* Descripción de la acción. */}
                    <span>
                      {action.description}
                    </span>

                  </div>


                  {/* Mostramos una flecha. */}
                  <ArrowRight
                    className="admin-quick-action__arrow"
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                </Link>
              );
            }


            // Si el módulo todavía no existe,
            // mostramos una acción deshabilitada.
            return (
              <button
                className="
                  admin-quick-action
                  admin-quick-action--disabled
                "
                type="button"
                disabled
                key={action.label}
              >

                {/* Mostramos el icono. */}
                <div className="admin-quick-action__icon">
                  <Icon
                    size={22}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>


                {/* Agrupamos los textos. */}
                <div className="admin-quick-action__content">

                  {/* Nombre de la acción. */}
                  <strong>
                    {action.label}
                  </strong>

                  {/* Informamos que todavía se encuentra pendiente. */}
                  <span>
                    Disponible próximamente
                  </span>

                </div>

              </button>
            );

          })}

        </div>

      </section>


      {/* ================================================= */}
      {/* CONTENIDO PRINCIPAL EN DOS COLUMNAS */}
      {/* ================================================= */}

      <div className="admin-dashboard__columns">

        {/* ================================================= */}
        {/* PRÓXIMAS ACTIVIDADES */}
        {/* ================================================= */}

        <section className="admin-dashboard-section">

          {/* Encabezado de la sección. */}
          <div className="admin-dashboard-section__header">

            {/* Agrupamos los textos. */}
            <div>

              {/* Título de la sección. */}
              <h2>
                Próximas actividades
              </h2>

              {/* Descripción complementaria. */}
              <p>
                Reuniones programadas para la comunidad.
              </p>

            </div>


            {/* Botón pendiente hasta crear
                la gestión administrativa de eventos. */}
            <button
              className="admin-dashboard-section__link"
              type="button"
              disabled
            >
              Ver todas
            </button>

          </div>


          {/* Creamos la lista de eventos. */}
          <div className="admin-dashboard-events">

            {/* Recorremos los eventos temporales. */}
            {upcomingEvents.map((event) => (

              // Creamos una fila por evento.
              <article
                className="admin-dashboard-event"
                key={event.id}
              >

                {/* Mostramos un icono de calendario. */}
                <div className="admin-dashboard-event__icon">
                  <CalendarDays
                    size={21}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>


                {/* Mostramos la información del evento. */}
                <div className="admin-dashboard-event__content">

                  {/* Nombre de la actividad. */}
                  <h3>
                    {event.title}
                  </h3>


                  {/* Agrupamos fecha y hora. */}
                  <div className="admin-dashboard-event__details">

                    {/* Mostramos el día y la hora. */}
                    <span>
                      <Clock3
                        size={14}
                        aria-hidden="true"
                      />

                      {event.date}, {event.time}
                    </span>


                    {/* Mostramos la modalidad. */}
                    <span>
                      <MapPin
                        size={14}
                        aria-hidden="true"
                      />

                      {event.location}
                    </span>

                  </div>

                </div>

              </article>

            ))}

          </div>

        </section>


        {/* ================================================= */}
        {/* PETICIONES DE ORACIÓN */}
        {/* ================================================= */}

        <section className="admin-dashboard-section">

          {/* Encabezado de la sección. */}
          <div className="admin-dashboard-section__header">

            {/* Agrupamos título y descripción. */}
            <div>

              {/* Título principal. */}
              <h2>
                Peticiones recientes
              </h2>

              {/* Texto complementario. */}
              <p>
                Solicitudes recibidas desde la comunidad.
              </p>

            </div>


            {/* Esta acción se habilitará
                cuando construyamos el módulo correspondiente. */}
            <button
              className="admin-dashboard-section__link"
              type="button"
              disabled
            >
              Ver todas
            </button>

          </div>


          {/* Creamos la lista de peticiones. */}
          <div className="admin-dashboard-prayers">

            {/* Recorremos las peticiones temporales. */}
            {recentPrayerRequests.map((request) => (

              // Creamos una tarjeta por petición.
              <article
                className="admin-dashboard-prayer"
                key={request.id}
              >

                {/* Creamos el encabezado de la petición. */}
                <div className="admin-dashboard-prayer__header">

                  {/* Mostramos quién envió la solicitud. */}
                  <strong>
                    {request.requester}
                  </strong>

                  {/* Mostramos el estado actual. */}
                  <span
                    className={`
                      admin-dashboard-prayer__status
                      ${
                        request.status === "Pendiente"
                          ? "admin-dashboard-prayer__status--pending"
                          : "admin-dashboard-prayer__status--active"
                      }
                    `}
                  >
                    {request.status}
                  </span>

                </div>


                {/* Mostramos el resumen de la solicitud. */}
                <p>
                  {request.summary}
                </p>


                {/* Mostramos cuándo fue recibida. */}
                <span className="admin-dashboard-prayer__time">
                  {request.receivedAt}
                </span>

              </article>

            ))}

          </div>

        </section>

      </div>


      {/* ================================================= */}
      {/* RESUMEN FINANCIERO */}
      {/* ================================================= */}

      <section className="admin-dashboard-section">

        {/* Encabezado del resumen financiero. */}
        <div className="admin-dashboard-section__header">

          {/* Agrupamos título y descripción. */}
          <div>

            {/* Título principal. */}
            <h2>
              Resumen financiero
            </h2>

            {/* Explicamos el origen temporal de la información. */}
            <p>
              Vista general de los gastos registrados.
            </p>

          </div>


          {/* Permitimos ingresar al módulo existente. */}
          <Link
            className="admin-dashboard-section__link"
            to="/admin/finanzas/gastos"
          >
            Ver gastos

            <ArrowRight
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>

        </div>


        {/* Mostramos los indicadores financieros. */}
        <div className="admin-dashboard-financial">

          {/* Tarjeta de gastos pagados. */}
          <article className="admin-dashboard-financial__item">

            {/* Mostramos el icono. */}
            <div className="admin-dashboard-financial__icon">
              <CircleDollarSign
                size={23}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>


            {/* Mostramos la información. */}
            <div>
              <span>
                Gastos pagados
              </span>

              <strong>
                {formatCurrency(
                  financialSummary.paidTotal
                )}
              </strong>
            </div>

          </article>


          {/* Tarjeta de gastos pendientes. */}
          <article className="admin-dashboard-financial__item">

            {/* Mostramos el icono. */}
            <div className="admin-dashboard-financial__icon">
              <WalletCards
                size={23}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>


            {/* Mostramos la información. */}
            <div>
              <span>
                Total comprometido
              </span>

              <strong>
                {formatCurrency(
                  financialSummary.pendingTotal
                )}
              </strong>
            </div>

          </article>


          {/* Tarjeta con cantidad de movimientos. */}
          <article className="admin-dashboard-financial__item">

            {/* Mostramos el icono. */}
            <div className="admin-dashboard-financial__icon">
              <ReceiptText
                size={23}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>


            {/* Mostramos la información. */}
            <div>
              <span>
                Movimientos registrados
              </span>

              <strong>
                {expenses.length}
              </strong>
            </div>

          </article>

        </div>

      </section>

    </main>
  );
}


// Exportamos la página para utilizarla en App.js.
export default AdminDashboard;