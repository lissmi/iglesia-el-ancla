
// Importamos useState para manejar los datos del formulario.
// Importamos useRef para impedir solicitudes de pago duplicadas.
import { useRef, useState } from "react";


// Importamos el logo oficial de la iglesia.
import logoElAncla from "../../assets/images/logo-el-ancla.png";

// Importamos los estilos exclusivos de esta página.
import "../../styles/pages/public/Donaciones.css";



/*
 * Configuramos la dirección base de nuestro backend.
 *
 * La variable REACT_APP_API_URL puede contener:
 * http://localhost:5000
 * o
 * http://localhost:5000/api
 *
 * Eliminamos el /api final cuando existe,
 * para evitar duplicarlo en nuestras solicitudes.
 */
const API_BASE_URL = (
    process.env.REACT_APP_API_URL || "http://localhost:5000"
)
    // Eliminamos las barras finales.
    .replace(/\/+$/, "")

    // Eliminamos /api si ya está incluido al final.
    .replace(/\/api$/, "");



// Montos sugeridos para realizar aportes en pesos chilenos.
const MONTOS_SUGERIDOS = [5000, 10000, 20000, 50000];

// Límites iniciales propuestos para el formulario.
const MONTO_MINIMO = 1000;
const MONTO_MAXIMO = 5000000;

// Formateamos los números al formato monetario chileno.
const formatearMonto = (monto) =>
    `$${new Intl.NumberFormat("es-CL").format(monto)}`;


/*
 * Áreas en las que la iglesia utiliza sus recursos.
 * Estas categorías son informativas.
 * No representan porcentajes ni asignaciones fijas.
 */
const DESTINOS_APORTES = [
    {
        numero: "01",
        titulo: "Desayunos comunitarios",
        descripcion:
            "Alimentos e insumos para preparar desayunos y compartir momentos de convivencia.",
    },
    {
        numero: "02",
        titulo: "Actividades y encuentros",
        descripcion:
            "Recursos para organizar reuniones, talleres, celebraciones y actividades de nuestra comunidad.",
    },
    {
        numero: "03",
        titulo: "Estudios bíblicos",
        descripcion:
            "Materiales, guías y recursos de apoyo para la enseñanza y formación bíblica.",
    },
    {
        numero: "04",
        titulo: "Niños y adolescentes",
        descripcion:
            "Materiales y recursos destinados a las clases y actividades de niños y jóvenes.",
    },
    {
        numero: "05",
        titulo: "Funcionamiento de la iglesia",
        descripcion:
            "Artículos de aseo, suministros y otras necesidades para mantener los espacios de encuentro.",
    },
    {
        numero: "06",
        titulo: "Ayuda comunitaria",
        descripcion:
            "Colaboración en iniciativas de apoyo y ayuda fraterna, según las necesidades identificadas.",
    },
];


// Componente principal de la página de donaciones.
function Donaciones() {
    // Al iniciar no hay ningún monto seleccionado.
    const [montoSeleccionado, setMontoSeleccionado] = useState(null);

    // Controlamos si se está utilizando el monto personalizado.
    const [usarOtroMonto, setUsarOtroMonto] = useState(false);

    // Almacenamos el valor escrito por el usuario.
    const [otroMonto, setOtroMonto] = useState("");

    // Determinamos el monto que se mostrará en el resumen.
    const montoActual = usarOtroMonto
        ? Number(otroMonto || 0)
        : montoSeleccionado || 0;

    // Verificamos que el monto sea válido.
    const montoValido =
        Number.isInteger(montoActual) &&
        montoActual >= MONTO_MINIMO &&
        montoActual <= MONTO_MAXIMO;

    // Detectamos errores en el monto personalizado.
    const errorMonto =
        usarOtroMonto &&
        otroMonto !== "" &&
        !montoValido;

    // Seleccionamos uno de los montos sugeridos.
    const seleccionarMonto = (monto) => {
        setMontoSeleccionado(monto);
        setUsarOtroMonto(false);
    };

    // Permitimos introducir solamente números en el monto personalizado.
    const cambiarOtroMonto = (evento) => {
        const valorLimpio = evento.target.value
            .replace(/\D/g, "")
            .slice(0, 8);

        setOtroMonto(valorLimpio);
        setUsarOtroMonto(true);
    };


    /* =========================================================
       INICIAR APORTE VOLUNTARIO CON WEBPAY PLUS
    ========================================================= */

    // Iniciamos una transacción utilizando nuestro backend.
    const iniciarPagoWebpay = async () => {

        // Evitamos continuar si el monto es inválido
        // o si ya existe una solicitud en curso.
        if (!montoValido || pagoEnCursoRef.current) {
            return;
        }

        // Bloqueamos temporalmente nuevas solicitudes.
        pagoEnCursoRef.current = true;

        // Activamos el estado visual de procesamiento.
        setProcesandoPago(true);

        // Limpiamos errores anteriores.
        setErrorPago("");

        try {

            /* =====================================================
               PASO 1: SOLICITAR LA CREACIÓN DE LA TRANSACCIÓN
            ===================================================== */

            // Enviamos únicamente el monto a nuestro backend.
            // No enviamos datos bancarios ni credenciales.
            const respuesta = await fetch(
                `${API_BASE_URL}/api/donaciones/iniciar`,
                {
                    method: "POST",

                    // Indicamos que enviamos y esperamos JSON.
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },

                    // El endpoint es público y no requiere cookies.
                    credentials: "omit",

                    // Evitamos utilizar respuestas almacenadas.
                    cache: "no-store",

                    // Convertimos el monto seleccionado a JSON.
                    body: JSON.stringify({
                        monto: montoActual,
                    }),
                }
            );

            // Interpretamos la respuesta recibida.
            const resultado = await respuesta.json();

            // Comprobamos que el backend haya iniciado el pago.
            if (!respuesta.ok || resultado.success !== true) {
                throw new Error(
                    resultado.message ||
                    "No fue posible preparar el aporte."
                );
            }

            /* =====================================================
               PASO 2: VALIDAR LA RESPUESTA DE TRANSBANK
            ===================================================== */

            // Extraemos la URL y el token devueltos por Express.
            const { url, token } = resultado.data || {};

            // Comprobamos que la URL sea válida.
            const destinoWebpay = new URL(url);

            // Permitimos exclusivamente el formulario oficial
            // de Webpay correspondiente al ambiente de integración.
            const destinoValido =
                destinoWebpay.protocol === "https:" &&
                destinoWebpay.hostname === "webpay3gint.transbank.cl" &&
                destinoWebpay.pathname ===
                "/webpayserver/initTransaction";

            // Impedimos redirigir a direcciones inesperadas.
            if (!destinoValido) {
                throw new Error(
                    "La dirección de Webpay no es válida."
                );
            }

            // Validamos que el token tenga un formato esperado.
            if (
                typeof token !== "string" ||
                !/^[a-zA-Z0-9]{1,128}$/.test(token)
            ) {
                throw new Error(
                    "No se recibió un token de pago válido."
                );
            }

            /* =====================================================
               PASO 3: CREAR FORMULARIO POST PARA TRANSBANK
            ===================================================== */

            // Creamos un formulario HTML temporal.
            const formulario = document.createElement("form");

            // Transbank exige enviar el token mediante POST.
            formulario.method = "POST";

            // Utilizamos la URL validada del proveedor.
            formulario.action = destinoWebpay.toString();

            // Ocultamos el formulario porque el usuario
            // interactuará directamente con Webpay.
            formulario.style.display = "none";

            // Creamos un campo oculto para el token.
            const campoToken = document.createElement("input");

            // Indicamos que el campo no debe mostrarse.
            campoToken.type = "hidden";

            // Este nombre es obligatorio para Webpay Plus.
            campoToken.name = "token_ws";

            // Incorporamos el token recibido del backend.
            campoToken.value = token;

            // Agregamos el token al formulario.
            formulario.appendChild(campoToken);

            // Incorporamos el formulario temporal al documento.
            document.body.appendChild(formulario);

            /* =====================================================
               PASO 4: ENVIAR AL USUARIO A WEBPAY
            ===================================================== */

            // Enviamos el formulario y navegamos hacia Transbank.
            // No se abre una pestaña adicional.
            formulario.submit();

        } catch (error) {

            // Mostramos un mensaje comprensible al usuario.
            setErrorPago(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un problema al iniciar el aporte."
            );

            // Permitimos intentar nuevamente si hubo un error.
            pagoEnCursoRef.current = false;

            // Restauramos el botón.
            setProcesandoPago(false);
        }
    };



    // Indica si estamos preparando una transacción.
    const [procesandoPago, setProcesandoPago] = useState(false);

    // Almacena los errores que debemos mostrar al usuario.
    const [errorPago, setErrorPago] = useState("");

    // Impide iniciar dos pagos simultáneamente,
    // incluso si el usuario presiona el botón muy rápido.
    const pagoEnCursoRef = useRef(false);


    return (
        <main className="donaciones">

            {/* =====================================================
          SECCIÓN 1: PRESENTACIÓN PRINCIPAL
      ===================================================== */}

            <section className="donaciones__hero">
                <div className="donaciones__container donaciones__hero-content">


                    <div className="donaciones__hero-text">
                        {/* Identificación institucional. */}
                        <span className="donaciones__eyebrow">
                            EL ANCLA · COMUNIDAD CRISTIANA
                        </span>

                        {/* Mensaje principal de agradecimiento. */}
                        <h1 className="donaciones__hero-title">
                            Gracias por acompañarnos
                            <span>en nuestra misión.</span>
                        </h1>

                        {/* Descripción de la misión comunitaria. */}
                        <p className="donaciones__hero-description">
                            En Iglesia El Ancla trabajamos para compartir
                            la Palabra de Dios, fortalecer nuestra comunidad
                            y crear espacios de encuentro, aprendizaje y servicio.
                        </p>

                        {/* Explicación sin presión económica. */}
                        <p className="donaciones__hero-subdescription">
                            Agradecemos tu interés en nuestra misión.
                            Si deseas colaborar, puedes realizar un aporte
                            voluntario o participar de otras maneras.
                        </p>

                        {/* Enlace hacia el formulario de aportes. */}
                        <a
                            className="donaciones__primary-link"
                            href="#realizar-aporte"
                        >
                            Ver opciones de aporte
                            <span aria-hidden="true">↗</span>
                        </a>
                    </div>


                    <div className="donaciones__hero-visual">
                        <div className="donaciones__hero-circle">
                            <img
                                src={logoElAncla}
                                alt="Iglesia El Ancla Comunidad Cristiana"
                                className="donaciones__hero-logo"
                            />
                        </div>


                    </div>

                </div>
            </section>

            {/* =====================================================
          SECCIÓN 2: INTRODUCCIÓN A LOS APORTES
      ===================================================== */}


            {/* Introducción a la sección de aportes. */}
            <section className="donaciones__intro">
                <div className="donaciones__container donaciones__intro-content">

                    {/* Etiqueta introductoria. */}
                    <span className="donaciones__section-label">
                        NUESTRA COMUNIDAD
                    </span>

                    {/* Título de agradecimiento. */}
                    <h2>Gracias por ser parte de El Ancla</h2>

                    {/* Explicación del propósito de los recursos. */}
                    <p>
                        Cada actividad, estudio y encuentro forma parte
                        de nuestra misión de compartir la Palabra de Dios
                        y crecer juntos como comunidad. Los aportes
                        voluntarios contribuyen a sostener estos espacios
                        y las necesidades de la iglesia.
                    </p>

                    {/* Separador visual dorado. */}
                    <div className="donaciones__intro-divider" />

                    {/* Mensaje que refuerza la participación libre. */}
                    <p className="donaciones__intro-highlight">
                        Tu presencia y participación siempre serán
                        valiosas, independientemente de cualquier aporte.
                    </p>

                </div>
            </section>


            {/* =====================================================
          SECCIÓN 3: FORMULARIO DE APORTES
      ===================================================== */}

            <section
                className="donaciones__contribution-section"
                id="realizar-aporte"
            >
                <div className="donaciones__container">

                    <div className="donaciones__section-heading">
                        <span className="donaciones__section-label">
                            TU GENEROSIDAD HACE LA DIFERENCIA
                        </span>

                        <h2>Realiza un aporte voluntario</h2>

                        <p>
                            Escoge la cantidad con la que deseas contribuir.
                            Puedes seleccionar un monto sugerido o ingresar
                            uno personalizado.
                        </p>
                    </div>

                    <div className="donaciones__contribution-layout">

                        {/* Tarjeta principal del formulario. */}
                        <div className="donaciones__form-card">

                            <div className="donaciones__form-header">
                                <span className="donaciones__form-icon" aria-hidden="true">
                                    ♡
                                </span>

                                <div>
                                    {/* Encabezado del formulario de donación. */}
                                    <h3>Tu aporte voluntario</h3>

                                    {/* Aclaración sobre la modalidad de pago. */}
                                    <p>
                                        Elige libremente cuánto deseas aportar.
                                        El pago se realiza una sola vez.
                                    </p>
                                </div>
                            </div>


                            {/* Montos sugeridos. */}
                            <div className="donaciones__field-group">
                                <h4>Selecciona un monto</h4>

                                <p className="donaciones__field-description">
                                    Elige cuánto deseas aportar en pesos chilenos.
                                </p>

                                <div className="donaciones__amount-grid">
                                    {MONTOS_SUGERIDOS.map((monto) => (
                                        <button
                                            key={monto}
                                            type="button"
                                            aria-pressed={
                                                !usarOtroMonto &&
                                                montoSeleccionado === monto
                                            }
                                            className={`donaciones__amount-button ${!usarOtroMonto &&
                                                montoSeleccionado === monto
                                                ? "donaciones__amount-button--active"
                                                : ""
                                                }`}
                                            onClick={() => seleccionarMonto(monto)}
                                        >
                                            {formatearMonto(monto)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Campo para ingresar otro monto. */}
                            <div className="donaciones__field-group">
                                <label
                                    className="donaciones__input-label"
                                    htmlFor="donaciones-otro-monto"
                                >
                                    O ingresa otro monto
                                </label>

                                <div
                                    className={`donaciones__custom-input ${usarOtroMonto
                                        ? "donaciones__custom-input--active"
                                        : ""
                                        }`}
                                >
                                    <span aria-hidden="true">$</span>

                                    <input
                                        id="donaciones-otro-monto"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="off"
                                        placeholder="Ej: 15000"
                                        value={otroMonto}
                                        onFocus={() => setUsarOtroMonto(true)}
                                        onChange={cambiarOtroMonto}
                                        aria-invalid={errorMonto}
                                        aria-describedby="donaciones-monto-ayuda"
                                    />

                                    <span className="donaciones__currency">
                                        CLP
                                    </span>
                                </div>

                                <p
                                    id="donaciones-monto-ayuda"
                                    className={
                                        errorMonto
                                            ? "donaciones__input-error"
                                            : "donaciones__input-help"
                                    }
                                >
                                    {errorMonto
                                        ? `Ingresa un monto entre ${formatearMonto(MONTO_MINIMO)} y ${formatearMonto(MONTO_MAXIMO)}.`
                                        : "Puedes elegir libremente el monto de tu contribución."}
                                </p>
                            </div>

                            {/* Resumen dinámico del aporte. */}
                            <div className="donaciones__total" aria-live="polite">
                                <div>
                                    <span>Total de tu aporte</span>
                                    <small>Aporte único · Pesos chilenos</small>
                                </div>

                                <strong>
                                    {montoValido
                                        ? formatearMonto(montoActual)
                                        : "—"}
                                </strong>
                            </div>


                            {/* Botón para iniciar el pago mediante Webpay Plus. */}
                            <button
                                className="donaciones__payment-button"
                                type="button"

                                // Ejecutamos el proceso de pago.
                                onClick={iniciarPagoWebpay}

                                // Lo deshabilitamos si no hay monto válido
                                // o mientras se está preparando la transacción.
                                disabled={!montoValido || procesandoPago}

                                // Informamos el estado a tecnologías de asistencia.
                                aria-busy={procesandoPago}
                            >
                                {/* Texto dinámico del botón. */}
                                {procesandoPago
                                    ? "Conectando con Webpay..."
                                    : "Continuar con Webpay"}

                                {/* Ocultamos la flecha mientras procesa. */}
                                {!procesandoPago && (
                                    <span aria-hidden="true">↗</span>
                                )}
                            </button>

                            {/* Mostramos errores de conexión o validación. */}
                            {errorPago && (
                                <p
                                    className="donaciones__payment-error"
                                    role="alert"
                                >
                                    {errorPago}
                                </p>
                            )}




                            <p
                                className="donaciones__payment-note"
                                id="donaciones-pago-aviso"
                            >
                                <span aria-hidden="true">♧</span>
                                Estamos preparando la integración de pagos.
                                Por ahora no se realizan cobros desde esta página.
                            </p>

                        </div>

                        {/* Panel informativo lateral. */}
                        <aside className="donaciones__information">

                            <div className="donaciones__information-card">
                                <div className="donaciones__information-symbol" aria-hidden="true">
                                    ♡
                                </div>

                                <span className="donaciones__section-label">
                                    UNA CONTRIBUCIÓN CON PROPÓSITO
                                </span>

                                <h3>Gracias por ser parte de nuestra comunidad</h3>

                                <p>
                                    Tu generosidad nos ayuda a continuar
                                    desarrollando espacios de encuentro,
                                    formación y servicio.
                                </p>

                                <div className="donaciones__information-separator" />

                                <ul>
                                    <li>
                                        <span aria-hidden="true">✓</span>
                                        Apoyo a las actividades de la iglesia.
                                    </li>

                                    <li>
                                        <span aria-hidden="true">✓</span>
                                        Recursos y materiales comunitarios.
                                    </li>

                                    <li>
                                        <span aria-hidden="true">✓</span>
                                        Mantención de espacios de encuentro.
                                    </li>
                                </ul>
                            </div>

                            <div className="donaciones__safety-card">
                                <div className="donaciones__safety-icon" aria-hidden="true">
                                    ♢
                                </div>

                                <div>
                                    <h4>Un proceso claro y seguro</h4>

                                    <p>
                                        Próximamente los aportes serán gestionados
                                        mediante Webpay. No necesitarás iniciar
                                        sesión ni compartir datos bancarios
                                        directamente con nuestra página.
                                    </p>
                                </div>
                            </div>

                            <div className="donaciones__voluntary-card">
                                <strong>Importante</strong>

                                <p>
                                    Todos los aportes son voluntarios.
                                    No realizar una donación no limita
                                    tu participación en actividades,
                                    servicios o contenidos de la iglesia.
                                </p>
                            </div>

                        </aside>
                    </div>
                </div>
            </section>


            {/* =====================================================
    SECCIÓN: DESTINO DE LOS APORTES VOLUNTARIOS
===================================================== */}

            <section
                className="donaciones__destinos"
                aria-labelledby="donaciones-destinos-titulo"
            >
                <div className="donaciones__container">

                    {/* Encabezado de la sección informativa. */}
                    <div className="donaciones__section-heading">

                        <span className="donaciones__section-label">
                            TRANSPARENCIA Y COMUNIDAD
                        </span>

                        <h2 id="donaciones-destinos-titulo">
                            ¿En qué se utilizan los aportes?
                        </h2>

                        <p>
                            Los recursos que recibe la iglesia contribuyen
                            al desarrollo de nuestras actividades y al
                            funcionamiento de la comunidad.
                            Conoce algunas de las áreas que apoyamos.
                        </p>

                    </div>

                    {/* Tarjetas informativas de las distintas áreas. */}
                    <div className="donaciones__destinos-grid">

                        {DESTINOS_APORTES.map((destino) => (

                            <article
                                className="donaciones__destino-card"
                                key={destino.numero}
                            >

                                {/* Identificador decorativo de la tarjeta. */}
                                <div className="donaciones__destino-icon">
                                    <span>{destino.numero}</span>
                                </div>

                                {/* Título del destino. */}
                                <h3>{destino.titulo}</h3>

                                {/* Descripción de los recursos utilizados. */}
                                <p>{destino.descripcion}</p>

                                {/* Línea decorativa dorada. */}
                                <div className="donaciones__destino-line" />

                            </article>

                        ))}

                    </div>

                    {/* Aclaración sobre el uso de los recursos. */}
                    <div className="donaciones__destinos-nota">

                        <span aria-hidden="true">✦</span>

                        <p>
                            Los recursos se administran de acuerdo con
                            las necesidades y prioridades de la iglesia.

                        </p>

                    </div>

                </div>
            </section>



            {/* =====================================================
          SECCIÓN 5: CIERRE
      ===================================================== */}

            <section className="donaciones__closing">
                <div className="donaciones__container donaciones__closing-content">

                    <span aria-hidden="true">✦</span>

                    <h2>Gracias por caminar junto a nosotros</h2>

                    <p>
                        Cada gesto de amor y servicio fortalece nuestra
                        comunidad. Gracias por ser parte de El Ancla.
                    </p>

                    <span className="donaciones__closing-signature">
                        FIRMES EN LA PALABRA, ANCLADOS EN CRISTO.
                    </span>

                </div>
            </section>

        </main>
    );
}

export default Donaciones;
