// Pasos originales del devocional de Iglesia El Ancla.
const devotionalSteps = [
        {
            // Identificador del paso.
            id: 1,

            // Número visual.
            number: "01",

            // Título del paso.
            title: "Prepara tu momento",

            // Descripción breve.
            summary:
                "Busca un espacio tranquilo y dispón tu corazón para estar con Dios.",

            // Explicación completa.
            description:
                "No necesitas un lugar perfecto ni demasiado tiempo. Lo importante es apartar unos minutos con intención, evitando distracciones y preparando todo lo que puedas necesitar.",

            // Recomendaciones prácticas.
            tips: [
                "Escoge un horario que puedas mantener con regularidad.",
                "Busca un lugar cómodo y con pocas distracciones.",
                "Ten cerca tu Biblia, un cuaderno y algo para escribir.",
                "Silencia las notificaciones del teléfono durante ese momento.",
            ],

            // Frase de ayuda.
            reminder:
                "La constancia es más importante que comenzar con sesiones demasiado largas.",
        },
        {
            id: 2,
            number: "02",
            title: "Comienza con oración",
            summary:
                "Habla con Dios con sinceridad y pídele ayuda para comprender Su Palabra.",
            description:
                "Antes de leer, reconoce que necesitas la dirección de Dios. No es necesario utilizar palabras complicadas. Puedes hablar con Él de manera sencilla, agradeciendo y pidiendo sabiduría.",
            tips: [
                "Agradece a Dios por un nuevo día.",
                "Reconoce aquello que está ocupando tu mente.",
                "Pide sabiduría para comprender el pasaje.",
                "Pídele disposición para obedecer lo aprendido.",
            ],
            reminder:
                "La oración prepara el corazón para escuchar y responder a la Palabra.",
        },
        {
            id: 3,
            number: "03",
            title: "Escoge un pasaje breve",
            summary:
                "Selecciona una porción de la Biblia que puedas leer con atención.",
            description:
                "Para comenzar, es mejor estudiar pocos versículos con calma que leer muchos capítulos sin detenerse. Puedes avanzar ordenadamente por un Evangelio, una carta o un plan de lectura.",
            tips: [
                "Comienza con uno de los Evangelios.",
                "Lee entre cinco y quince versículos.",
                "Evita escoger textos al azar todos los días.",
                "Mantén una secuencia para comprender mejor el contexto.",
            ],
            reminder:
                "Leer poco con atención puede ser más provechoso que leer mucho apresuradamente.",
        },
        {
            id: 4,
            number: "04",
            title: "Lee y observa",
            summary:
                "Lee el pasaje varias veces y presta atención a lo que realmente dice.",
            description:
                "La observación consiste en identificar palabras, personajes, acciones, ideas repetidas y conexiones dentro del texto antes de intentar aplicarlo inmediatamente.",
            tips: [
                "Lee el pasaje lentamente al menos dos veces.",
                "Identifica quién habla y a quién se dirige.",
                "Observa palabras o ideas que se repitan.",
                "Revisa qué ocurre antes y después del pasaje.",
            ],
            reminder:
                "Antes de preguntarte qué significa para ti, observa qué comunica realmente el texto.",
        },
        {
            id: 5,
            number: "05",
            title: "Comprende la enseñanza",
            summary:
                "Reflexiona sobre lo que el pasaje enseña acerca de Dios y de la vida cristiana.",
            description:
                "Después de observar, intenta resumir la enseñanza central con tus propias palabras. Considera el contexto y evita construir conclusiones únicamente a partir de una frase aislada.",
            tips: [
                "Pregunta qué revela el pasaje acerca de Dios.",
                "Identifica una verdad, promesa, mandato o advertencia.",
                "Resume la idea principal en una sola frase.",
                "Compara tu conclusión con el resto de la Biblia.",
            ],
            reminder:
                "Una buena aplicación comienza con una comprensión responsable del texto.",
        },
        {
            id: 6,
            number: "06",
            title: "Llévalo a tu vida",
            summary:
                "Piensa en una manera concreta de responder a lo aprendido.",
            description:
                "La aplicación no consiste solamente en sentir inspiración. Busca una decisión, actitud o acción específica que refleje la enseñanza del pasaje en tu vida diaria.",
            tips: [
                "Identifica una actitud que necesites cambiar.",
                "Piensa en una acción concreta para esta semana.",
                "Relaciona la enseñanza con tus decisiones actuales.",
                "Evita aplicaciones demasiado generales.",
            ],
            reminder:
                "Una aplicación sencilla y concreta puede producir cambios reales.",
        },
        {
            id: 7,
            number: "07",
            title: "Termina orando",
            summary:
                "Responde a Dios con gratitud, confesión y una decisión personal.",
            description:
                "La oración final permite convertir lo aprendido en una respuesta sincera. Agradece por la enseñanza, reconoce aquello que necesitas cambiar y pide ayuda para vivirla.",
            tips: [
                "Agradece por la verdad aprendida.",
                "Confiesa aquello que el pasaje haya mostrado.",
                "Pide fuerzas para ponerlo en práctica.",
                "Ora por alguien que también necesite esa enseñanza.",
            ],
            reminder:
                "El devocional termina cuando lo aprendido comienza a convertirse en una respuesta.",
        },
    ];
export default devotionalSteps;
