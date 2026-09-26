// Importamos los hooks necesarios de React.
import { useCallback, useEffect, useRef, useState } from "react";

// Importamos Link para volver al inicio sin recargar la aplicación.
import { Link } from "react-router-dom";


// Importamos los estilos exclusivos de la página 404.
import "../../styles/pages/public/NotFound.css";

// Importamos la imagen personalizada del gato.
import gatoIcon from "../../assets/icons/gato.png";

// Importamos la imagen personalizada del cactus.
import cactusIcon from "../../assets/icons/cactus.png";

// Creamos la página de error 404.
function NotFound() {
    // Guardamos si el juego se encuentra activo.
    const [isPlaying, setIsPlaying] = useState(false);

    // Guardamos si el gato está saltando.
    const [isJumping, setIsJumping] = useState(false);

    // Guardamos si ocurrió una colisión.
    const [isGameOver, setIsGameOver] = useState(false);

    // Guardamos el puntaje actual.
    const [currentScore, setCurrentScore] = useState(0);

    // Guardamos el récord alcanzado durante esta sesión.
    const [recordScore, setRecordScore] = useState(0);

    // Creamos una referencia al elemento visual del gato.
    const catRef = useRef(null);

    // Creamos una referencia al cactus.
    const cactusRef = useRef(null);

    // Creamos una referencia para controlar el tiempo del salto.
    const jumpTimeoutRef = useRef(null);

    // Formateamos el puntaje para mostrar siempre cuatro cifras.
    const formatScore = (score) => {
        // Convertimos el número a texto y completamos con ceros a la izquierda.
        return String(score).padStart(4, "0");
    };

    // Creamos la función encargada de iniciar o reiniciar el juego.
    const startGame = () => {
        // Reiniciamos el puntaje.
        setCurrentScore(0);

        // Ocultamos el mensaje de Game Over.
        setIsGameOver(false);

        // Quitamos cualquier salto anterior.
        setIsJumping(false);

        // Marcamos el juego como activo.
        setIsPlaying(true);
    };

    // Creamos la función encargada de realizar el salto.
    const jump = useCallback(() => {
        // Evitamos saltar cuando el juego todavía no comenzó.
        if (!isPlaying) {
            return;
        }

        // Evitamos iniciar otro salto mientras el anterior sigue activo.
        if (isJumping) {
            return;
        }

        // Activamos la animación de salto.
        setIsJumping(true);

        // Limpiamos un temporizador anterior por seguridad.
        if (jumpTimeoutRef.current) {
            clearTimeout(jumpTimeoutRef.current);
        }

        // Programamos el final de la animación.
        jumpTimeoutRef.current = setTimeout(() => {
            // Quitamos la clase de salto.
            setIsJumping(false);
        }, 400);
    }, [isJumping, isPlaying]);

    // Controlamos el teclado durante el juego.
    useEffect(() => {
        // Creamos la función que reaccionará a las teclas.
        const handleKeyDown = (event) => {
            // Verificamos que se haya presionado Espacio o Flecha arriba.
            const isJumpKey =
                event.code === "Space" || event.code === "ArrowUp";

            // Terminamos si se presionó otra tecla.
            if (!isJumpKey) {
                return;
            }

            // Evitamos que Espacio desplace la página hacia abajo.
            event.preventDefault();

            // Ejecutamos el salto.
            jump();
        };

        // Escuchamos las pulsaciones del teclado.
        window.addEventListener("keydown", handleKeyDown);

        // Limpiamos el evento cuando el componente se desmonta.
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [jump]);

    // Controlamos el contador del puntaje.
    useEffect(() => {
        // No iniciamos ningún contador si el juego está detenido.
        if (!isPlaying) {
            return undefined;
        }

        // Creamos un intervalo que aumenta el puntaje.
        const scoreInterval = setInterval(() => {
            // Aumentamos el puntaje anterior en una unidad.
            setCurrentScore((previousScore) => previousScore + 1);
        }, 200);

        // Detenemos el contador al pausar o desmontar el componente.
        return () => {
            clearInterval(scoreInterval);
        };
    }, [isPlaying]);

    // Controlamos constantemente si el gato choca con el cactus.
    useEffect(() => {
        // No comprobamos colisiones si el juego no está activo.
        if (!isPlaying) {
            return undefined;
        }

        // Creamos un intervalo para revisar las posiciones.
        const collisionInterval = setInterval(() => {
            // Obtenemos el elemento del gato.
            const catElement = catRef.current;

            // Obtenemos el elemento del cactus.
            const cactusElement = cactusRef.current;

            // Terminamos si alguno todavía no existe.
            if (!catElement || !cactusElement) {
                return;
            }

            // Obtenemos la posición y tamaño reales del gato.
            const catRect = catElement.getBoundingClientRect();

            // Obtenemos la posición y tamaño reales del cactus.
            const cactusRect = cactusElement.getBoundingClientRect();

            // Definimos un margen para que la colisión sea más justa.
            const collisionMargin = 8;

            // Comprobamos si ambos elementos se superponen horizontalmente.
            const horizontalCollision =
                catRect.right - collisionMargin > cactusRect.left &&
                catRect.left + collisionMargin < cactusRect.right;

            // Comprobamos si ambos elementos se superponen verticalmente.
            const verticalCollision =
                catRect.bottom - collisionMargin > cactusRect.top &&
                catRect.top + collisionMargin < cactusRect.bottom;

            // Comprobamos si ocurrió una colisión completa.
            if (horizontalCollision && verticalCollision) {
                // Detenemos el juego.
                setIsPlaying(false);

                // Mostramos el mensaje de Game Over.
                setIsGameOver(true);

                // Actualizamos el récord solo cuando el puntaje fue superior.
                setRecordScore((previousRecord) =>
                    Math.max(previousRecord, currentScore)
                );
            }
        }, 20);

        // Limpiamos el intervalo cuando el juego se detiene.
        return () => {
            clearInterval(collisionInterval);
        };
    }, [currentScore, isPlaying]);

    // Limpiamos el temporizador del salto al desmontar la página.
    useEffect(() => {
        // Retornamos la función de limpieza.
        return () => {
            // Limpiamos el temporizador si todavía existe.
            if (jumpTimeoutRef.current) {
                clearTimeout(jumpTimeoutRef.current);
            }
        };
    }, []);

    // Retornamos toda la página 404.
    return (
        // Contenedor completo de la página.
        <div className="not-found">

            {/* Contenido principal de la página 404. */}
            <main className="not-found__main">
                {/* Encabezado informativo de la página. */}
                <section className="not-found__intro">
                    {/* Código de error. */}
                    <p className="not-found__code">404</p>

                    {/* Título principal. */}
                    <h1 className="not-found__title">
                        Parece que esta página se perdió en el camino
                    </h1>

                    {/* Explicación para el visitante. */}
                    <p className="not-found__description">
                        La dirección que intentaste visitar no existe o fue modificada.
                        Puedes regresar al inicio o entretenerte un momento ayudando al
                        gatito a saltar.
                    </p>

                    {/* Enlace para volver al Home. */}
                    <Link className="not-found__home-button" to="/">
                        Volver al inicio
                    </Link>
                </section>

                {/* Sección que contiene el juego. */}
                <section
                    className="not-found-game"
                    aria-label="Juego del gato y el cactus"
                >
                    {/* Barra superior del juego. */}
                    <div className="not-found-game__top">
                        {/* Instrucciones del juego. */}
                        <p className="not-found-game__instructions">
                            Usa espacio, flecha arriba o toca el área para saltar.
                        </p>

                        {/* Puntajes del juego. */}
                        <div className="not-found-game__score">
                            {/* Récord actual. */}
                            <p>
                                Récord{" "}
                                <span>{formatScore(recordScore)}</span>
                            </p>

                            {/* Puntaje de esta partida. */}
                            <p>
                                Puntaje{" "}
                                <span>{formatScore(currentScore)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Área interactiva donde ocurre el juego. */}
                    <div
                        className="not-found-game__stage"
                        onClick={jump}
                        role="button"
                        tabIndex={0}
                        aria-label="Área de juego. Presiona para hacer saltar al gato."
                    >
                        {/* Botón para comenzar o reiniciar. */}
                        {!isPlaying && (
                            <button
                                className="not-found-game__start-button"
                                type="button"
                                onClick={(event) => {
                                    // Evitamos que el clic también intente ejecutar el salto.
                                    event.stopPropagation();

                                    // Iniciamos una nueva partida.
                                    startGame();
                                }}
                            >
                                {isGameOver ? "Reintentar" : "Comenzar"}
                            </button>
                        )}

                        {/* Mensaje mostrado después de una colisión. */}
                        {isGameOver && (
                            <div
                                className="not-found-game__game-over"
                                role="status"
                                aria-live="polite"
                            >
                                {/* Texto principal del mensaje. */}
                                <strong>¡Game Over!</strong>

                                {/* Texto secundario del mensaje. */}
                                <span>El gatito encontró un cactus 😹</span>
                            </div>
                        )}

                        {/* Personaje principal del gato. */}
                        <div
                            ref={catRef}
                            className={`not-found-game__cat ${isJumping ? "not-found-game__cat--jumping" : ""
                                }`}
                            aria-hidden="true"
                        >
                            {/* Mostramos la imagen personalizada del gatito. */}
                            <img
                                className={`not-found-game__cat-image ${isPlaying ? "not-found-game__cat-image--running" : ""
                                    }`}
                                src={gatoIcon}
                                alt=""
                            />
                        </div>

                        {/* Obstáculo principal del juego. */}
                        <div
                            ref={cactusRef}
                            className={`not-found-game__cactus ${isPlaying
                                    ? "not-found-game__cactus--moving"
                                    : ""
                                }`}
                            aria-hidden="true"
                        >
                            {/* Mostramos la imagen personalizada del cactus. */}
                            <img
                                className="not-found-game__cactus-image"
                                src={cactusIcon}
                                alt=""
                            />
                        </div>
                        {/* Línea del suelo. */}
                        <div
                            className="not-found-game__ground"
                            aria-hidden="true"
                        ></div>
                    </div>
                </section>
            </main>

        </div>
    );
}

// Exportamos la página 404.
export default NotFound;