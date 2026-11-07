// Estudios bíblicos iniciales de Iglesia El Ancla.
const bibleStudies = [
        {
            // Identificador temporal.
            id: 1,

            // Categoría del estudio.
            category: "Estudio bíblico",

            // Título del estudio.
            title: "Cómo comenzar a estudiar la Biblia",

            // Descripción breve.
            description:
                "Una introducción sencilla para aprender a leer, observar y comprender un pasaje bíblico.",

            // Propósito del estudio.
            purpose:
                "Ayudarte a desarrollar una forma ordenada y constante de acercarte a la Palabra de Dios.",

            // Nivel recomendado.
            level: "Inicial",

            // Pasaje principal.
            passage: "2 Timoteo 3:16-17",

            // Texto introductorio del estudio.
            introduction:
                "La Biblia es la Palabra de Dios y constituye la base de nuestra fe. Estudiarla no significa solamente leer rápidamente un capítulo, sino observar con atención lo que el texto dice, comprender su enseñanza y reflexionar sobre cómo aplicarla.",

            // Preguntas de reflexión.
            questions: [
                "¿Qué enseña este pasaje acerca de Dios?",
                "¿Qué verdad importante aparece en el texto?",
                "¿Existe una instrucción, promesa o advertencia?",
                "¿Cómo puedo aplicar esta enseñanza durante la semana?",
            ],

            // Aplicación final.
            application:
                "Escoge un pasaje breve, léelo más de una vez y escribe con tus propias palabras qué aprendiste. Termina orando para pedirle a Dios que te ayude a vivir de acuerdo con Su Palabra.",

            // Indicamos si aparecerá como estudio destacado.
            featured: true,
        },
        {
            id: 2,
            category: "Oración",
            title: "Aprendiendo a orar",

            description:
                "Un estudio para comprender qué es la oración y cómo podemos desarrollar una relación más cercana con Dios.",

            purpose:
                "Reconocer la oración como una conversación sincera con Dios basada en la confianza y Su Palabra.",

            level: "Inicial",

            passage: "Mateo 6:5-13",

            introduction:
                "Jesús enseñó a sus discípulos a orar con sinceridad, evitando las apariencias y confiando en que el Padre conoce nuestras necesidades. La oración incluye adoración, gratitud, confesión y petición.",

            questions: [
                "¿Qué enseña Jesús sobre la actitud al orar?",
                "¿Qué elementos aparecen en la oración enseñada por Jesús?",
                "¿Qué preocupaciones necesitas presentar delante de Dios?",
                "¿Cómo puedes incorporar la oración a tu rutina diaria?",
            ],

            application:
                "Dedica algunos minutos a agradecer, reconocer tus necesidades y presentar a otras personas delante de Dios.",

            featured: true,
        },
        {
            id: 3,
            category: "Identidad",
            title: "Nuestra identidad en Cristo",

            description:
                "Una reflexión sobre la nueva identidad que recibe toda persona que ha puesto su fe en Jesucristo.",

            purpose:
                "Comprender que nuestra identidad principal no depende de los logros, errores o circunstancias, sino de nuestra relación con Cristo.",

            level: "Intermedio",

            passage: "2 Corintios 5:17",

            introduction:
                "La fe en Cristo produce una transformación profunda. El creyente recibe una nueva vida y aprende a mirar su historia, sus decisiones y su futuro desde la gracia de Dios.",

            questions: [
                "¿Qué significa ser una nueva creación?",
                "¿Qué aspectos de la antigua vida deben quedar atrás?",
                "¿Cómo cambia nuestra manera de vernos a nosotros mismos?",
                "¿Qué verdad de este pasaje necesitas recordar?",
            ],

            application:
                "Escribe tres verdades bíblicas acerca de tu identidad en Cristo y revísalas durante la semana.",

            featured: false,
        },
        {
            id: 4,
            category: "Crecimiento espiritual",
            title: "El fruto del Espíritu",

            description:
                "Un estudio para conocer las características que Dios desea desarrollar en la vida de cada creyente.",

            purpose:
                "Reflexionar sobre la obra del Espíritu Santo y reconocer áreas en las que necesitamos seguir creciendo.",

            level: "Intermedio",

            passage: "Gálatas 5:22-23",

            introduction:
                "El fruto del Espíritu describe el carácter que comienza a manifestarse en una vida guiada por Dios. No se trata solamente de esfuerzo humano, sino de permanecer cerca de Cristo y permitir que Él transforme nuestras actitudes.",

            questions: [
                "¿Qué características conforman el fruto del Espíritu?",
                "¿Cuál de estas características ves desarrollándose en tu vida?",
                "¿En cuál necesitas crecer especialmente?",
                "¿Cómo puede reflejarse este fruto en tus relaciones?",
            ],

            application:
                "Escoge una característica del fruto del Espíritu y busca una forma concreta de practicarla durante esta semana.",

            featured: false,
        },
        {
            id: 5,
            category: "Vida cristiana",
            title: "Vivir con esperanza",

            description:
                "Un estudio sobre la esperanza firme que encontramos en Jesucristo en medio de las dificultades.",

            purpose:
                "Recordar que la esperanza cristiana está fundamentada en Dios y no depende únicamente de nuestras circunstancias.",

            level: "Todos los niveles",

            passage: "Hebreos 6:19",

            introduction:
                "La esperanza bíblica no es solamente un deseo de que las cosas mejoren. Es una confianza firme en el carácter, las promesas y la fidelidad de Dios.",

            questions: [
                "¿Por qué la esperanza es comparada con un ancla?",
                "¿Qué situaciones pueden debilitar nuestra esperanza?",
                "¿En qué promesa de Dios puedes descansar?",
                "¿Cómo puedes transmitir esperanza a otra persona?",
            ],

            application:
                "Identifica una preocupación que estés enfrentando y entrégala a Dios en oración, recordando una promesa bíblica relacionada.",

            featured: false,
        },
    ];
export default bibleStudies;
