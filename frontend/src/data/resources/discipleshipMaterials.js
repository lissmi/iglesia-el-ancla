
// =====================================================
// MATERIALES DE DISCIPULADO
// =====================================================
//
// Este archivo contiene la información utilizada en:
//
// 1. La página principal de materiales.
// 2. Las tarjetas de cada material.
// 3. La página reutilizable de detalles.
// 4. Los filtros y el buscador.
//
// Para agregar un nuevo material, solo debes incorporar
// un nuevo objeto dentro del arreglo discipleshipMaterials.
// =====================================================

const discipleshipMaterials = [
    {
        id: "discipleship-material-1",

        slug: "primeros-pasos-en-la-fe",

        title: "Primeros pasos en la fe",

        category: "Fundamentos de la fe",

        level: "Inicial",

        lessons: 5,

        summary:
            "Una introducción sencilla para comprender qué significa seguir a Jesús y comenzar una vida cristiana con fundamentos firmes.",

        description: [
            "Comenzar una vida de fe puede despertar muchas preguntas. Este material presenta algunos de los fundamentos esenciales del cristianismo de una manera clara y cercana.",
            "A través de sus contenidos podrás comprender qué significa creer en Jesús, cómo comenzar una relación con Dios y cuáles son las prácticas que ayudan a crecer espiritualmente.",
        ],

        objectives: [
            "Comprender el significado de seguir a Jesús.",
            "Reconocer la salvación como un regalo de la gracia de Dios.",
            "Descubrir la importancia de la oración y la lectura bíblica.",
            "Comprender el valor de formar parte de una comunidad cristiana.",
            "Identificar pasos prácticos para continuar creciendo en la fe.",
        ],

        topics: [
            "La gracia y la salvación",
            "Una nueva vida en Cristo",
            "La oración",
            "La lectura de la Biblia",
            "La comunidad cristiana",
        ],

        keyVerse: {
            reference: "2 Corintios 5:17",
            text:
                "De modo que si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron; he aquí todas son hechas nuevas.",
        },

        content: [
            {
                id: "lesson-1",

                title: "La salvación es un regalo",

                paragraphs: [
                    "La vida cristiana comienza al reconocer nuestra necesidad de Dios y confiar en la obra de Jesucristo. La salvación no se obtiene por méritos personales ni por intentar demostrar que somos suficientemente buenos.",
                    "Dios ofrece perdón y una nueva vida por medio de su gracia. Creer en Jesús significa confiar en Él, recibir su perdón y permitir que transforme nuestra manera de vivir.",
                ],

                reflection:
                    "¿Qué significa para ti saber que la salvación es un regalo y no algo que debes ganar?",
            },

            {
                id: "lesson-2",

                title: "Una nueva identidad",

                paragraphs: [
                    "Seguir a Jesús no significa que todos nuestros problemas desaparezcan inmediatamente. Significa que comenzamos una nueva vida acompañados por Dios.",
                    "Nuestra identidad ya no depende solamente de los errores, opiniones o experiencias del pasado. En Cristo recibimos una nueva oportunidad para crecer, aprender y ser transformados.",
                ],

                reflection:
                    "¿Qué parte de tu vida necesitas comenzar a mirar desde la perspectiva de esta nueva identidad?",
            },

            {
                id: "lesson-3",

                title: "Aprender a hablar con Dios",

                paragraphs: [
                    "La oración es una conversación sincera con Dios. Podemos agradecer, pedir ayuda, reconocer nuestros errores e interceder por otras personas.",
                    "No necesitamos utilizar palabras complicadas. Dios conoce nuestro corazón y nos invita a acercarnos con confianza y honestidad.",
                ],

                reflection:
                    "¿Qué te gustaría expresar hoy delante de Dios?",
            },

            {
                id: "lesson-4",

                title: "Conocer a Dios por medio de la Biblia",

                paragraphs: [
                    "La Biblia nos permite conocer el carácter de Dios, comprender su obra y recibir orientación para nuestra vida.",
                    "El crecimiento espiritual requiere constancia. Es preferible comenzar leyendo una pequeña porción con atención que intentar leer demasiado sin comprender.",
                ],

                reflection:
                    "¿Qué horario podrías reservar durante la semana para comenzar a leer la Biblia?",
            },

            {
                id: "lesson-5",

                title: "Crecer junto a otras personas",

                paragraphs: [
                    "La vida cristiana no fue diseñada para vivirse en aislamiento. La iglesia es una comunidad donde podemos aprender, servir, recibir apoyo y acompañar a otras personas.",
                    "Relacionarnos con otros creyentes nos ayuda a perseverar y nos recuerda que todos continuamos aprendiendo.",
                ],

                reflection:
                    "¿De qué manera podrías comenzar a participar más activamente en una comunidad cristiana?",
            },
        ],

        reflectionQuestions: [
            "¿Cómo describirías actualmente tu relación con Dios?",
            "¿Qué aspecto de la vida cristiana deseas comprender mejor?",
            "¿Qué hábito espiritual podrías comenzar esta semana?",
            "¿Qué personas pueden acompañarte durante este proceso?",
        ],

        practicalActivity: {
            title: "Tu primer plan de crecimiento",

            description:
                "Elige tres acciones sencillas para practicar durante los próximos siete días.",

            steps: [
                "Dedica cinco minutos diarios a la oración.",
                "Lee un capítulo del Evangelio de Juan cada día.",
                "Anota una enseñanza o pregunta después de cada lectura.",
                "Conversa con una persona madura en la fe.",
            ],
        },
    },

    {
        id: "discipleship-material-2",

        slug: "como-estudiar-la-biblia",

        title: "Cómo estudiar la Biblia",

        category: "Biblia",

        level: "Inicial",

        lessons: 4,

        summary:
            "Una guía práctica para leer, comprender y aplicar las enseñanzas de la Biblia de manera responsable.",

        description: [
            "Estudiar la Biblia es más que leer rápidamente un capítulo. Requiere observar el texto, comprender su contexto y reflexionar sobre su aplicación.",
            "Este material presenta un método sencillo que puede utilizarse tanto de manera personal como en grupos pequeños.",
        ],

        objectives: [
            "Comprender la importancia del contexto bíblico.",
            "Aprender a observar cuidadosamente un pasaje.",
            "Identificar la enseñanza central del texto.",
            "Aplicar responsablemente lo aprendido.",
        ],

        topics: [
            "Observación",
            "Contexto",
            "Interpretación",
            "Aplicación",
        ],

        keyVerse: {
            reference: "Salmo 119:105",
            text:
                "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.",
        },

        content: [
            {
                id: "lesson-1",

                title: "Comenzar observando",

                paragraphs: [
                    "Antes de buscar una aplicación personal, debemos observar qué dice realmente el pasaje. Podemos fijarnos en las personas, acciones, lugares, palabras repetidas y relaciones entre las ideas.",
                    "Leer el texto más de una vez ayuda a descubrir detalles que pueden pasar inadvertidos durante una lectura rápida.",
                ],

                reflection:
                    "¿Qué palabras o ideas se repiten en el pasaje que estás estudiando?",
            },

            {
                id: "lesson-2",

                title: "Comprender el contexto",

                paragraphs: [
                    "Cada pasaje forma parte de un libro escrito en una época, cultura y situación determinadas. Conocer quién escribe, a quién se dirige y qué sucede alrededor del texto ayuda a evitar interpretaciones equivocadas.",
                    "También debemos considerar los versículos anteriores y posteriores, ya que una frase aislada puede perder su sentido original.",
                ],

                reflection:
                    "¿Qué información del contexto cambia o amplía tu comprensión del pasaje?",
            },

            {
                id: "lesson-3",

                title: "Identificar la enseñanza principal",

                paragraphs: [
                    "Después de observar y revisar el contexto, podemos resumir la idea principal con nuestras propias palabras.",
                    "Una buena interpretación respeta lo que el texto comunicaba originalmente y considera cómo esa verdad se relaciona con el resto de la enseñanza bíblica.",
                ],

                reflection:
                    "¿Cómo resumirías la enseñanza central del pasaje en una sola oración?",
            },

            {
                id: "lesson-4",

                title: "Aplicar con responsabilidad",

                paragraphs: [
                    "La aplicación responde a la pregunta: ¿cómo debe influir esta enseñanza en mi forma de pensar, actuar o relacionarme?",
                    "La aplicación debe surgir del significado del pasaje, no solamente de una impresión personal. Puede llevarnos a agradecer, cambiar una conducta, obedecer, confiar o servir.",
                ],

                reflection:
                    "¿Qué acción concreta puedes realizar a partir de lo aprendido?",
            },
        ],

        reflectionQuestions: [
            "¿Qué dificultades encuentras al leer la Biblia?",
            "¿Sueles considerar el contexto de los pasajes?",
            "¿Cómo puedes evitar aplicar un texto fuera de su significado?",
            "¿Qué libro de la Biblia te gustaría estudiar con mayor profundidad?",
        ],

        practicalActivity: {
            title: "Método de cuatro pasos",

            description:
                "Escoge un pasaje breve y desarrolla el siguiente ejercicio en un cuaderno.",

            steps: [
                "Escribe aquello que observas directamente en el texto.",
                "Investiga el contexto general del pasaje.",
                "Resume su enseñanza principal.",
                "Define una aplicación personal concreta.",
            ],
        },
    },

    {
        id: "discipleship-material-3",

        slug: "la-importancia-de-la-oracion",

        title: "La importancia de la oración",

        category: "Oración",

        level: "Inicial",

        lessons: 4,

        summary:
            "Un material para comprender la oración como una relación sincera, constante y confiada con Dios.",

        description: [
            "La oración no consiste únicamente en presentar peticiones. También es un espacio de comunión, gratitud, confesión y entrega.",
            "Este estudio ayuda a superar algunas ideas equivocadas acerca de la oración y propone hábitos sencillos para desarrollarla con constancia.",
        ],

        objectives: [
            "Comprender qué es la oración.",
            "Reconocer diferentes maneras de orar.",
            "Aprender del ejemplo de Jesús.",
            "Crear un hábito personal de oración.",
        ],

        topics: [
            "Comunión con Dios",
            "Gratitud",
            "Confesión",
            "Intercesión",
            "Perseverancia",
        ],

        keyVerse: {
            reference: "Jeremías 33:3",
            text:
                "Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.",
        },

        content: [
            {
                id: "lesson-1",

                title: "La oración es una relación",

                paragraphs: [
                    "Orar es acercarnos a Dios y relacionarnos con Él. Podemos hablarle sobre nuestras necesidades, pero también agradecer, guardar silencio y reconocer quién es Él.",
                    "La oración no necesita ser extensa para ser sincera. Lo importante es presentarnos con humildad y confianza.",
                ],

                reflection:
                    "¿Cómo describirías actualmente tus momentos de oración?",
            },

            {
                id: "lesson-2",

                title: "Jesús y la oración",

                paragraphs: [
                    "Los evangelios muestran que Jesús reservaba momentos para orar, incluso durante períodos de mucha actividad.",
                    "Su ejemplo nos enseña que la oración no debe ser solamente una reacción ante las dificultades, sino una práctica constante.",
                ],

                reflection:
                    "¿Qué puedes aprender del ejemplo de oración de Jesús?",
            },

            {
                id: "lesson-3",

                title: "Diferentes expresiones de oración",

                paragraphs: [
                    "Podemos orar para adorar a Dios, agradecer, confesar nuestros errores, presentar necesidades e interceder por otras personas.",
                    "Estas distintas expresiones ayudan a que nuestra vida de oración no se concentre solamente en aquello que deseamos recibir.",
                ],

                reflection:
                    "¿Qué aspecto de la oración necesitas desarrollar con mayor profundidad?",
            },

            {
                id: "lesson-4",

                title: "Perseverar aunque no veamos respuestas inmediatas",

                paragraphs: [
                    "No todas las respuestas llegan de la manera o en el momento que esperamos. Perseverar significa continuar confiando en el carácter de Dios.",
                    "La oración también transforma nuestro corazón, nos enseña paciencia y nos ayuda a reconocer que dependemos de Dios.",
                ],

                reflection:
                    "¿Hay alguna petición por la que necesitas continuar orando con paciencia?",
            },
        ],

        reflectionQuestions: [
            "¿Qué suele dificultar tu constancia en la oración?",
            "¿Qué diferencia existe entre orar sinceramente y repetir palabras?",
            "¿Cómo puedes incluir la gratitud en tus oraciones?",
            "¿Por quién podrías comenzar a interceder esta semana?",
        ],

        practicalActivity: {
            title: "Una semana de oración",

            description:
                "Organiza siete momentos breves de oración, cada uno con un énfasis diferente.",

            steps: [
                "Día 1: adoración.",
                "Día 2: gratitud.",
                "Día 3: confesión.",
                "Día 4: necesidades personales.",
                "Día 5: familia y amistades.",
                "Día 6: iglesia y comunidad.",
                "Día 7: silencio y reflexión.",
            ],
        },
    },

    {
        id: "discipleship-material-4",

        slug: "identidad-en-cristo",

        title: "Identidad en Cristo",

        category: "Fundamentos de la fe",

        level: "Intermedio",

        lessons: 4,

        summary:
            "Un estudio para reconocer que nuestro valor y propósito se fundamentan en la relación con Cristo.",

        description: [
            "Con frecuencia construimos nuestra identidad sobre logros, errores, relaciones o la opinión de otras personas. Sin embargo, estas bases pueden cambiar y dejarnos inseguros.",
            "Este material invita a comprender cómo la relación con Cristo transforma la manera en que nos vemos y vivimos.",
        ],

        objectives: [
            "Reconocer las bases inestables de la identidad personal.",
            "Comprender lo que significa ser una nueva creación.",
            "Identificar verdades bíblicas sobre el valor personal.",
            "Vivir con seguridad, humildad y propósito.",
        ],

        topics: [
            "Nueva creación",
            "Gracia",
            "Pertenencia",
            "Propósito",
        ],

        keyVerse: {
            reference: "Efesios 2:10",
            text:
                "Porque somos hechura suya, creados en Cristo Jesús para buenas obras.",
        },

        content: [
            {
                id: "lesson-1",

                title: "¿Dónde buscamos nuestro valor?",

                paragraphs: [
                    "Es posible relacionar nuestro valor con el rendimiento, la apariencia, la aceptación o los logros. Cuando estas cosas fallan, también puede debilitarse nuestra percepción personal.",
                    "La identidad en Cristo ofrece una base que no depende de circunstancias cambiantes.",
                ],

                reflection:
                    "¿Qué situaciones suelen influir más en la manera en que te valoras?",
            },

            {
                id: "lesson-2",

                title: "Aceptados por gracia",

                paragraphs: [
                    "Dios no nos recibe porque seamos perfectos. Nos acerca a Él por medio de su gracia y comienza una obra de transformación.",
                    "Esta aceptación no justifica permanecer en conductas dañinas; nos da seguridad para reconocerlas y crecer.",
                ],

                reflection:
                    "¿Cómo cambia tu manera de acercarte a Dios al comprender su gracia?",
            },

            {
                id: "lesson-3",

                title: "Libres de las etiquetas del pasado",

                paragraphs: [
                    "Los errores y experiencias pasadas forman parte de nuestra historia, pero no tienen que definir completamente nuestro futuro.",
                    "En Cristo podemos asumir responsabilidad, recibir perdón y avanzar hacia una vida renovada.",
                ],

                reflection:
                    "¿Qué etiqueta del pasado necesitas dejar de utilizar para definirte?",
            },

            {
                id: "lesson-4",

                title: "Una identidad con propósito",

                paragraphs: [
                    "Nuestra identidad también se expresa mediante una vida de amor, servicio y obediencia.",
                    "No vivimos para demostrar nuestro valor, sino como respuesta agradecida a la gracia que hemos recibido.",
                ],

                reflection:
                    "¿Qué acción concreta puede reflejar esta semana tu identidad en Cristo?",
            },
        ],

        reflectionQuestions: [
            "¿Qué cosas utilizas para medir tu valor?",
            "¿Qué verdad bíblica necesitas recordar con frecuencia?",
            "¿Cómo influye tu identidad en tus decisiones?",
            "¿De qué manera puedes ayudar a otra persona a reconocer su valor?",
        ],

        practicalActivity: {
            title: "Reemplazar etiquetas por verdades",

            description:
                "Escribe tres etiquetas negativas que hayas aceptado y reemplázalas por verdades fundamentadas en la Biblia.",

            steps: [
                "Identifica la etiqueta o pensamiento.",
                "Reconoce de dónde proviene.",
                "Busca una verdad bíblica que la confronte.",
                "Escribe una oración basada en esa verdad.",
            ],
        },
    },

    {
        id: "discipleship-material-5",

        slug: "el-fruto-del-espiritu",

        title: "El fruto del Espíritu",

        category: "Carácter cristiano",

        level: "Intermedio",

        lessons: 5,

        summary:
            "Un recorrido por las cualidades que el Espíritu Santo desarrolla en quienes permiten que Dios transforme su carácter.",

        description: [
            "El crecimiento cristiano no se limita a adquirir conocimiento. También debe reflejarse en nuestro carácter y en la manera en que tratamos a otras personas.",
            "Este estudio analiza el fruto del Espíritu y propone aplicaciones concretas para la vida cotidiana.",
        ],

        objectives: [
            "Comprender qué representa el fruto del Espíritu.",
            "Examinar áreas del carácter que necesitan crecimiento.",
            "Relacionar la madurez espiritual con la vida diaria.",
            "Practicar respuestas guiadas por el amor y el dominio propio.",
        ],

        topics: [
            "Amor",
            "Gozo y paz",
            "Paciencia y benignidad",
            "Fidelidad y mansedumbre",
            "Dominio propio",
        ],

        keyVerse: {
            reference: "Gálatas 5:22–23",
            text:
                "Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre, templanza.",
        },

        content: [
            {
                id: "lesson-1",

                title: "Un carácter transformado",

                paragraphs: [
                    "El fruto del Espíritu describe cualidades que Dios desarrolla progresivamente en la vida del creyente.",
                    "No se trata de aparentar perfección, sino de permitir que el Espíritu transforme nuestras actitudes y respuestas.",
                ],

                reflection:
                    "¿Qué cambio de carácter has podido reconocer en tu vida durante el último tiempo?",
            },

            {
                id: "lesson-2",

                title: "Amor, gozo y paz",

                paragraphs: [
                    "El amor busca el bienestar de otras personas. El gozo no depende exclusivamente de circunstancias agradables y la paz permite confiar en Dios aun en medio de la incertidumbre.",
                    "Estas cualidades se fortalecen cuando mantenemos nuestra relación con Dios y aprendemos a mirar las circunstancias desde la fe.",
                ],

                reflection:
                    "¿Cuál de estas tres cualidades necesitas cultivar con mayor intención?",
            },

            {
                id: "lesson-3",

                title: "Paciencia, benignidad y bondad",

                paragraphs: [
                    "La paciencia se demuestra especialmente cuando otras personas no responden como esperamos. La benignidad y la bondad nos impulsan a actuar con consideración.",
                    "Estas cualidades se vuelven visibles mediante decisiones pequeñas y cotidianas.",
                ],

                reflection:
                    "¿Con quién necesitas practicar una respuesta más paciente y bondadosa?",
            },

            {
                id: "lesson-4",

                title: "Fidelidad y mansedumbre",

                paragraphs: [
                    "La fidelidad se relaciona con ser confiables y perseverantes. La mansedumbre no es debilidad, sino fortaleza bajo control.",
                    "Una persona madura puede expresar convicciones firmes sin tratar a los demás con arrogancia o agresividad.",
                ],

                reflection:
                    "¿Cómo puedes unir firmeza y amabilidad en una conversación difícil?",
            },

            {
                id: "lesson-5",

                title: "Dominio propio",

                paragraphs: [
                    "El dominio propio nos ayuda a no ser gobernados por impulsos, emociones o deseos momentáneos.",
                    "Se desarrolla al reconocer nuestras debilidades, establecer límites y depender de la ayuda de Dios.",
                ],

                reflection:
                    "¿En qué área necesitas establecer un límite saludable?",
            },
        ],

        reflectionQuestions: [
            "¿Qué fruto es más evidente actualmente en tu vida?",
            "¿Cuál necesita mayor crecimiento?",
            "¿Cómo reaccionas bajo presión?",
            "¿Qué relación podría mejorar mediante un cambio en tu carácter?",
        ],

        practicalActivity: {
            title: "Cultivar una cualidad",

            description:
                "Escoge una característica del fruto del Espíritu y practícala de manera intencional durante siete días.",

            steps: [
                "Define la cualidad que deseas trabajar.",
                "Identifica una situación donde suele faltar.",
                "Escribe una respuesta alternativa.",
                "Ora diariamente por esa área.",
                "Evalúa lo aprendido al finalizar la semana.",
            ],
        },
    },

    {
        id: "discipleship-material-6",

        slug: "como-compartir-la-fe",

        title: "Cómo compartir la fe",

        category: "Servicio",

        level: "Intermedio",

        lessons: 4,

        summary:
            "Una orientación para comunicar la fe cristiana con claridad, respeto, sensibilidad y coherencia.",

        description: [
            "Compartir la fe no significa presionar a otras personas ni intentar ganar discusiones. Consiste en comunicar con humildad aquello que Dios ha hecho en nuestra vida.",
            "Este material enseña a escuchar, explicar el mensaje cristiano y responder con respeto.",
        ],

        objectives: [
            "Comprender la motivación correcta para compartir la fe.",
            "Aprender a escuchar antes de responder.",
            "Organizar un testimonio personal.",
            "Comunicar el evangelio con respeto y claridad.",
        ],

        topics: [
            "Testimonio personal",
            "Escucha",
            "Evangelio",
            "Respeto",
        ],

        keyVerse: {
            reference: "1 Pedro 3:15",
            text:
                "Estad siempre preparados para presentar defensa con mansedumbre y reverencia.",
        },

        content: [
            {
                id: "lesson-1",

                title: "Compartir desde el amor",

                paragraphs: [
                    "La motivación debe ser el amor hacia Dios y hacia las personas, no la necesidad de demostrar superioridad.",
                    "Nuestra actitud puede confirmar o contradecir las palabras que comunicamos.",
                ],

                reflection:
                    "¿Qué motivaciones reconoces cuando piensas en compartir tu fe?",
            },

            {
                id: "lesson-2",

                title: "Aprender a escuchar",

                paragraphs: [
                    "Cada persona tiene una historia, experiencias y preguntas diferentes. Escuchar con atención demuestra respeto y permite comprender mejor sus inquietudes.",
                    "No necesitamos tener una respuesta inmediata para todo. Podemos reconocer con honestidad cuando no sabemos algo.",
                ],

                reflection:
                    "¿Sueles escuchar para comprender o solamente para preparar una respuesta?",
            },

            {
                id: "lesson-3",

                title: "Preparar tu testimonio",

                paragraphs: [
                    "Un testimonio sencillo puede explicar cómo era tu vida, cómo comenzaste a acercarte a Cristo y qué cambios has experimentado.",
                    "Debe ser honesto y centrarse en la obra de Dios, evitando exageraciones o comparaciones.",
                ],

                reflection:
                    "¿Cómo resumirías tu experiencia de fe en tres minutos?",
            },

            {
                id: "lesson-4",

                title: "Comunicar con claridad y respeto",

                paragraphs: [
                    "El mensaje cristiano presenta el amor de Dios, la realidad del pecado, la obra de Jesús y la invitación a responder con fe.",
                    "Después de compartir, debemos respetar el proceso y las decisiones de la otra persona, continuando disponibles para acompañar.",
                ],

                reflection:
                    "¿Qué persona podría necesitar una conversación respetuosa sobre la fe?",
            },
        ],

        reflectionQuestions: [
            "¿Qué temores experimentas al compartir tu fe?",
            "¿Cómo puede tu conducta respaldar tu mensaje?",
            "¿Qué parte del evangelio te cuesta explicar?",
            "¿Cómo puedes mantener una conversación respetuosa ante el desacuerdo?",
        ],

        practicalActivity: {
            title: "Preparar tu testimonio personal",

            description:
                "Escribe un testimonio breve que puedas compartir de manera natural.",

            steps: [
                "Describe brevemente cómo era tu vida.",
                "Explica cómo comenzaste a acercarte a Jesús.",
                "Menciona qué cambios has experimentado.",
                "Evita palabras difíciles de comprender.",
                "Practica contándolo en menos de tres minutos.",
            ],
        },
    },

    {
        id: "discipleship-material-7",

        slug: "vida-en-comunidad",

        title: "Vida en comunidad",

        category: "Vida cristiana",

        level: "Inicial",

        lessons: 4,

        summary:
            "Un estudio sobre la importancia de crecer, servir y perseverar junto a una comunidad cristiana.",

        description: [
            "La iglesia no es solamente un lugar al que asistimos. Es una comunidad formada por personas que aprenden a amarse, apoyarse y servir juntas.",
            "Este material aborda la unidad, la convivencia y la responsabilidad de participar activamente.",
        ],

        objectives: [
            "Comprender el sentido bíblico de la comunidad.",
            "Valorar la diversidad dentro de la iglesia.",
            "Aprender a resolver diferencias con madurez.",
            "Descubrir maneras prácticas de participar.",
        ],

        topics: [
            "Comunidad",
            "Unidad",
            "Diversidad",
            "Servicio mutuo",
        ],

        keyVerse: {
            reference: "Hebreos 10:24–25",
            text:
                "Considerémonos unos a otros para estimularnos al amor y a las buenas obras; no dejando de congregarnos.",
        },

        content: [
            {
                id: "lesson-1",

                title: "No fuimos llamados a caminar solos",

                paragraphs: [
                    "Dios utiliza la comunidad para enseñarnos, corregirnos, consolarnos y ayudarnos a crecer.",
                    "Aislarse puede parecer más fácil, pero también nos priva del apoyo y la responsabilidad compartida.",
                ],

                reflection:
                    "¿Qué beneficios has recibido al relacionarte con otras personas creyentes?",
            },

            {
                id: "lesson-2",

                title: "Unidad sin uniformidad",

                paragraphs: [
                    "La unidad cristiana no significa que todas las personas tengan la misma personalidad, experiencia o función.",
                    "Las diferencias pueden enriquecer la comunidad cuando se viven con humildad y respeto.",
                ],

                reflection:
                    "¿Cómo reaccionas frente a personas que piensan o actúan de manera diferente?",
            },

            {
                id: "lesson-3",

                title: "Resolver conflictos con madurez",

                paragraphs: [
                    "En toda comunidad surgirán diferencias. La madurez se demuestra al conversar directamente, escuchar y buscar restauración.",
                    "Los rumores, la evasión y las acusaciones públicas suelen profundizar los conflictos.",
                ],

                reflection:
                    "¿Existe alguna conversación pendiente que debas abordar con respeto?",
            },

            {
                id: "lesson-4",

                title: "Participar y servir",

                paragraphs: [
                    "Cada creyente puede aportar mediante sus dones, tiempo, experiencia y disposición.",
                    "Servir no consiste en buscar reconocimiento, sino en contribuir al bienestar y la misión de la comunidad.",
                ],

                reflection:
                    "¿En qué área podrías comenzar a colaborar?",
            },
        ],

        reflectionQuestions: [
            "¿Qué significa para ti pertenecer a una iglesia?",
            "¿Qué actitudes fortalecen la unidad?",
            "¿Cómo respondes cuando surge un conflicto?",
            "¿Qué puedes aportar a tu comunidad?",
        ],

        practicalActivity: {
            title: "Dar un paso hacia la comunidad",

            description:
                "Selecciona una acción concreta para fortalecer tu participación durante esta semana.",

            steps: [
                "Conversa con una persona nueva.",
                "Pregunta por una necesidad en la que puedas colaborar.",
                "Anima a alguien que esté atravesando una dificultad.",
                "Participa en una actividad o grupo de la iglesia.",
            ],
        },
    },

    {
        id: "discipleship-material-8",

        slug: "descubriendo-tus-dones",

        title: "Descubriendo tus dones",

        category: "Servicio",

        level: "Intermedio",

        lessons: 4,

        summary:
            "Una guía para reconocer capacidades, experiencias y oportunidades que pueden ponerse al servicio de Dios y de otras personas.",

        description: [
            "Dios ha entregado diferentes capacidades a cada persona. Los dones no deben utilizarse para competir, sino para servir y fortalecer a la comunidad.",
            "Este material ayuda a observar habilidades, motivaciones y oportunidades de crecimiento.",
        ],

        objectives: [
            "Comprender el propósito de los dones.",
            "Reconocer habilidades y motivaciones personales.",
            "Diferenciar entre servicio y búsqueda de reconocimiento.",
            "Explorar oportunidades para participar.",
        ],

        topics: [
            "Dones espirituales",
            "Habilidades",
            "Servicio",
            "Trabajo en equipo",
        ],

        keyVerse: {
            reference: "1 Pedro 4:10",
            text:
                "Cada uno según el don que ha recibido, minístrelo a los otros, como buenos administradores de la multiforme gracia de Dios.",
        },

        content: [
            {
                id: "lesson-1",

                title: "Dones para servir",

                paragraphs: [
                    "Los dones tienen como propósito beneficiar a otras personas y contribuir a la misión de la iglesia.",
                    "No son una medida del valor espiritual ni una razón para sentir superioridad.",
                ],

                reflection:
                    "¿Cómo cambia tu perspectiva saber que los dones existen para servir?",
            },

            {
                id: "lesson-2",

                title: "Observar capacidades y motivaciones",

                paragraphs: [
                    "Podemos comenzar observando qué tareas realizamos con facilidad, qué necesidades nos conmueven y en qué áreas otras personas reconocen nuestro aporte.",
                    "También es importante considerar nuestras experiencias y aprendizajes.",
                ],

                reflection:
                    "¿Qué capacidades suelen reconocer otras personas en ti?",
            },

            {
                id: "lesson-3",

                title: "Aprender mediante la práctica",

                paragraphs: [
                    "No siempre descubrimos nuestros dones mediante un cuestionario. Muchas veces los reconocemos al comenzar a servir.",
                    "Probar diferentes áreas con humildad permite identificar fortalezas y aspectos que necesitan formación.",
                ],

                reflection:
                    "¿Qué nueva área de servicio podrías probar durante un tiempo?",
            },

            {
                id: "lesson-4",

                title: "Servir en equipo",

                paragraphs: [
                    "Ninguna persona posee todas las capacidades. El trabajo en equipo permite combinar diferentes dones.",
                    "La madurez implica valorar el aporte ajeno, aceptar orientación y cumplir responsablemente las tareas asumidas.",
                ],

                reflection:
                    "¿Qué necesitas mejorar para trabajar mejor con otras personas?",
            },
        ],

        reflectionQuestions: [
            "¿Qué necesidades llaman especialmente tu atención?",
            "¿Qué tareas disfrutas realizar?",
            "¿Qué habilidades necesitas desarrollar?",
            "¿Cómo puedes servir sin buscar reconocimiento?",
        ],

        practicalActivity: {
            title: "Mapa personal de servicio",

            description:
                "Crea una lista que relacione tus capacidades con necesidades concretas de la comunidad.",

            steps: [
                "Anota cinco habilidades o experiencias.",
                "Pregunta a dos personas qué fortalezas reconocen en ti.",
                "Identifica tres necesidades de tu comunidad.",
                "Relaciona una capacidad con una necesidad.",
                "Consulta cómo comenzar a colaborar.",
            ],
        },
    },

    {
        id: "discipleship-material-9",

        slug: "el-perdon-cristiano",

        title: "El perdón cristiano",

        category: "Carácter cristiano",

        level: "Intermedio",

        lessons: 4,

        summary:
            "Un material para comprender el perdón, establecer límites saludables y avanzar hacia la restauración cuando sea posible.",

        description: [
            "Perdonar puede ser uno de los procesos más difíciles de la vida cristiana. No significa negar el daño, justificar lo ocurrido ni exponerse nuevamente a situaciones inseguras.",
            "Este estudio presenta el perdón como un proceso que entrega la justicia a Dios y busca libertad frente al resentimiento.",
        ],

        objectives: [
            "Diferenciar el perdón de la negación del daño.",
            "Comprender que perdonar puede ser un proceso.",
            "Reconocer la importancia de los límites.",
            "Buscar restauración de manera sabia y segura.",
        ],

        topics: [
            "Gracia",
            "Heridas",
            "Límites",
            "Restauración",
        ],

        keyVerse: {
            reference: "Colosenses 3:13",
            text:
                "Soportándoos unos a otros, y perdonándoos unos a otros; de la manera que Cristo os perdonó, así también hacedlo vosotros.",
        },

        content: [
            {
                id: "lesson-1",

                title: "Reconocer el daño",

                paragraphs: [
                    "Perdonar no requiere fingir que nada ocurrió. Es importante reconocer con honestidad el daño y sus consecuencias.",
                    "En situaciones graves también puede ser necesario buscar apoyo pastoral, profesional o legal.",
                ],

                reflection:
                    "¿Has confundido alguna vez el perdón con ignorar lo sucedido?",
            },

            {
                id: "lesson-2",

                title: "Perdonar no siempre significa reconciliarse",

                paragraphs: [
                    "El perdón puede ser una decisión personal, pero la reconciliación requiere arrepentimiento, responsabilidad y cambios reales de ambas partes.",
                    "También pueden existir relaciones donde sea necesario mantener distancia y límites firmes.",
                ],

                reflection:
                    "¿Qué diferencia observas entre perdonar y recuperar inmediatamente una relación?",
            },

            {
                id: "lesson-3",

                title: "Un proceso sostenido por la gracia",

                paragraphs: [
                    "Algunas heridas no desaparecen mediante una sola oración. Puede ser necesario reafirmar la decisión de perdonar cuando resurgen recuerdos y emociones.",
                    "La gracia de Dios nos sostiene mientras avanzamos sin negar el dolor.",
                ],

                reflection:
                    "¿Qué parte de este proceso necesitas presentar delante de Dios?",
            },

            {
                id: "lesson-4",

                title: "Avanzar con sabiduría",

                paragraphs: [
                    "Perdonar libera nuestro corazón de vivir controlado por el resentimiento, pero no elimina la responsabilidad de quien causó el daño.",
                    "Podemos buscar paz, establecer límites y permitir que Dios continúe sanando nuestra historia.",
                ],

                reflection:
                    "¿Qué límite saludable podría ayudarte a continuar avanzando?",
            },
        ],

        reflectionQuestions: [
            "¿Qué ideas equivocadas has tenido acerca del perdón?",
            "¿Qué diferencia existe entre perdón, confianza y reconciliación?",
            "¿Necesitas apoyo para procesar una herida?",
            "¿Existe alguien a quien debas pedir perdón?",
        ],

        practicalActivity: {
            title: "Una oración de entrega",

            description:
                "Escribe una oración privada donde reconozcas el daño y entregues a Dios tu deseo de justicia y restauración.",

            steps: [
                "Describe con honestidad lo que ocurrió.",
                "Reconoce cómo te ha afectado.",
                "Expresa tu decisión de no alimentar el resentimiento.",
                "Pide sabiduría para establecer límites.",
                "Busca acompañamiento cuando sea necesario.",
            ],
        },
    },

    {
        id: "discipleship-material-10",

        slug: "como-enfrentar-las-pruebas",

        title: "Cómo enfrentar las pruebas",

        category: "Vida cristiana",

        level: "Intermedio",

        lessons: 4,

        summary:
            "Un estudio para atravesar períodos difíciles con honestidad, esperanza, apoyo comunitario y confianza en Dios.",

        description: [
            "La fe no evita todas las dificultades. Los creyentes también atraviesan pérdidas, incertidumbre, enfermedad, conflictos y temporadas de cansancio.",
            "Este material no ofrece respuestas simplistas, sino principios para perseverar y buscar apoyo durante las pruebas.",
        ],

        objectives: [
            "Reconocer que las pruebas forman parte de la vida.",
            "Aprender a expresar el dolor delante de Dios.",
            "Valorar el acompañamiento de la comunidad.",
            "Desarrollar perseverancia y esperanza.",
        ],

        topics: [
            "Sufrimiento",
            "Lamento",
            "Perseverancia",
            "Esperanza",
            "Comunidad",
        ],

        keyVerse: {
            reference: "Salmo 46:1",
            text:
                "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.",
        },

        content: [
            {
                id: "lesson-1",

                title: "La dificultad no significa ausencia de Dios",

                paragraphs: [
                    "En tiempos difíciles podemos sentir que Dios está distante. Sin embargo, la Biblia muestra a personas fieles que atravesaron temporadas de dolor y preguntas.",
                    "La presencia de dificultades no demuestra necesariamente falta de fe.",
                ],

                reflection:
                    "¿Qué pensamientos sobre Dios aparecen cuando atraviesas una dificultad?",
            },

            {
                id: "lesson-2",

                title: "Aprender a lamentar",

                paragraphs: [
                    "El lamento bíblico permite expresar tristeza, temor y confusión delante de Dios sin abandonar la confianza.",
                    "No necesitamos ocultar nuestras emociones para parecer espiritualmente fuertes.",
                ],

                reflection:
                    "¿Qué emoción necesitas expresar con mayor honestidad?",
            },

            {
                id: "lesson-3",

                title: "Recibir ayuda",

                paragraphs: [
                    "Durante las pruebas puede ser difícil pedir ayuda, pero Dios muchas veces utiliza a otras personas para sostenernos.",
                    "Recibir acompañamiento no es una señal de debilidad. En algunas situaciones también será necesario buscar ayuda profesional.",
                ],

                reflection:
                    "¿Qué persona segura podría acompañarte durante este período?",
            },

            {
                id: "lesson-4",

                title: "Esperanza para avanzar paso a paso",

                paragraphs: [
                    "La esperanza cristiana no niega el dolor. Nos recuerda que las circunstancias presentes no tienen la última palabra.",
                    "En algunos momentos, perseverar significará concentrarse solamente en el siguiente paso posible.",
                ],

                reflection:
                    "¿Cuál es el siguiente paso pequeño y responsable que puedes dar?",
            },
        ],

        reflectionQuestions: [
            "¿Qué dificultad estás enfrentando actualmente?",
            "¿Qué te cuesta expresar delante de Dios?",
            "¿Qué ayuda práctica necesitas?",
            "¿Qué verdad bíblica puede sostenerte durante este tiempo?",
        ],

        practicalActivity: {
            title: "Plan de apoyo y perseverancia",

            description:
                "Prepara un plan sencillo para no atravesar esta dificultad en aislamiento.",

            steps: [
                "Escribe la necesidad principal que enfrentas.",
                "Identifica a dos personas de confianza.",
                "Define una acción práctica para esta semana.",
                "Selecciona un versículo para recordar.",
                "Reserva un momento para descansar y orar.",
            ],
        },
    },
];

// =====================================================
// EXPORTACIÓN
// =====================================================

export default discipleshipMaterials;
