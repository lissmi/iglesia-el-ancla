// Importamos useMemo desde React.
// Lo utilizaremos para calcular la distribución
// de los gastos por categoría.
import { useMemo } from "react";

// Importamos los componentes necesarios desde Recharts.
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Importamos los gastos actuales
// y los gastos históricos simulados.
import {
  expenses,
  monthlyExpenses,
} from "../../../data/admin/expensesData";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/admin/expenses/ExpenseCharts.css";


// Creamos el componente encargado
// de mostrar los gráficos financieros.
function ExpenseCharts() {

  // ---------------------------------------------------------
  // FORMATEADOR DE MONEDA
  // ---------------------------------------------------------

  // Creamos una función reutilizable para mostrar
  // montos utilizando formato de peso chileno.
  const formatCurrency = (value) => {

    // Utilizamos Intl.NumberFormat
    // para aplicar correctamente el formato nacional.
    return new Intl.NumberFormat("es-CL", {

      // Indicamos que el valor corresponde a moneda.
      style: "currency",

      // Utilizamos pesos chilenos.
      currency: "CLP",

      // No mostramos decimales.
      maximumFractionDigits: 0,

    }).format(value);
  };


  // ---------------------------------------------------------
  // DISTRIBUCIÓN DE GASTOS POR CATEGORÍA
  // ---------------------------------------------------------

  // Calculamos cuánto dinero se ha gastado
  // en cada categoría.
  const categoryData = useMemo(() => {

    // Creamos un objeto vacío para almacenar
    // los montos acumulados por categoría.
    const categories = {};

    // Recorremos todos los gastos.
    expenses.forEach((expense) => {

      // Para el gráfico utilizaremos solamente
      // gastos que ya fueron pagados.
      if (expense.status === "Pagado") {

        // Si la categoría todavía no existe,
        // la inicializamos con valor cero.
        if (!categories[expense.category]) {
          categories[expense.category] = 0;
        }

        // Sumamos el monto del gasto
        // dentro de su categoría correspondiente.
        categories[expense.category] += expense.amount;
      }
    });

    // Transformamos el objeto en un arreglo
    // compatible con Recharts.
    return Object.entries(categories).map(
      ([category, amount]) => ({

        // Guardamos el nombre de la categoría.
        name: category,

        // Guardamos el monto acumulado.
        value: amount,
      })
    );

  }, []);


  // ---------------------------------------------------------
  // COLORES DEL GRÁFICO CIRCULAR
  // ---------------------------------------------------------

  // Definimos una paleta basada en tonos
  // similares a la identidad visual de El Ancla.
  const chartColors = [
    "#1e3448",
    "#b98a54",
    "#667f93",
    "#d4b48b",
    "#8797a4",
    "#9c7652",
    "#c6a77d",
  ];


  // ---------------------------------------------------------
  // TOOLTIP DEL GRÁFICO DE BARRAS
  // ---------------------------------------------------------

  // Creamos un tooltip personalizado para mostrar
  // correctamente el valor monetario.
  const CustomBarTooltip = ({ active, payload, label }) => {

    // Comprobamos que el tooltip esté activo
    // y que exista información disponible.
    if (active && payload && payload.length) {

      // Retornamos el contenido del tooltip.
      return (
        <div className="expense-chart-tooltip">

          {/* Mostramos el mes seleccionado. */}
          <span className="expense-chart-tooltip__label">
            {label}
          </span>

          {/* Mostramos el monto correspondiente. */}
          <strong className="expense-chart-tooltip__value">
            {formatCurrency(payload[0].value)}
          </strong>

        </div>
      );
    }

    // Si no hay información activa,
    // no mostramos nada.
    return null;
  };


  // ---------------------------------------------------------
  // TOOLTIP DEL GRÁFICO CIRCULAR
  // ---------------------------------------------------------

  // Creamos otro tooltip personalizado
  // para el gráfico por categorías.
  const CustomPieTooltip = ({ active, payload }) => {

    // Verificamos que exista información.
    if (active && payload && payload.length) {

      // Obtenemos el elemento seleccionado.
      const item = payload[0];

      // Retornamos el contenido.
      return (
        <div className="expense-chart-tooltip">

          {/* Nombre de la categoría. */}
          <span className="expense-chart-tooltip__label">
            {item.name}
          </span>

          {/* Monto acumulado. */}
          <strong className="expense-chart-tooltip__value">
            {formatCurrency(item.value)}
          </strong>

        </div>
      );
    }

    // Si no existe información,
    // no mostramos el tooltip.
    return null;
  };


  // ---------------------------------------------------------
  // INTERFAZ
  // ---------------------------------------------------------

  // Retornamos la sección que contiene ambos gráficos.
  return (
    <section className="expense-charts">

      {/* ================================================== */}
      {/* GRÁFICO DE GASTOS HISTÓRICOS */}
      {/* ================================================== */}

      <article className="expense-chart-card expense-chart-card--history">

        {/* Encabezado de la tarjeta. */}
        <div className="expense-chart-card__header">

          {/* Agrupamos el título y la descripción. */}
          <div>

            {/* Título del gráfico. */}
            <h2 className="expense-chart-card__title">
              Evolución de gastos
            </h2>

            {/* Explicación breve. */}
            <p className="expense-chart-card__description">
              Comparación de los gastos registrados durante
              los últimos 12 meses.
            </p>

          </div>

          {/* Etiqueta informativa. */}
          <span className="expense-chart-card__badge">
            Últimos 12 meses
          </span>

        </div>


        {/* Contenedor del gráfico. */}
        <div className="expense-chart-card__content">

          {/* ResponsiveContainer permite que el gráfico
              se adapte automáticamente al ancho disponible. */}
          <ResponsiveContainer width="100%" height={320}>

            {/* Creamos el gráfico de barras. */}
            <BarChart

              // Asignamos los datos históricos.
              data={monthlyExpenses}

              // Definimos espacios internos del gráfico.
              margin={{
                top: 20,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >

              {/* Dibujamos líneas horizontales suaves
                  para facilitar la lectura. */}
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#e5e8eb"
              />

              {/* Eje horizontal con los meses. */}
              <XAxis

                // Indicamos qué propiedad contiene el mes.
                dataKey="month"

                // Eliminamos la línea exterior.
                axisLine={false}

                // Eliminamos pequeñas marcas.
                tickLine={false}

                // Definimos el estilo del texto.
                tick={{
                  fill: "#74818b",
                  fontSize: 12,
                }}
              />

              {/* Eje vertical con los montos. */}
              <YAxis

                // Eliminamos la línea exterior.
                axisLine={false}

                // Eliminamos las marcas.
                tickLine={false}

                // Convertimos valores grandes
                // en números más compactos.
                tickFormatter={(value) =>
                  `$${Math.round(value / 1000)}k`
                }

                // Definimos el estilo.
                tick={{
                  fill: "#74818b",
                  fontSize: 12,
                }}

                // Dejamos espacio suficiente
                // para mostrar las etiquetas.
                width={55}
              />

              {/* Mostramos información al pasar el mouse. */}
              <Tooltip content={<CustomBarTooltip />} />

              {/* Dibujamos las barras. */}
              <Bar

                // Indicamos qué propiedad contiene el monto.
                dataKey="amount"

                // Utilizamos el azul principal.
                fill="#1e3448"

                // Suavizamos las esquinas superiores.
                radius={[6, 6, 0, 0]}

                // Limitamos el ancho máximo de las barras.
                maxBarSize={48}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </article>


      {/* ================================================== */}
      {/* GRÁFICO DE DISTRIBUCIÓN POR CATEGORÍA */}
      {/* ================================================== */}

      <article className="expense-chart-card expense-chart-card--categories">

        {/* Encabezado del gráfico. */}
        <div className="expense-chart-card__header">

          {/* Agrupamos título y descripción. */}
          <div>

            {/* Título del gráfico. */}
            <h2 className="expense-chart-card__title">
              Gastos por categoría
            </h2>

            {/* Descripción breve. */}
            <p className="expense-chart-card__description">
              Distribución de los gastos pagados según
              su categoría.
            </p>

          </div>

        </div>


        {/* Contenedor del gráfico circular. */}
        <div className="expense-chart-card__content">

          {/* ResponsiveContainer permitirá
              adaptar el gráfico al tamaño disponible. */}
          <ResponsiveContainer width="100%" height={320}>

            {/* Creamos el gráfico circular. */}
            <PieChart>

              {/* Creamos el donut. */}
              <Pie

                // Asignamos los datos agrupados por categoría.
                data={categoryData}

                // Indicamos qué propiedad corresponde al monto.
                dataKey="value"

                // Indicamos qué propiedad corresponde al nombre.
                nameKey="name"

                // Definimos el radio externo.
                outerRadius={100}

                // Definimos el radio interno.
                // Esto transforma el gráfico en donut.
                innerRadius={62}

                // Dejamos espacio entre las categorías.
                paddingAngle={3}
              >

                {/* Recorremos cada categoría
                    para asignarle un color. */}
                {categoryData.map((entry, index) => (

                  // Creamos una sección del gráfico.
                  <Cell

                    // Creamos una clave única.
                    key={`expense-category-${entry.name}`}

                    // Asignamos un color según su posición.
                    fill={
                      chartColors[
                        index % chartColors.length
                      ]
                    }
                  />

                ))}

              </Pie>

              {/* Mostramos información al pasar el mouse. */}
              <Tooltip content={<CustomPieTooltip />} />

              {/* Mostramos la leyenda de categorías. */}
              <Legend

                // Colocamos la leyenda debajo del gráfico.
                verticalAlign="bottom"

                // Centramos horizontalmente.
                align="center"

                // Definimos iconos circulares.
                iconType="circle"

                // Reducimos ligeramente el tamaño.
                iconSize={9}
              />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </article>

    </section>
  );
}


// Exportamos el componente para utilizarlo
// dentro de ExpenseManagement.
export default ExpenseCharts;