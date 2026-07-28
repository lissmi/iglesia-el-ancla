// Archivo de datos para las guías de oración.
// Cada objeto representa una guía que luego podrá mostrarse
// tanto en el listado principal como en su página individual.

const prayerGuides = [
    {
        id: "prayer-guide-1",
        slug: "comenzar-el-dia",
        title: "Oración para comenzar el día",
        category: "Vida personal",
        duration: "5 minutos",

        summary:
            "Una guía breve para entregar la nueva jornada a Dios, agradecer por sus misericordias y pedir dirección para cada decisión.",

        description: [
            "Comenzar el día en oración nos ayuda a recordar que no caminamos solos. Antes de enfrentar las responsabilidades, preocupaciones y decisiones de la jornada, podemos detenernos y reconocer la presencia de Dios.",
            "Esta guía propone un momento sencillo de gratitud, entrega y confianza para poner el día en las manos del Señor.",
        ],

        keyVerse: {
            reference: "Salmo 5:3",
            text:
                "Oh Jehová, de mañana oirás mi voz; de mañana me presentaré delante de ti, y esperaré.",
        },

        prayerPoints: [
            "Agradece a Dios por un nuevo día.",
            "Entrega tus planes y responsabilidades.",
            "Pide sabiduría para tomar decisiones.",
            "Ora por las personas con quienes compartirás.",
            "Pide protección y dominio propio.",
        ],

        samplePrayer:
            "Señor, gracias por regalarme un nuevo día. Pongo delante de ti mis planes, responsabilidades y decisiones. Guía mis pensamientos, mis palabras y mis acciones. Ayúdame a vivir con amor, paciencia y sabiduría. Que todo lo que haga hoy pueda honrarte. Amén.",
    },

    {
        id: "prayer-guide-2",
        slug: "antes-de-dormir",
        title: "Oración antes de dormir",
        category: "Vida personal",
        duration: "5 minutos",

        summary:
            "Un momento para agradecer por el día vivido, entregar las preocupaciones y descansar confiando en el cuidado de Dios.",

        description: [
            "Al finalizar el día, la oración puede ayudarnos a reconocer la fidelidad de Dios, examinar nuestro corazón y descansar de las preocupaciones acumuladas.",
            "Esta guía invita a agradecer, pedir perdón cuando sea necesario y confiar en que Dios continúa obrando aun mientras descansamos.",
        ],

        keyVerse: {
            reference: "Salmo 4:8",
            text:
                "En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me haces vivir confiado.",
        },

        prayerPoints: [
            "Agradece por las bendiciones del día.",
            "Reconoce las situaciones que te preocuparon.",
            "Pide perdón por tus errores.",
            "Entrega a Dios aquello que no puedes controlar.",
            "Pide descanso y protección durante la noche.",
        ],

        samplePrayer:
            "Padre, gracias por acompañarme durante este día. Perdona mis errores y ayúdame a aprender de ellos. Entrego en tus manos mis preocupaciones y aquello que no pude resolver. Dame un descanso tranquilo y renueva mis fuerzas para mañana. Amén.",
    },

    {
        id: "prayer-guide-3",
        slug: "por-la-familia",
        title: "Oración por la familia",
        category: "Familia",
        duration: "7 minutos",

        summary:
            "Una guía para orar por la unidad, la protección, la salud y el crecimiento espiritual de cada integrante de la familia.",

        description: [
            "La familia atraviesa diferentes etapas, desafíos y necesidades. Orar por nuestros seres queridos es una manera de colocarlos bajo el cuidado de Dios y expresar amor por ellos.",
            "Esta guía ayuda a presentar delante del Señor las relaciones familiares, las preocupaciones del hogar y el deseo de crecer juntos en amor y fe.",
        ],

        keyVerse: {
            reference: "Josué 24:15",
            text:
                "Pero yo y mi casa serviremos a Jehová.",
        },

        prayerPoints: [
            "Ora por la unidad y el respeto en el hogar.",
            "Pide protección para cada integrante.",
            "Presenta las necesidades de salud y trabajo.",
            "Ora por la restauración de relaciones difíciles.",
            "Pide que la familia crezca en la fe.",
        ],

        samplePrayer:
            "Señor, pongo a mi familia delante de ti. Cuida a cada integrante, fortalece nuestros vínculos y ayúdanos a tratarnos con amor, respeto y paciencia. Trae restauración donde existan heridas y acompáñanos en cada necesidad. Que nuestro hogar pueda reflejar tu paz. Amén.",
    },

    {
        id: "prayer-guide-4",
        slug: "en-momentos-de-ansiedad",
        title: "Oración en momentos de ansiedad",
        category: "Momentos difíciles",
        duration: "8 minutos",

        summary:
            "Una guía para expresar las preocupaciones delante de Dios y encontrar calma, consuelo y confianza en su presencia.",

        description: [
            "En momentos de ansiedad puede ser difícil ordenar los pensamientos o encontrar palabras para orar. Dios no exige una oración perfecta; podemos acercarnos a Él con honestidad y expresar lo que sentimos.",
            "Esta guía ofrece un espacio para respirar, reconocer las preocupaciones y recordar que la presencia de Dios permanece incluso en medio de la incertidumbre.",
        ],

        keyVerse: {
            reference: "Filipenses 4:6–7",
            text:
                "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego.",
        },

        prayerPoints: [
            "Cuéntale a Dios qué está provocando tu ansiedad.",
            "Entrega una preocupación a la vez.",
            "Pide paz para tus pensamientos.",
            "Recuerda momentos en que Dios te sostuvo.",
            "Ora por sabiduría para buscar ayuda cuando sea necesario.",
        ],

        samplePrayer:
            "Dios, tú conoces mis pensamientos y sabes cuánto me cuesta sentir tranquilidad en este momento. Te entrego mis temores y preocupaciones. Ayúdame a respirar, a descansar en tu presencia y a recordar que no estoy sola. Dame paz y sabiduría para avanzar paso a paso. Amén.",
    },

    {
        id: "prayer-guide-5",
        slug: "por-una-persona-enferma",
        title: "Oración por una persona enferma",
        category: "Momentos difíciles",
        duration: "7 minutos",

        summary:
            "Una orientación para pedir consuelo, fortaleza, atención adecuada y acompañamiento para alguien que enfrenta una enfermedad.",

        description: [
            "Cuando una persona querida atraviesa una enfermedad, podemos sentir preocupación e impotencia. La oración nos permite presentar su situación delante de Dios y pedir fortaleza para ella y quienes la acompañan.",
            "Esta guía propone orar por sanidad, consuelo, atención médica oportuna y paz para toda la familia.",
        ],

        keyVerse: {
            reference: "Salmo 41:3",
            text:
                "Jehová lo sustentará sobre el lecho del dolor.",
        },

        prayerPoints: [
            "Menciona a la persona por su nombre.",
            "Pide alivio para su dolor y sufrimiento.",
            "Ora por los médicos y tratamientos.",
            "Pide fortaleza emocional y espiritual.",
            "Ora por quienes están cuidando y acompañando.",
        ],

        samplePrayer:
            "Señor, hoy te presento la vida de esta persona que está enferma. Tú conoces su cuerpo, sus temores y sus necesidades. Dale fortaleza, consuelo y la atención adecuada. Guía a quienes participan en su cuidado y sostén también a su familia. Amén.",
    },

    {
        id: "prayer-guide-6",
        slug: "para-tomar-decisiones",
        title: "Oración para tomar decisiones",
        category: "Fe y crecimiento",
        duration: "7 minutos",

        summary:
            "Una guía para buscar sabiduría, reconocer las motivaciones personales y confiar en la dirección de Dios.",

        description: [
            "Algunas decisiones pueden producir temor, confusión o inseguridad. La oración no siempre entrega una respuesta inmediata, pero nos ayuda a ordenar las prioridades y someter nuestros deseos a la voluntad de Dios.",
            "Esta guía invita a pedir sabiduría, evaluar las alternativas con responsabilidad y avanzar con paciencia.",
        ],

        keyVerse: {
            reference: "Santiago 1:5",
            text:
                "Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios.",
        },

        prayerPoints: [
            "Explica delante de Dios la decisión que debes tomar.",
            "Reconoce tus deseos y temores.",
            "Pide sabiduría y discernimiento.",
            "Ora por consejo de personas responsables.",
            "Pide paciencia para no actuar apresuradamente.",
        ],

        samplePrayer:
            "Señor, necesito sabiduría para tomar esta decisión. Ayúdame a reconocer mis motivaciones y a considerar cada alternativa con responsabilidad. Muéstrame aquello que sea correcto y dame paciencia para esperar cuando todavía no tenga claridad. Amén.",
    },

    {
        id: "prayer-guide-7",
        slug: "de-agradecimiento",
        title: "Oración de agradecimiento",
        category: "Agradecimiento",
        duration: "5 minutos",

        summary:
            "Una guía para reconocer la bondad de Dios y cultivar un corazón agradecido aun en las cosas sencillas.",

        description: [
            "La gratitud nos ayuda a detenernos y reconocer las distintas maneras en que Dios ha estado presente en nuestra vida. No se limita a los grandes acontecimientos; también puede surgir de las bendiciones cotidianas.",
            "Esta guía propone recordar personas, experiencias y provisiones por las cuales podemos dar gracias.",
        ],

        keyVerse: {
            reference: "1 Tesalonicenses 5:18",
            text:
                "Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.",
        },

        prayerPoints: [
            "Agradece por la vida y el nuevo día.",
            "Menciona personas que han sido de bendición.",
            "Reconoce una provisión reciente.",
            "Da gracias por una enseñanza recibida.",
            "Agradece por la presencia de Dios en tiempos difíciles.",
        ],

        samplePrayer:
            "Padre, gracias por tu bondad y por las bendiciones que muchas veces paso por alto. Gracias por las personas que has puesto en mi camino, por tu provisión y por cada oportunidad de aprender. Ayúdame a vivir con un corazón agradecido. Amén.",
    },

    {
        id: "prayer-guide-8",
        slug: "para-pedir-perdon",
        title: "Oración para pedir perdón",
        category: "Fe y crecimiento",
        duration: "6 minutos",

        summary:
            "Una guía para reconocer los errores con sinceridad, recibir el perdón de Dios y buscar restauración.",

        description: [
            "Reconocer nuestros errores puede ser difícil, pero la oración nos ofrece un espacio seguro para acercarnos a Dios con sinceridad. Su gracia nos permite confesar, aprender y comenzar nuevamente.",
            "Esta guía también invita a considerar si debemos pedir perdón a otra persona o reparar algún daño causado.",
        ],

        keyVerse: {
            reference: "1 Juan 1:9",
            text:
                "Si confesamos nuestros pecados, él es fiel y justo para perdonar nuestros pecados.",
        },

        prayerPoints: [
            "Reconoce con sinceridad aquello que hiciste mal.",
            "Pide perdón sin justificar tus acciones.",
            "Recibe la gracia y el perdón de Dios.",
            "Pide fuerzas para cambiar.",
            "Considera cómo reparar el daño causado.",
        ],

        samplePrayer:
            "Señor, reconozco que me equivoqué y no quiero ocultarlo delante de ti. Perdóname y ayúdame a cambiar aquello que necesita ser transformado. Dame humildad para pedir perdón y sabiduría para reparar el daño que haya causado. Amén.",
    },

    {
        id: "prayer-guide-9",
        slug: "por-la-iglesia",
        title: "Oración por la iglesia",
        category: "Iglesia y comunidad",
        duration: "8 minutos",

        summary:
            "Una orientación para orar por los líderes, ministerios, familias, necesidades y misión de la comunidad cristiana.",

        description: [
            "La iglesia está formada por personas con diferentes historias, dones y necesidades. Orar por la comunidad fortalece la unidad y nos recuerda que todos participamos en la misión de servir y compartir el evangelio.",
            "Esta guía propone interceder por los líderes, ministerios, familias y proyectos de la congregación.",
        ],

        keyVerse: {
            reference: "Efesios 4:3",
            text:
                "Solícitos en guardar la unidad del Espíritu en el vínculo de la paz.",
        },

        prayerPoints: [
            "Ora por los pastores y líderes.",
            "Pide unidad entre los miembros.",
            "Presenta los ministerios y actividades.",
            "Ora por las familias de la congregación.",
            "Pide oportunidades para servir a la comunidad.",
        ],

        samplePrayer:
            "Señor, gracias por nuestra iglesia y por cada persona que forma parte de ella. Fortalece a sus líderes, trae unidad y permite que cada ministerio sirva con amor y sabiduría. Ayúdanos a ser una comunidad que refleje a Cristo y acompañe a quienes lo necesitan. Amén.",
    },

    {
        id: "prayer-guide-10",
        slug: "en-tiempos-de-dificultad",
        title: "Oración en tiempos de dificultad",
        category: "Momentos difíciles",
        duration: "8 minutos",

        summary:
            "Una guía para buscar fortaleza, esperanza y perseverancia cuando atravesamos circunstancias dolorosas o inciertas.",

        description: [
            "Las dificultades pueden hacernos sentir cansancio, temor o desorientación. En esos momentos podemos acercarnos a Dios tal como estamos, incluso cuando no comprendemos lo que sucede.",
            "Esta guía ayuda a expresar el dolor, pedir fortaleza para continuar y recordar que la esperanza no depende únicamente de las circunstancias.",
        ],

        keyVerse: {
            reference: "Salmo 46:1",
            text:
                "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.",
        },

        prayerPoints: [
            "Expresa con honestidad lo que estás viviendo.",
            "Pide fortaleza para afrontar el día.",
            "Ora por las necesidades más urgentes.",
            "Pide apoyo y compañía de otras personas.",
            "Recuerda las promesas y la fidelidad de Dios.",
        ],

        samplePrayer:
            "Dios, este momento es difícil y necesito tu fortaleza. Tú conoces mi dolor, mis preguntas y mis temores. Ayúdame a avanzar un día a la vez, a recibir ayuda y a mantener la esperanza. Recuérdame que tu presencia permanece conmigo. Amén.",
    },
];

// Exportamos las guías para utilizarlas en las páginas de Recursos.
export default prayerGuides;