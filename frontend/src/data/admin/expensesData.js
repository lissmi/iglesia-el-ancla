// Creamos un arreglo con gastos simulados.
// Estos datos nos permitirán desarrollar y probar
// el frontend antes de conectar MongoDB.
export const expenses = [
  {
    // Identificador temporal del gasto.
    id: 1,

    // Fecha en la que se realizó el gasto.
    date: "2026-08-05",

    // Descripción principal del gasto.
    description: "Arriendo mensual",

    // Categoría utilizada para clasificar el movimiento.
    category: "Arriendo",

    // Monto del gasto expresado en pesos chilenos.
    amount: 300000,

    // Estado actual del movimiento.
    status: "Pagado",

    // Medio utilizado para realizar el pago.
    paymentMethod: "Transferencia",

    // Información adicional del gasto.
    notes: "Arriendo correspondiente al mes de agosto",
  },

  {
    // Identificador temporal del gasto.
    id: 2,

    // Fecha del movimiento.
    date: "2026-08-08",

    // Descripción del gasto.
    description: "Cuenta de electricidad",

    // Categoría financiera.
    category: "Servicios básicos",

    // Monto del gasto.
    amount: 48200,

    // Estado del gasto.
    status: "Pagado",

    // Medio utilizado para realizar el pago.
    paymentMethod: "Transferencia",

    // Información complementaria.
    notes: "Cuenta mensual de electricidad",
  },

  {
    // Identificador temporal del gasto.
    id: 3,

    // Fecha del gasto.
    date: "2026-08-12",

    // Descripción del movimiento.
    description: "Ingredientes desayuno comunitario",

    // Categoría financiera.
    category: "Alimentación",

    // Monto del gasto.
    amount: 68500,

    // Estado actual.
    status: "Pagado",

    // Medio utilizado para pagar.
    paymentMethod: "Efectivo",

    // Información adicional.
    notes: "Compra de alimentos para desayuno comunitario",
  },

  {
    // Identificador temporal.
    id: 4,

    // Fecha del gasto.
    date: "2026-08-18",

    // Descripción del movimiento.
    description: "Materiales para actividad",

    // Categoría financiera.
    category: "Materiales",

    // Monto del gasto.
    amount: 45900,

    // Estado actual.
    status: "Pagado",

    // Medio de pago utilizado.
    paymentMethod: "Débito",

    // Información complementaria.
    notes: "Materiales utilizados en actividad especial",
  },

  {
    // Identificador temporal.
    id: 5,

    // Fecha programada para el gasto.
    date: "2026-08-28",

    // Descripción.
    description: "Servicio de internet",

    // Categoría.
    category: "Internet",

    // Monto.
    amount: 25990,

    // Indicamos que todavía no se ha pagado.
    status: "Pendiente",

    // Medio de pago esperado.
    paymentMethod: "Transferencia",

    // Información adicional.
    notes: "Pago mensual del servicio de internet",
  },

  {
  // Identificador temporal.
  id: 6,

  // Fecha programada para el gasto.
  date: "2026-08-30",

  // Descripción del gasto.
  description: "Compra de útiles de aseo",

  // Categoría financiera.
  category: "Aseo",

  // Monto estimado del gasto.
  amount: 45000,

  // Indicamos que todavía se encuentra pendiente.
  status: "Pendiente",

  // Medio de pago esperado.
  paymentMethod: "Transferencia",

  // Información adicional del movimiento.
  notes: "Compra mensual de productos y útiles de aseo para la iglesia",
},
];

// Creamos datos simulados correspondientes
// a los gastos históricos de los últimos 12 meses.
// Este arreglo será utilizado posteriormente por los gráficos.
export const monthlyExpenses = [
  // Gasto total de septiembre.
  { month: "Sep", amount: 420000 },

  // Gasto total de octubre.
  { month: "Oct", amount: 465000 },

  // Gasto total de noviembre.
  { month: "Nov", amount: 510000 },

  // Gasto total de diciembre.
  { month: "Dic", amount: 620000 },

  // Gasto total de enero.
  { month: "Ene", amount: 440000 },

  // Gasto total de febrero.
  { month: "Feb", amount: 470000 },

  // Gasto total de marzo.
  { month: "Mar", amount: 495000 },

  // Gasto total de abril.
  { month: "Abr", amount: 530000 },

  // Gasto total de mayo.
  { month: "May", amount: 515000 },

  // Gasto total de junio.
  { month: "Jun", amount: 560000 },

  // Gasto total de julio.
  { month: "Jul", amount: 580000 },

  // Gasto total de agosto.
  { month: "Ago", amount: 488590 },
];

// Creamos una lista con las categorías disponibles.
// Más adelante estas categorías podrían llegar
// directamente desde MongoDB.
export const expenseCategories = [
  "Arriendo",
  "Servicios básicos",
  "Internet",
  "Materiales",
  "Alimentación",
  "Actividades",
  "Aseo",
  "Mantención",
  "Equipamiento",
  "Otros",
];