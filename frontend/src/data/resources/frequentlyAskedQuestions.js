// =====================================================
// PREGUNTAS FRECUENTES
// =====================================================
//
// Este archivo contiene las preguntas y respuestas
// utilizadas en la página de Preguntas frecuentes.
//
// Cada pregunta puede incluir:
//
// - Uno o varios párrafos de respuesta.
// - Información destacada opcional.
// - Enlaces internos opcionales.
//
// Para agregar una nueva pregunta, solo debes incorporar
// un nuevo objeto dentro del arreglo.
// =====================================================

const frequentlyAskedQuestions = [
    {
        id: "faq-1",

        question:
            "¿Cuáles son los horarios de las reuniones?",

        category: "Horarios y reuniones",

        answer: [
            "Cada domingo comenzamos nuestra jornada reuniéndonos como comunidad en El Ancla Comunidad Cristiana.",
            "La reunión de oración dominical comienza a las 09:30 hrs. Es un momento para orar juntos y presentar nuestras necesidades delante de Dios.",
            "A las 10:00 hrs compartimos un desayuno comunitario, donde podemos conversar y fortalecer nuestros vínculos como hermanos antes del culto general.",
            "El culto general comienza a las 11:00 hrs. Durante esta reunión adoramos a Dios, aprendemos de Su Palabra y compartimos juntos como comunidad.",
        ],

        highlightedInfo:
            "Horarios principales de cada domingo: oración a las 09:30 hrs, desayuno comunitario a las 10:00 hrs y culto general a las 11:00 hrs. Nos reunimos de manera presencial en Artillería 199, Playa Ancha.",

        links: [
            {
                label: "Ver actividades y eventos",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-2",

        question:
            "¿Dónde se encuentra la iglesia?",

        category: "Horarios y reuniones",

        answer: [
            "La iglesia se encuentra en Playa Ancha, en la ciudad de Valparaíso.",
            "Puedes visitarnos en Artillería 199, Playa Ancha, Valparaíso, Chile.",
            "En la sección de Contacto también podrás revisar la ubicación, los medios de comunicación y cualquier información adicional para planificar tu visita.",
        ],

        highlightedInfo:
            "Dirección: Artillería 199, Playa Ancha, Valparaíso, Chile. Si tienes dificultades para encontrar el lugar, puedes comunicarte con la iglesia antes de asistir.",

        links: [
            {
                label: "Ver ubicación y contacto",
                path: "/contacto",
            },
        ],
    },

    {
        id: "faq-3",

        question:
            "¿Qué debo esperar en mi primera visita?",

        category: "Primera visita",

        answer: [
            "Puedes asistir con tranquilidad. No necesitas conocer previamente el desarrollo de la reunión ni tener experiencia participando en una iglesia.",
            "Durante tu visita encontrarás un espacio de adoración, enseñanza bíblica, oración y convivencia con otras personas de la comunidad.",
            "Nuestro deseo es que puedas sentirte recibido, respetado y acompañado durante tu experiencia.",
        ],

        highlightedInfo:
            "Puedes participar libremente y observar aquello que todavía no conozcas. Nadie debería presionarte a realizar algo con lo que no te sientas cómodo.",

        links: [],
    },

    {
        id: "faq-4",

        question:
            "¿Necesito inscribirme para asistir a una reunión?",

        category: "Primera visita",

        answer: [
            "Para las reuniones generales normalmente no es necesario realizar una inscripción previa.",
            "Algunas actividades, talleres o encuentros especiales sí pueden requerir registro debido a la cantidad de cupos o a la preparación de materiales.",
        ],

        highlightedInfo:
            "Cuando una actividad necesite inscripción, esta información aparecerá claramente indicada en su publicación.",

        links: [
            {
                label: "Revisar actividades y eventos",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-5",

        question:
            "¿Cómo debo vestirme para asistir?",

        category: "Primera visita",

        answer: [
            "No existe una vestimenta especial ni una forma obligatoria de vestirse para asistir a la iglesia.",
            "Puedes venir con la ropa que tengas, con la que uses normalmente o con aquella que te haga sentir cómodo. Tu vestimenta no será un impedimento para participar.",
            "Lo verdaderamente importante para nosotros es tu presencia y que puedas sentirte recibido con cariño y respeto.",
        ],

        highlightedInfo:
            "No importa cómo vengas vestido. Eres bienvenido tal como estás; lo importante es que estés presente.",

        links: [],
    },

    {
        id: "faq-6",

        question:
            "¿Puedo asistir aunque no pertenezca a la iglesia?",

        category: "Primera visita",

        answer: [
            "Sí. Las reuniones generales están abiertas para personas que deseen conocer la comunidad, aprender más acerca de la fe cristiana o simplemente acompañar a un familiar o amistad.",
            "No es necesario ser miembro de la iglesia para asistir por primera vez.",
        ],

        highlightedInfo:
            "Puedes acercarte a tu propio ritmo y realizar las preguntas que necesites.",

        links: [],
    },

    {
        id: "faq-7",

        question:
            "¿La iglesia realiza actividades y talleres?",

        category: "Actividades y talleres",

        answer: [
            "La iglesia puede organizar reuniones especiales, talleres, estudios, encuentros comunitarios y otras actividades durante el año.",
            "La disponibilidad dependerá de la programación y de las necesidades de la comunidad.",
        ],

        highlightedInfo:
            "La información disponible se publica en la sección de Eventos, donde se reúnen tanto las actividades como los eventos especiales.",

        links: [
            {
                label: "Ver actividades y eventos",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-8",

        question:
            "¿Cómo puedo inscribirme en un taller o actividad?",

        category: "Actividades y talleres",

        answer: [
            "Cuando una actividad requiera inscripción, la publicación correspondiente indicará los pasos necesarios para registrarse.",
            "Dependiendo de la actividad, el registro podría realizarse mediante un formulario, un medio de contacto o directamente con una persona responsable.",
        ],

        highlightedInfo:
            "Antes de inscribirte, revisa los requisitos, la fecha, el horario y la disponibilidad de cupos.",

        links: [
            {
                label: "Buscar una actividad",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-9",

        question:
            "¿Las actividades tienen algún costo?",

        category: "Actividades y talleres",

        answer: [
            "Las actividades, reuniones y talleres de la iglesia no tienen un costo obligatorio.",
            "En algunas ocasiones puede invitarse a quienes deseen participar con una cooperación voluntaria para apoyar materiales, alimentación u otras necesidades de la actividad.",
            "Esta cooperación es completamente opcional y ninguna persona está obligada a realizar un aporte para poder participar.",
        ],

        highlightedInfo:
            "Toda cooperación es voluntaria. Puedes asistir y participar aunque no realices ningún aporte.",

        links: [
            {
                label: "Revisar actividades disponibles",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-10",

        question:
            "¿Qué sucede si ya me inscribí y no puedo asistir?",

        category: "Actividades y talleres",

        answer: [
            "Si una actividad tiene cupos limitados y ya no puedes asistir, es recomendable avisar con anticipación.",
            "Esto permite que la organización pueda ajustar la planificación o entregar el cupo a otra persona interesada.",
        ],

        highlightedInfo:
            "Utiliza el medio de contacto indicado en la actividad para informar tu ausencia.",

        links: [
            {
                label: "Ver actividades y eventos",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-11",

        question:
            "¿Las reuniones se transmiten por internet?",

        category: "Reuniones online",

        answer: [
            "Algunas reuniones, estudios o encuentros pueden realizarse o transmitirse mediante plataformas digitales.",
            "La modalidad dependerá de cada actividad y de la programación de la iglesia.",
        ],

        highlightedInfo:
            "Cuando una reunión sea online o incluya transmisión, la publicación mostrará el enlace o las instrucciones necesarias para conectarse.",

        links: [
            {
                label: "Revisar reuniones disponibles",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-12",

        question:
            "¿Necesito una cuenta para acceder a una reunión online?",

        category: "Reuniones online",

        answer: [
            "Esto dependerá de la plataforma utilizada para la reunión.",
            "Algunas plataformas permiten ingresar directamente mediante un enlace, mientras que otras pueden solicitar una cuenta, una contraseña o un código de acceso.",
        ],

        highlightedInfo:
            "Revisa las instrucciones publicadas antes del inicio de la reunión para evitar dificultades al conectarte.",

        links: [
            {
                label: "Ver próximas reuniones",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-13",

        question:
            "¿Qué puedo hacer si el enlace de una reunión no funciona?",

        category: "Reuniones online",

        answer: [
            "Primero verifica que estés utilizando el enlace correcto y que la fecha y el horario correspondan a la reunión.",
            "También puedes intentar actualizar la página, revisar tu conexión a internet o abrir el enlace desde otro navegador o dispositivo.",
            "Si el problema continúa, comunícate con la iglesia mediante los canales disponibles.",
        ],

        highlightedInfo:
            "Evita compartir públicamente enlaces privados, contraseñas o códigos de acceso.",

        links: [
            {
                label: "Ir a Contacto",
                path: "/contacto",
            },
        ],
    },

    {
        id: "faq-14",

        question:
            "¿La iglesia tiene actividades para niños?",

        category: "Niños y familia",

        answer: [
            "La disponibilidad de actividades para niños dependerá de la programación vigente de la iglesia.",
            "Cuando exista una reunión, taller o actividad familiar, la información correspondiente indicará las edades, horarios y requisitos de participación.",
        ],

        highlightedInfo:
            "Los niños deben permanecer bajo la supervisión y responsabilidad de su madre, padre o adulto responsable, salvo que la actividad indique un sistema de cuidado organizado.",

        links: [
            {
                label: "Ver actividades familiares",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-15",

        question:
            "¿Puedo asistir con mi familia?",

        category: "Niños y familia",

        answer: [
            "Sí. Las familias pueden asistir juntas a las reuniones generales y a las actividades que estén abiertas para todas las edades.",
            "En el caso de actividades dirigidas a un grupo específico, la publicación indicará quiénes pueden participar.",
        ],

        highlightedInfo:
            "Revisa siempre la descripción de la actividad para confirmar si existe alguna restricción de edad.",

        links: [
            {
                label: "Consultar actividades y eventos",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-16",

        question:
            "¿Existen actividades para matrimonios o familias?",

        category: "Niños y familia",

        answer: [
            "Durante el año pueden desarrollarse encuentros, talleres o espacios de orientación dirigidos a matrimonios y familias.",
            "Estas actividades dependerán de la planificación de la iglesia y serán anunciadas cuando estén disponibles.",
        ],

        highlightedInfo:
            "Puedes revisar regularmente la sección de Eventos para conocer nuevas actividades.",

        links: [
            {
                label: "Ver programación",
                path: "/eventos",
            },
        ],
    },

    {
        id: "faq-17",

        question:
            "¿Cómo puedo solicitar oración?",

        category: "Contacto y ayuda",

        answer: [
            "Puedes comunicar tu petición de oración utilizando los medios de contacto disponibles en la página.",
            "También puedes acercarte a una persona responsable durante una reunión y solicitar acompañamiento.",
        ],

        highlightedInfo:
            "Comparte solamente la información que te resulte cómoda y evita incluir datos personales sensibles innecesarios.",

        links: [
            {
                label: "Ir a Contacto",
                path: "/contacto",
            },
            {
                label: "Ver guías de oración",
                path: "/recursos/guias-oracion",
            },
        ],
    },

    {
        id: "faq-18",

        question:
            "¿Puedo conversar con alguien si estoy pasando por un momento difícil?",

        category: "Contacto y ayuda",

        answer: [
            "Puedes comunicarte con la iglesia para solicitar orientación, oración o acompañamiento espiritual.",
            "Dependiendo de la situación, una persona responsable podrá escucharte y orientarte hacia el apoyo más adecuado.",
            "La orientación pastoral no sustituye la atención médica, psicológica, legal o de emergencia cuando esta sea necesaria.",
        ],

        highlightedInfo:
            "Si existe peligro inmediato para ti o para otra persona, busca ayuda de emergencia y comunícate con los servicios correspondientes de tu localidad.",

        links: [
            {
                label: "Contactar a la iglesia",
                path: "/contacto",
            },
        ],
    },

    {
        id: "faq-19",

        question:
            "¿Cómo puedo comunicarme con la iglesia?",

        category: "Contacto y ayuda",

        answer: [
            "Puedes revisar los medios de comunicación disponibles en la sección de Contacto.",
            "Allí encontrarás la información publicada por la iglesia para realizar consultas, solicitar orientación o resolver dudas.",
        ],

        highlightedInfo:
            "Los tiempos de respuesta pueden variar según la disponibilidad de las personas responsables.",

        links: [
            {
                label: "Ver medios de contacto",
                path: "/contacto",
            },
        ],
    },

    {
        id: "faq-20",

        question:
            "¿Cómo puedo comenzar a participar en la comunidad?",

        category: "Participación",

        answer: [
            "Puedes comenzar asistiendo a las reuniones, participando en actividades y conociendo progresivamente a otras personas de la comunidad.",
            "También puedes conversar con una persona responsable para recibir orientación sobre grupos, talleres o áreas de participación disponibles.",
        ],

        highlightedInfo:
            "No necesitas asumir responsabilidades inmediatamente. Es importante conocer la comunidad y avanzar de manera gradual.",

        links: [
            {
                label: "Ver actividades y eventos",
                path: "/eventos",
            },
            {
                label: "Conocer la iglesia",
                path: "/nosotros",
            },
        ],
    },

    {
        id: "faq-21",

        question:
            "¿Cómo puedo comenzar a servir en la iglesia?",

        category: "Participación",

        answer: [
            "Las oportunidades de servicio dependerán de las necesidades de la iglesia, de las áreas disponibles y del proceso definido por sus responsables.",
            "Antes de integrarte a un equipo, podría ser necesario conocer la comunidad, participar regularmente y conversar con una persona encargada.",
        ],

        highlightedInfo:
            "Servir implica compromiso, responsabilidad, disposición para aprender y respeto por las normas de cada área.",

        links: [
            {
                label: "Ver material sobre servicio",
                path: "/recursos/discipulado/descubriendo-tus-dones",
            },
            {
                label: "Contactar a la iglesia",
                path: "/contacto",
            },
        ],
    },

    {
        id: "faq-22",

        question:
            "¿Necesito ser miembro para participar o servir?",

        category: "Participación",

        answer: [
            "Algunas actividades están abiertas para todas las personas, mientras que ciertas responsabilidades pueden requerir un proceso previo de participación o formación.",
            "Los requisitos dependerán del tipo de función y de las normas internas de la iglesia.",
        ],

        highlightedInfo:
            "Puedes conversar con una persona responsable para conocer los pasos correspondientes a cada área.",

        links: [
            {
                label: "Contactar a la iglesia",
                path: "/contacto",
            },
        ],
    },

    {
        id: "faq-23",

        question:
            "¿Dónde puedo encontrar recursos para crecer en la fe?",

        category: "Participación",

        answer: [
            "La página de Recursos reúne contenidos preparados para apoyar la oración, el estudio bíblico, el discipulado y otras áreas del crecimiento cristiano.",
            "Puedes revisar cada sección y avanzar según tus intereses o necesidades.",
        ],

        highlightedInfo:
            "Los recursos complementan el acompañamiento y la participación en una comunidad cristiana, pero no buscan reemplazarlos.",

        links: [
            {
                label: "Explorar Recursos",
                path: "/recursos",
            },
            {
                label: "Ver material de discipulado",
                path: "/recursos/discipulado",
            },
        ],
    },

    {
        id: "faq-24",

        question:
            "¿Cómo puedo conocer mejor las creencias de la iglesia?",

        category: "Participación",

        answer: [
            "Puedes comenzar revisando la sección Nosotros, donde se presenta información general acerca de la identidad y el propósito de la iglesia.",
            "También puedes asistir a una reunión, revisar los recursos disponibles y conversar con una persona responsable para resolver preguntas específicas.",
        ],

        highlightedInfo:
            "Es recomendable hacer preguntas directamente y revisar las enseñanzas en su contexto.",

        links: [
            {
                label: "Conocer la iglesia",
                path: "/nosotros",
            },
            {
                label: "Explorar Recursos",
                path: "/recursos",
            },
        ],
    },
];

// =====================================================
// EXPORTACIÓN
// =====================================================

export default frequentlyAskedQuestions;