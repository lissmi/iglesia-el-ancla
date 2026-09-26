// Importamos mongoose para crear
// el esquema y el modelo de la sucursal.
import mongoose from "mongoose";


// Extraemos Schema desde mongoose
// para escribir el modelo de forma más clara.
const { Schema } = mongoose;


// Creamos un esquema reutilizable
// para almacenar la dirección de la sucursal.
const addressSchema = new Schema(
  {
    // Nombre de la calle.
    street: {
      type: String,
      required: [
        true,
        "La calle de la sucursal es obligatoria",
      ],
      trim: true,
      maxlength: [
        100,
        "La calle no puede superar los 100 caracteres",
      ],
    },

    // Número de la dirección.
    number: {
      type: String,
      required: [
        true,
        "El número de la dirección es obligatorio",
      ],
      trim: true,
      maxlength: [
        20,
        "El número no puede superar los 20 caracteres",
      ],
    },

    // Sector, barrio o localidad.
    sector: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "El sector no puede superar los 100 caracteres",
      ],
      default: "",
    },

    // Ciudad donde se encuentra la sucursal.
    city: {
      type: String,
      required: [
        true,
        "La ciudad es obligatoria",
      ],
      trim: true,
      maxlength: [
        100,
        "La ciudad no puede superar los 100 caracteres",
      ],
    },

    // Región donde se encuentra la sucursal.
    region: {
      type: String,
      required: [
        true,
        "La región es obligatoria",
      ],
      trim: true,
      maxlength: [
        100,
        "La región no puede superar los 100 caracteres",
      ],
    },

    // País donde se encuentra la sucursal.
    country: {
      type: String,
      required: true,
      trim: true,
      default: "Chile",
      maxlength: [
        100,
        "El país no puede superar los 100 caracteres",
      ],
    },
  },
  {
    // Evitamos crear un _id adicional
    // dentro del objeto de dirección.
    _id: false,
  }
);


// Creamos el esquema principal de las sucursales.
const sucursalSchema = new Schema(
  {
    // Código interno y estable de la sucursal.
    //
    // La primera sucursal utilizará SUC-001.
    code: {
      type: String,
      required: [
        true,
        "El código de la sucursal es obligatorio",
      ],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^SUC-\d{3,}$/,
        "El código debe utilizar el formato SUC-001",
      ],
    },

    // Nombre completo de la sucursal.
    name: {
      type: String,
      required: [
        true,
        "El nombre de la sucursal es obligatorio",
      ],
      trim: true,
      minlength: [
        3,
        "El nombre debe tener al menos 3 caracteres",
      ],
      maxlength: [
        150,
        "El nombre no puede superar los 150 caracteres",
      ],
    },

    // Nombre utilizado dentro de las URL.
    //
    // Ejemplo:
    // iglesia-el-ancla-valparaiso
    slug: {
      type: String,
      required: [
        true,
        "El slug de la sucursal es obligatorio",
      ],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "El slug contiene caracteres no permitidos",
      ],
    },

    // Dirección física de la sucursal.
    address: {
      type: addressSchema,
      required: [
        true,
        "La dirección de la sucursal es obligatoria",
      ],
    },

    // Correo electrónico público de contacto.
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [
        150,
        "El correo no puede superar los 150 caracteres",
      ],
      default: "",
    },

    // Teléfono público de contacto.
    contactPhone: {
      type: String,
      trim: true,
      maxlength: [
        30,
        "El teléfono no puede superar los 30 caracteres",
      ],
      default: "",
    },

    // Zona horaria utilizada por la sucursal.
    //
    // Esto permitirá que eventos, publicaciones
    // y notificaciones utilicen la hora correcta.
    timezone: {
      type: String,
      required: true,
      trim: true,
      default: "America/Santiago",
    },

    // Identifica si esta sucursal corresponde
    // a la sede principal de la organización.
    isHeadquarters: {
      type: Boolean,
      default: false,
    },

    // Determina si la sucursal
    // se encuentra actualmente operativa.
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    // Creamos automáticamente
    // los campos createdAt y updatedAt.
    timestamps: true,

    // Definimos explícitamente el nombre
    // de la colección dentro de MongoDB.
    collection: "sucursales",
  }
);


// Creamos un índice para facilitar
// la búsqueda de sucursales activas.
sucursalSchema.index({
  isActive: 1,
  name: 1,
});


// Creamos el modelo Sucursal
// utilizando el esquema anterior.
const Sucursal = mongoose.model(
  "Sucursal",
  sucursalSchema
);


// Exportamos el modelo para utilizarlo
// en controladores, servicios y scripts.
export default Sucursal;