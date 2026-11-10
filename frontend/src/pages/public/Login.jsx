//frontend/src/pages/public/Login.jsx

// Importamos useState para controlar
// los campos y estados del formulario.
import {
    useState,
} from "react";


// Importamos las herramientas
// necesarias de React Router.
import {
    useNavigate,
} from "react-router-dom";


// Importamos los iconos
// utilizados en la página.
import {
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole,
    Mail,
} from "lucide-react";


// Importamos la instancia de Axios
// configurada para comunicarse con el backend.
import api from "../../services/api";

// Enlace de recuperación dentro de la tarjeta de acceso.
import LoginRecoveryShortcut from "../../components/auth/LoginRecoveryShortcut";


// Importamos los estilos
// exclusivos del login público.
import "../../styles/pages/public/Login.css";


// Creamos la página pública
// de inicio de sesión.
function Login() {

    // Obtenemos la función utilizada
    // para navegar desde React.
    const navigate =
        useNavigate();


    // Guardamos el correo
    // ingresado por el usuario.
    const [
        email,
        setEmail,
    ] = useState("");


    // Guardamos la contraseña
    // ingresada por el usuario.
    const [
        password,
        setPassword,
    ] = useState("");


    // Controlamos si la contraseña
    // se muestra o permanece oculta.
    const [
        showPassword,
        setShowPassword,
    ] = useState(false);


    // Guardamos posibles
    // mensajes de error.
    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");


    // Guardamos si el formulario
    // se encuentra enviando información.
    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);


    // Creamos la función que procesa
    // el envío del formulario.
    const handleSubmit = async (
        event
    ) => {

        // Evitamos que el navegador
        // recargue completamente la página.
        event.preventDefault();


        // Eliminamos mensajes
        // de error anteriores.
        setErrorMessage("");


        // Normalizamos el correo
        // eliminando espacios externos.
        const normalizedEmail =
            email.trim();


        // Comprobamos que exista
        // un correo electrónico.
        if (!normalizedEmail) {
            setErrorMessage(
                "Debes ingresar el correo electrónico."
            );

            return;
        }


        // Comprobamos que exista
        // una contraseña.
        if (!password) {
            setErrorMessage(
                "Debes ingresar la contraseña."
            );

            return;
        }


        // Indicamos que comenzó
        // el envío del formulario.
        setIsSubmitting(true);


        try {
            // Enviamos las credenciales
            // al login general del backend.
            //
            // La ruta completa será:
            // http://localhost:5000/api/auth/login
            const response =
                await api.post(
                    "/auth/login",
                    {
                        // Enviamos el correo normalizado.
                        email:
                            normalizedEmail,

                        // Enviamos la contraseña
                        // exactamente como fue escrita.
                        password,
                    }
                );


            // Comprobamos que el backend
            // haya confirmado el acceso.
            if (
                response.data?.success
            ) {
                // Obtenemos la ruta sugerida
                // por el backend según el rol.
                const backendDestination =
                    response.data?.destination;


                // Creamos una lista cerrada
                // de destinos permitidos.
                //
                // Esto evita navegar hacia
                // direcciones inesperadas.
                //
                // Cada ruta corresponde
                // a uno de los tres roles
                // disponibles en el sistema.
                const allowedDestinations = [
                    "/member",
                    "/admin",
                    "/super-admin",
                ];


                // Comprobamos que el destino
                // recibido esté permitido.
                const destinationIsAllowed =
                    allowedDestinations.includes(
                        backendDestination
                    );


                // Si el destino es válido,
                // lo utilizamos.
                //
                // En caso contrario regresamos
                // de forma segura al inicio.
                const destination =
                    destinationIsAllowed
                        ? backendDestination
                        : "/";



                // =========================================================
                // COMPROBAR VERIFICACIÓN DEL CORREO
                // =========================================================

                // Obtenemos la información del usuario que acaba
                // de iniciar sesión correctamente.
                const authenticatedUser = response.data?.user;

                // Comprobamos si el backend registra una fecha
                // de verificación del correo electrónico.
                const emailIsVerified = Boolean(
                    authenticatedUser?.emailVerifiedAt
                );

                // Si el correo todavía no ha sido verificado,
                // enviamos al usuario a la página de verificación.
                if (!emailIsVerified) {

                    navigate(
                        "/verificar-correo",
                        {
                            replace: true,
                        }
                    );

                    return;
                }

                // =========================================================
                // ACCESO AL PANEL CORRESPONDIENTE
                // =========================================================

                // Si el correo está verificado,
                // conservamos la navegación habitual según el rol.
                navigate(
                    destination,
                    {
                        replace: true,
                    }
                );



                // Finalizamos la función
                // después de navegar.
                return;
            }


            // Mostramos un mensaje genérico
            // si la respuesta no confirmó el acceso.
            setErrorMessage(
                "No fue posible iniciar sesión."
            );
        } catch (error) {

            // Buscamos el mensaje entregado
            // por nuestro backend.
            const backendMessage =
                error.response?.data?.message;


            // Si el backend entregó un mensaje,
            // lo mostramos al usuario.
            if (backendMessage) {
                setErrorMessage(
                    backendMessage
                );
            } else if (
                error.code ===
                "ECONNABORTED"
            ) {
                // Informamos cuando la solicitud
                // supera el tiempo de espera.
                setErrorMessage(
                    "El servidor tardó demasiado en responder."
                );
            } else {
                // Mostramos un mensaje genérico
                // para errores de conexión.
                setErrorMessage(
                    "No fue posible conectar con el servidor. Comprueba que el backend esté funcionando."
                );
            }
        } finally {

            // Indicamos que terminó
            // el envío del formulario.
            setIsSubmitting(false);
        }
    };


    // Retornamos la página completa.
    return (
        <div className="login">

            {/* ================================================= */}
            {/* PANEL INSTITUCIONAL */}
            {/* ================================================= */}

            <section className="login__information">


                {/* Mostramos el mensaje principal. */}
                <div className="login__message">

                    {/* Texto pequeño superior. */}
                    <span className="login__eyebrow">
                        Nuestra comunidad
                    </span>

                    {/* Título institucional. */}
                    <h1>
                        Un espacio para crecer, servir y caminar juntos.
                    </h1>

                    {/* Descripción del área privada. */}
                    <p>
                        Ingresa a tu cuenta para acceder a los
                        contenidos y herramientas disponibles
                        para nuestra comunidad.
                    </p>

                </div>



            </section>


            {/* ================================================= */}
            {/* ÁREA DEL FORMULARIO */}
            {/* ================================================= */}

            <section className="login__form-area">

                {/* Creamos el contenedor del formulario. */}
                <div className="login__card">

                    {/* Encabezado del formulario. */}
                    <div className="login__header">

                        {/* Etiqueta superior. */}
                        <span>
                            Acceso a la comunidad
                        </span>

                        {/* Título principal. */}
                        <h2>
                            Iniciar sesión
                        </h2>

                        {/* Explicación breve. */}
                        <p>
                            Ingresa con tu cuenta registrada
                            para continuar.
                        </p>

                    </div>


                    {/* Creamos el formulario de acceso. */}
                    <form
                        className="login__form"
                        onSubmit={handleSubmit}
                        noValidate
                    >

                        {/* Campo del correo electrónico. */}
                        <div className="login__field">

                            {/* Etiqueta del correo. */}
                            <label htmlFor="login-email">
                                Correo electrónico
                            </label>


                            {/* Creamos el contenedor del input. */}
                            <div className="login__input-wrapper">

                                {/* Mostramos el icono del correo. */}
                                <Mail
                                    className="login__input-icon"
                                    size={19}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />


                                {/* Creamos el campo del correo. */}
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="tu-correo@ejemplo.cl"
                                    autoComplete="username"
                                    inputMode="email"
                                    disabled={isSubmitting}
                                    required
                                />

                            </div>

                        </div>


                        {/* Campo de la contraseña. */}
                        <div className="login__field">

                            {/* Etiqueta de la contraseña. */}
                            <label htmlFor="login-password">
                                Contraseña
                            </label>


                            {/* Creamos el contenedor del input. */}
                            <div className="login__input-wrapper">

                                {/* Mostramos el icono de seguridad. */}
                                <LockKeyhole
                                    className="login__input-icon"
                                    size={19}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />


                                {/* Creamos el campo de contraseña. */}
                                <input
                                    id="login-password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Ingresa tu contraseña"
                                    autoComplete="current-password"
                                    disabled={isSubmitting}
                                    required
                                />


                                {/* Permitimos mostrar u ocultar
                    la contraseña ingresada. */}
                                <button
                                    className="login__password-toggle"
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (currentValue) =>
                                                !currentValue
                                        )
                                    }
                                    disabled={isSubmitting}
                                    aria-label={
                                        showPassword
                                            ? "Ocultar contraseña"
                                            : "Mostrar contraseña"
                                    }
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            size={19}
                                            strokeWidth={1.8}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Eye
                                            size={19}
                                            strokeWidth={1.8}
                                            aria-hidden="true"
                                        />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* Mostramos el error solamente
                cuando existe un mensaje. */}
                        {errorMessage && (
                            <div
                                className="login__error"
                                role="alert"
                                aria-live="polite"
                            >
                                {errorMessage}
                            </div>
                        )}


                        {/* Creamos el botón de acceso. */}
                        <button
                            className="login__submit"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {/* Mostramos un indicador
                  mientras espera la respuesta. */}
                            {isSubmitting && (
                                <LoaderCircle
                                    className="login__spinner"
                                    size={20}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                            )}

                            {/* Cambiamos el texto
                  según el estado actual. */}
                            {isSubmitting
                                ? "Verificando acceso..."
                                : "Iniciar sesión"}

                        </button>

                    </form>


                    {/* Mostramos información de seguridad. */}
                    <div className="login__security">

                        {/* Icono de seguridad. */}
                        <LockKeyhole
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />

                        {/* Explicación breve. */}
                        <span>
                            El acceso está disponible solamente
                            para cuentas registradas y activas.
                        </span>

                    </div>

                    {/* Recuperación de contraseña justo después del aviso. */}
                    <LoginRecoveryShortcut />

                </div>

            </section>

        </div>
    );
}


// Exportamos la página pública
// de inicio de sesión.
export default Login;