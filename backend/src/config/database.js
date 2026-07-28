// Importamos mongoose para conectarnos con MongoDB.
import mongoose from "mongoose";

// Función que establece la conexión con la base de datos.
const connectDatabase = async () => {
    // Verificamos que exista la variable MONGODB_URI.
    if (!process.env.MONGODB_URI) {
        throw new Error(
            "La variable MONGODB_URI no está definida en el archivo .env"
        );
    }

    try {
        // Intentamos conectarnos a MongoDB.
        const connection = await mongoose.connect(
            process.env.MONGODB_URI
        );

        // Mostramos información básica de la conexión.
        console.log(
            `MongoDB conectado correctamente: ${connection.connection.host}`
        );
    } catch (error) {
        // Mostramos un mensaje claro si ocurre un error.
        console.error(
            "Error al conectar con MongoDB:",
            error.message
        );

        // Volvemos a lanzar el error para que server.js
        // pueda detener el inicio del servidor.
        throw error;
    }
};

// Exportamos la función.
export default connectDatabase;