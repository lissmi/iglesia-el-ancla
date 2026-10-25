
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// Importamos el logo institucional.
import logoElAncla from "../../assets/images/logo-el-ancla.png";

// Importamos los estilos de esta página.
import "../../styles/pages/public/DonacionResultado.css";


/* =========================================================
   CONFIGURACIÓN DE LA API DEL BACKEND
========================================================= */

// Obtenemos la dirección del backend desde las
// variables de entorno de React.
const API_BASE_URL = (
    process.env.REACT_APP_API_URL || "http://localhost:5000"
)

    // Eliminamos barras sobrantes al final de la URL.
    .replace(/\/+$/, "")

    // Eliminamos /api si ya existe al final.
    // Así evitamos formar direcciones con /api/api.
    .replace(/\/api$/i, "");


// Definimos los mensajes según el estado registrado en MongoDB.
const MENSAJES = {
    aprobada: {
        icono: "✓",
        titulo: "Tu aporte fue recibido",
        descripcion:
            "La transacción fue confirmada correctamente. Gracias por apoyar la misión de Iglesia El Ancla.",
        estilo: "aprobada",
    },

    rechazada: {
        icono: "×",
        titulo: "No se pudo completar el aporte",
        descripcion:
            "La transacción no fue autorizada. No registramos este aporte como recibido.",
        estilo: "rechazada",
    },

    anulada: {
        icono: "—",
        titulo: "El aporte no fue completado",
        descripcion:
            "El proceso de pago fue cancelado o anulado. Puedes volver a la página de donaciones si lo deseas.",
        estilo: "anulada",
    },

    pendiente: {
        icono: "⋯",
        titulo: "Tu aporte está pendiente",
        descripcion:
            "Todavía no tenemos una confirmación de pago. Este aporte no figura como recibido.",
        estilo: "pendiente",
    },

    iniciada: {
        icono: "⋯",
        titulo: "Transacción iniciada",
        descripcion:
            "El proceso se inició, pero todavía no tenemos un resultado confirmado.",
        estilo: "pendiente",
    },

    confirmando: {
        icono: "⋯",
        titulo: "Estamos verificando el resultado",
        descripcion:
            "El servidor está procesando la confirmación de la transacción.",
        estilo: "pendiente",
    },

    revision: {
        icono: "!",
        titulo: "Estamos verificando tu aporte",
        descripcion:
            "No fue posible determinar el resultado definitivo. No realices otro aporte para reemplazar este hasta aclarar su estado.",
        estilo: "revision",
    },

    error: {
        icono: "!",
        titulo: "No se pudo iniciar el aporte",
        descripcion:
            "Se produjo un inconveniente técnico al iniciar la transacción. No tenemos un pago confirmado.",
        estilo: "revision",
    },
};

// Formateamos montos como pesos chilenos.
const formatearMonto = (monto) =>
    new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(monto);

// Creamos el componente principal.
function DonacionResultado() {

    // Leemos los parámetros de la dirección actual.
    const [searchParams] = useSearchParams();

    // Obtenemos la orden que agregó nuestro backend.
    const ordenCompra = searchParams.get("orden");

    // Almacenamos el resultado de la consulta.
    const [consulta, setConsulta] = useState({
        fase: "cargando",
        donacion: null,
    });

    // Permite volver a consultar sin recargar toda la página.
    const [actualizacion, setActualizacion] = useState(0);

    // Consultamos el estado cuando cambia la orden.
    useEffect(() => {

        // Validamos el formato de la referencia.
        if (
            !ordenCompra ||
            !/^ANCLA-[a-f0-9]{16}$/.test(ordenCompra)
        ) {
            setConsulta({
                fase: "sin_referencia",
                donacion: null,
            });
            return;
        }

        // Permitirá cancelar una solicitud al desmontar la página.
        const controller = new AbortController();

        // Creamos la función que consulta el backend.
        const consultarResultado = async () => {

            // Indicamos que estamos consultando.
            setConsulta({
                fase: "cargando",
                donacion: null,
            });

            try {

                // Solicitamos el estado de la orden.
                const respuesta = await fetch(
                    `${API_BASE_URL}/api/donaciones/resultado/${encodeURIComponent(ordenCompra)}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                        cache: "no-store",
                        signal: controller.signal,
                    }
                );

                // Comprobamos si la orden existe.
                if (respuesta.status === 404) {
                    setConsulta({
                        fase: "no_encontrada",
                        donacion: null,
                    });
                    return;
                }

                // Detectamos otros errores HTTP.
                if (!respuesta.ok) {
                    throw new Error("Error consultando la transacción.");
                }

                // Convertimos la respuesta del backend a JSON.
                const resultado = await respuesta.json();

                // Verificamos que los datos sean válidos
                // y correspondan a la orden solicitada.
                if (
                    resultado.success !== true ||
                    !resultado.data ||
                    resultado.data.ordenCompra !== ordenCompra
                ) {
                    throw new Error("Respuesta de donación inválida.");
                }

                // Guardamos la información verificada.
                setConsulta({
                    fase: "completada",
                    donacion: resultado.data,
                });

            } catch (error) {

                // Ignoramos cancelaciones intencionales de fetch.
                if (error.name === "AbortError") {
                    return;
                }

                // Mostramos un error de consulta sin afirmar
                // que la transacción haya fallado.
                setConsulta({
                    fase: "error_consulta",
                    donacion: null,
                });
            }
        };

        // Ejecutamos la consulta.
        consultarResultado();

        // Cancelamos solicitudes pendientes al desmontar.
        return () => controller.abort();

    }, [ordenCompra, actualizacion]);

    // Obtenemos el estado financiero si está disponible.
    const estado = consulta.donacion?.estado;

    // Seleccionamos el mensaje correspondiente.
    const mensaje = MENSAJES[estado] || {
        icono: "!",
        titulo: "No pudimos confirmar el resultado",
        descripcion:
            "No tenemos información suficiente para determinar el estado del aporte.",
        estilo: "revision",
    };

    // Comprobamos si corresponde permitir otra consulta.
    const puedeActualizar =
        consulta.fase === "error_consulta" ||
        ["pendiente", "iniciada", "confirmando", "revision"].includes(estado);

    // Renderizamos la página.
    return (
        <main className="donacion-resultado">

            <div className="donacion-resultado__container">

                {/* Logo institucional con navegación al inicio. */}
                <Link
                    to="/"
                    className="donacion-resultado__brand"
                    aria-label="Volver al inicio de Iglesia El Ancla"
                >
                    <img
                        src={logoElAncla}
                        alt="Iglesia El Ancla"
                    />
                </Link>

                {/* Tarjeta principal del resultado. */}
                <section
                    className="donacion-resultado__card"
                    aria-live="polite"
                >

                    {consulta.fase === "cargando" ? (

                        // Estado mientras se consulta MongoDB.
                        <div className="donacion-resultado__content">

                            <div className="donacion-resultado__loading" />

                            <h1>Consultando tu aporte</h1>

                            <p>
                                Estamos revisando la información
                                registrada de tu transacción.
                            </p>

                        </div>

                    ) : consulta.fase !== "completada" ? (

                        // Estados sin referencia o sin información.
                        <div className="donacion-resultado__content">

                            <div className="donacion-resultado__icon donacion-resultado__icon--revision">
                                !
                            </div>

                            <span className="donacion-resultado__eyebrow">
                                IGLESIA EL ANCLA
                            </span>

                            <h1>
                                {consulta.fase === "sin_referencia"
                                    ? "No encontramos una referencia de aporte"
                                    : consulta.fase === "no_encontrada"
                                        ? "No encontramos esta donación"
                                        : "No pudimos consultar tu aporte"}
                            </h1>

                            <p>
                                {consulta.fase === "sin_referencia"
                                    ? "No recibimos una orden que permita identificar una transacción."
                                    : consulta.fase === "no_encontrada"
                                        ? "La referencia consultada no corresponde a una donación registrada."
                                        : "La consulta no está disponible. Esto no significa necesariamente que el pago haya sido rechazado."}
                            </p>

                        </div>

                    ) : (

                        // Resultado financiero obtenido desde el backend.
                        <div className="donacion-resultado__content">

                            <div
                                className={`donacion-resultado__icon donacion-resultado__icon--${mensaje.estilo}`}
                                aria-hidden="true"
                            >
                                {mensaje.icono}
                            </div>

                            <span className="donacion-resultado__eyebrow">
                                IGLESIA EL ANCLA · APORTES VOLUNTARIOS
                            </span>

                            <h1>{mensaje.titulo}</h1>

                            <p>{mensaje.descripcion}</p>

                            {/* Resumen de la transacción consultada. */}
                            <div className="donacion-resultado__summary">

                                <div>
                                    <span>Referencia</span>
                                    <strong>
                                        {consulta.donacion.ordenCompra}
                                    </strong>
                                </div>

                                <div>
                                    <span>Monto</span>
                                    <strong>
                                        {formatearMonto(consulta.donacion.monto)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Estado</span>
                                    <strong>
                                        {estado === "aprobada"
                                            ? "Aprobado"
                                            : estado === "rechazada"
                                                ? "Rechazado"
                                                : estado === "anulada"
                                                    ? "No completado"
                                                    : "En verificación"}
                                    </strong>
                                </div>

                            </div>

                        </div>
                    )}

                    {/* Acciones para regresar o consultar nuevamente. */}
                    <div className="donacion-resultado__actions">

                        {puedeActualizar && (
                            <button
                                type="button"
                                className="donacion-resultado__button donacion-resultado__button--secondary"
                                onClick={() => setActualizacion((valor) => valor + 1)}
                            >
                                Consultar estado nuevamente
                            </button>
                        )}

                        <Link
                            to="/donaciones"
                            className="donacion-resultado__button donacion-resultado__button--primary"
                        >
                            Volver a donaciones
                        </Link>

                        <Link
                            to="/"
                            className="donacion-resultado__home-link"
                        >
                            Ir a la página de inicio
                        </Link>

                    </div>

                </section>

                {/* Aclaración institucional. */}
                <p className="donacion-resultado__footer">
                    Iglesia El Ancla Comunidad Cristiana
                    <span> · </span>
                    Firme en la fe, unidos en comunidad.
                </p>

            </div>
        </main>
    );
}

export default DonacionResultado;
