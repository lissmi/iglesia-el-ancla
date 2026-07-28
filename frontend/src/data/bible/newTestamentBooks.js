// Libros del Nuevo Testamento.
const newTestamentBooks = [
       // =====================================================
    // EVANGELIOS
    // =====================================================

    {
        id: "nt-1",
        slug: "mateo",
        name: "Mateo",
        testament: "Nuevo Testamento",
        group: "Evangelios",
        chapters: 28,

        theme:
            "Jesús presentado como el Mesías y Rey prometido.",

        description: [
            "Mateo presenta a Jesús como el Mesías prometido en las Escrituras y como el Rey esperado por Israel. A lo largo del libro se destacan numerosas profecías cumplidas, enseñanzas, milagros y acontecimientos que confirman su identidad.",
            "El Evangelio también reúne grandes discursos de Jesús, como el Sermón del Monte, las parábolas del reino y las enseñanzas sobre la vida de los discípulos. Finaliza con la muerte, resurrección y comisión de llevar el evangelio a todas las naciones.",
        ],

        keyCharacters: [
            "Jesús",
            "María",
            "José",
            "Juan el Bautista",
            "Pedro",
            "Los doce discípulos",
            "Los fariseos",
            "Poncio Pilato",
        ],

        keyEvents: [
            "La genealogía y el nacimiento de Jesús",
            "La visita de los sabios",
            "El bautismo de Jesús",
            "La tentación en el desierto",
            "El Sermón del Monte",
            "Los milagros y parábolas del reino",
            "La confesión de Pedro",
            "La transfiguración",
            "La entrada triunfal en Jerusalén",
            "La crucifixión y resurrección",
            "La Gran Comisión",
        ],

        keyThemes: [
            "Mesías",
            "Reino de los cielos",
            "Cumplimiento profético",
            "Discipulado",
            "Justicia",
            "Fe",
            "Misión",
        ],

        featuredVerse: {
            reference: "Mateo 28:19–20",
            text:
                "Por tanto, id, y haced discípulos a todas las naciones.",
        },

        suggestedStart: "Mateo 5–7",
    },

    {
        id: "nt-2",
        slug: "marcos",
        name: "Marcos",
        testament: "Nuevo Testamento",
        group: "Evangelios",
        chapters: 16,

        theme:
            "Jesús presentado como el Siervo y el Hijo de Dios.",

        description: [
            "Marcos presenta un relato dinámico de la vida y el ministerio de Jesús, concentrándose especialmente en sus acciones, milagros y encuentros con las personas. Desde el comienzo, Jesús es identificado como el Hijo de Dios.",
            "El libro muestra que el camino de Jesús conduce al servicio, al sufrimiento y a la entrega de su vida. También enseña que seguirlo implica humildad, obediencia y disposición para servir a los demás.",
        ],

        keyCharacters: [
            "Jesús",
            "Juan el Bautista",
            "Pedro",
            "Santiago",
            "Juan",
            "Los doce discípulos",
            "Los líderes religiosos",
            "Poncio Pilato",
        ],

        keyEvents: [
            "El bautismo y la tentación de Jesús",
            "El llamado de los primeros discípulos",
            "Las sanidades y expulsiones de demonios",
            "La alimentación de los cinco mil",
            "La confesión de Pedro",
            "La transfiguración",
            "La enseñanza sobre el servicio",
            "La entrada en Jerusalén",
            "La última cena",
            "La crucifixión y resurrección",
        ],

        keyThemes: [
            "Servicio",
            "Hijo de Dios",
            "Autoridad",
            "Discipulado",
            "Sufrimiento",
            "Fe",
            "Sacrificio",
        ],

        featuredVerse: {
            reference: "Marcos 10:45",
            text:
                "Porque el Hijo del Hombre no vino para ser servido, sino para servir.",
        },

        suggestedStart: "Marcos 1–3",
    },

    {
        id: "nt-3",
        slug: "lucas",
        name: "Lucas",
        testament: "Nuevo Testamento",
        group: "Evangelios",
        chapters: 24,

        theme:
            "Jesús presentado como el Salvador compasivo de toda la humanidad.",

        description: [
            "Lucas ofrece un relato ordenado y detallado de la vida de Jesús, desde los acontecimientos relacionados con su nacimiento hasta su resurrección. El libro presta especial atención a la oración, al Espíritu Santo y al cumplimiento del plan de Dios.",
            "Este Evangelio destaca la compasión de Jesús hacia los pobres, las mujeres, los enfermos, los pecadores y las personas excluidas. También contiene parábolas muy conocidas que muestran la misericordia de Dios y su deseo de buscar y salvar a los perdidos.",
        ],

        keyCharacters: [
            "Jesús",
            "María",
            "José",
            "Zacarías",
            "Elisabet",
            "Juan el Bautista",
            "Pedro",
            "Los doce discípulos",
            "Herodes",
            "Poncio Pilato",
        ],

        keyEvents: [
            "El anuncio del nacimiento de Juan el Bautista",
            "El anuncio y nacimiento de Jesús",
            "La presentación de Jesús en el templo",
            "El bautismo y la tentación de Jesús",
            "El inicio del ministerio en Nazaret",
            "Las parábolas del buen samaritano y del hijo pródigo",
            "La sanidad de enfermos y excluidos",
            "El encuentro con Zaqueo",
            "La última cena",
            "La crucifixión y resurrección",
            "El camino a Emaús",
        ],

        keyThemes: [
            "Salvación",
            "Compasión",
            "Oración",
            "Espíritu Santo",
            "Misericordia",
            "Inclusión",
            "Gozo",
        ],

        featuredVerse: {
            reference: "Lucas 19:10",
            text:
                "Porque el Hijo del Hombre vino a buscar y a salvar lo que se había perdido.",
        },

        suggestedStart: "Lucas 1–2",
    },

    {
        id: "nt-4",
        slug: "juan",
        name: "Juan",
        testament: "Nuevo Testamento",
        group: "Evangelios",
        chapters: 21,

        theme:
            "Jesús presentado como el Hijo de Dios y la fuente de vida eterna.",

        description: [
            "Juan presenta a Jesús como la Palabra eterna que estaba con Dios y que es Dios. En lugar de seguir exactamente la misma estructura de los otros Evangelios, selecciona señales, enseñanzas y encuentros que revelan la identidad divina de Cristo.",
            "El libro destaca la fe, el amor, la verdad, la vida eterna y la relación personal con Jesús. Su propósito declarado es que los lectores crean que Jesús es el Cristo, el Hijo de Dios, y que creyendo tengan vida en su nombre.",
        ],

        keyCharacters: [
            "Jesús",
            "Juan el Bautista",
            "Pedro",
            "Juan",
            "Nicodemo",
            "La mujer samaritana",
            "Marta",
            "María",
            "Lázaro",
            "Tomás",
        ],

        keyEvents: [
            "La presentación de Jesús como la Palabra",
            "La boda de Caná",
            "El encuentro con Nicodemo",
            "El encuentro con la mujer samaritana",
            "La alimentación de los cinco mil",
            "La sanidad del ciego de nacimiento",
            "La resurrección de Lázaro",
            "El lavamiento de los pies",
            "El discurso de despedida",
            "La crucifixión y resurrección",
            "La aparición a Tomás",
        ],

        keyThemes: [
            "Hijo de Dios",
            "Vida eterna",
            "Fe",
            "Amor",
            "Verdad",
            "Luz",
            "Comunión con Cristo",
        ],

        featuredVerse: {
            reference: "Juan 20:31",
            text:
                "Estas se han escrito para que creáis que Jesús es el Cristo, el Hijo de Dios.",
        },

        suggestedStart: "Juan 1–3",
    },
    // =====================================================
    // LIBRO HISTÓRICO
    // =====================================================

    {
        id: "nt-5",
        slug: "hechos",
        name: "Hechos",
        testament: "Nuevo Testamento",
        group: "Libro histórico",
        chapters: 28,

        theme:
            "El nacimiento y la expansión de la iglesia mediante el Espíritu Santo.",

        description: [
            "Hechos continúa el relato del Evangelio de Lucas y describe lo ocurrido después de la resurrección y ascensión de Jesús. El libro muestra cómo los discípulos reciben el Espíritu Santo y comienzan a anunciar el evangelio desde Jerusalén.",
            "A lo largo de la narración, el mensaje se extiende hacia Judea, Samaria y otras regiones del Imperio romano. Hechos destaca especialmente el ministerio de Pedro y Pablo, la formación de las primeras comunidades cristianas y la guía constante del Espíritu Santo.",
        ],

        keyCharacters: [
            "Jesús",
            "Pedro",
            "Juan",
            "Esteban",
            "Felipe",
            "Pablo",
            "Bernabé",
            "Silas",
            "Timoteo",
            "Lucas",
        ],

        keyEvents: [
            "La ascensión de Jesús",
            "La elección de Matías",
            "La llegada del Espíritu Santo en Pentecostés",
            "La predicación de Pedro",
            "La vida de la primera iglesia",
            "La sanidad del hombre cojo",
            "El martirio de Esteban",
            "La expansión del evangelio en Samaria",
            "La conversión de Saulo",
            "La conversión de Cornelio",
            "El primer viaje misionero de Pablo",
            "El concilio de Jerusalén",
            "Los viajes misioneros de Pablo",
            "El arresto de Pablo",
            "El viaje de Pablo a Roma",
        ],

        keyThemes: [
            "Espíritu Santo",
            "Iglesia",
            "Misión",
            "Evangelio",
            "Testimonio",
            "Persecución",
            "Expansión",
        ],

        featuredVerse: {
            reference: "Hechos 1:8",
            text:
                "Recibiréis poder, cuando haya venido sobre vosotros el Espíritu Santo, y me seréis testigos.",
        },

        suggestedStart: "Hechos 1–2",
    },
    // =====================================================
    // CARTAS DE PABLO
    // =====================================================

    {
        id: "nt-6",
        slug: "romanos",
        name: "Romanos",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 16,

        theme:
            "La salvación por la gracia de Dios mediante la fe en Jesucristo.",

        description: [
            "Romanos presenta una explicación amplia y ordenada del evangelio. Pablo enseña que todas las personas han pecado y necesitan la salvación que Dios ofrece gratuitamente por medio de la fe en Jesucristo.",
            "La carta también explica la justificación, la nueva vida en el Espíritu, la obra de Dios con Israel y la transformación práctica que debe producir el evangelio en las relaciones, el servicio y la vida cotidiana.",
        ],

        keyCharacters: [
            "Pablo",
            "Jesucristo",
            "Abraham",
            "Adán",
            "Moisés",
            "Febe",
            "Priscila",
            "Aquila",
        ],

        keyEvents: [
            "La presentación del evangelio",
            "La explicación de la condición pecadora de la humanidad",
            "La justificación por medio de la fe",
            "El ejemplo de Abraham",
            "El contraste entre Adán y Cristo",
            "La enseñanza sobre la nueva vida",
            "La vida guiada por el Espíritu",
            "La reflexión sobre Israel",
            "Las instrucciones para la vida cristiana",
            "Los saludos finales a la iglesia de Roma",
        ],

        keyThemes: [
            "Evangelio",
            "Pecado",
            "Gracia",
            "Fe",
            "Justificación",
            "Espíritu Santo",
            "Transformación",
        ],

        featuredVerse: {
            reference: "Romanos 1:16",
            text:
                "Porque no me avergüenzo del evangelio, porque es poder de Dios para salvación a todo aquel que cree.",
        },

        suggestedStart: "Romanos 3–5",
    },

    {
        id: "nt-7",
        slug: "1-corintios",
        name: "1 Corintios",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 16,

        theme:
            "La unidad, la santidad y el orden dentro de la iglesia.",

        description: [
            "Primera de Corintios responde a numerosos problemas presentes en la iglesia de Corinto, entre ellos divisiones, inmoralidad, conflictos legales, desorden en la adoración y confusión respecto de los dones espirituales.",
            "Pablo llama a los creyentes a vivir de manera coherente con el evangelio, recordándoles que forman un solo cuerpo. La carta también contiene importantes enseñanzas sobre el amor, la Cena del Señor y la resurrección.",
        ],

        keyCharacters: [
            "Pablo",
            "Apolos",
            "Pedro",
            "Cloe",
            "Estéfanas",
            "Los creyentes de Corinto",
        ],

        keyEvents: [
            "La denuncia de las divisiones en la iglesia",
            "La enseñanza sobre la sabiduría de Dios",
            "La corrección de la inmoralidad",
            "Las instrucciones sobre el matrimonio",
            "La enseñanza sobre la libertad cristiana",
            "La corrección de la Cena del Señor",
            "La explicación de los dones espirituales",
            "El himno al amor",
            "La enseñanza sobre la resurrección",
            "La colecta para los creyentes de Jerusalén",
        ],

        keyThemes: [
            "Unidad",
            "Santidad",
            "Amor",
            "Dones espirituales",
            "Adoración",
            "Resurrección",
            "Madurez",
        ],

        featuredVerse: {
            reference: "1 Corintios 13:13",
            text:
                "Y ahora permanecen la fe, la esperanza y el amor, estos tres; pero el mayor de ellos es el amor.",
        },

        suggestedStart: "1 Corintios 12–13",
    },

    {
        id: "nt-8",
        slug: "2-corintios",
        name: "2 Corintios",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 13,

        theme:
            "La fortaleza de Dios manifestada en medio de la debilidad.",

        description: [
            "Segunda de Corintios es una carta profundamente personal en la que Pablo expresa su amor por la iglesia y explica las dificultades que ha enfrentado durante su ministerio. También defiende la autenticidad de su llamado apostólico.",
            "La carta enseña que el poder de Dios puede manifestarse en medio de la debilidad, el sufrimiento y las limitaciones humanas. Pablo también anima a los creyentes a perdonar, reconciliarse y participar generosamente en la ayuda a otros.",
        ],

        keyCharacters: [
            "Pablo",
            "Tito",
            "Timoteo",
            "Los creyentes de Corinto",
            "Los falsos apóstoles",
        ],

        keyEvents: [
            "El consuelo de Dios en medio de la aflicción",
            "La explicación del cambio de planes de Pablo",
            "El llamado a perdonar al ofensor",
            "La enseñanza sobre el nuevo pacto",
            "La descripción del ministerio de reconciliación",
            "El encuentro de Pablo con Tito",
            "La colecta para los creyentes necesitados",
            "La defensa del apostolado de Pablo",
            "La visión del tercer cielo",
            "La enseñanza sobre el aguijón en la carne",
        ],

        keyThemes: [
            "Consuelo",
            "Debilidad",
            "Poder de Dios",
            "Reconciliación",
            "Ministerio",
            "Generosidad",
            "Perseverancia",
        ],

        featuredVerse: {
            reference: "2 Corintios 12:9",
            text:
                "Bástate mi gracia; porque mi poder se perfecciona en la debilidad.",
        },

        suggestedStart: "2 Corintios 4–5",
    },

    {
        id: "nt-9",
        slug: "galatas",
        name: "Gálatas",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 6,

        theme:
            "La libertad cristiana y la justificación por medio de la fe.",

        description: [
            "Gálatas fue escrita para enfrentar una enseñanza que afirmaba que los creyentes debían cumplir ciertas prácticas de la ley de Moisés para ser aceptados por Dios. Pablo responde defendiendo que la salvación se recibe únicamente por la gracia mediante la fe en Cristo.",
            "La carta también explica que la libertad cristiana no significa vivir sin límites, sino caminar guiados por el Espíritu. La verdadera fe produce amor, servicio y una vida transformada.",
        ],

        keyCharacters: [
            "Pablo",
            "Pedro",
            "Bernabé",
            "Abraham",
            "Los creyentes de Galacia",
            "Los falsos maestros",
        ],

        keyEvents: [
            "La defensa del evangelio de la gracia",
            "El relato de la conversión de Pablo",
            "La visita de Pablo a Jerusalén",
            "La confrontación entre Pablo y Pedro",
            "El ejemplo de la fe de Abraham",
            "La comparación entre la ley y la promesa",
            "La enseñanza sobre la libertad cristiana",
            "El contraste entre la carne y el Espíritu",
            "La presentación del fruto del Espíritu",
            "El llamado a llevar las cargas de otros",
        ],

        keyThemes: [
            "Gracia",
            "Fe",
            "Libertad",
            "Justificación",
            "Espíritu Santo",
            "Promesa",
            "Vida transformada",
        ],

        featuredVerse: {
            reference: "Gálatas 2:20",
            text:
                "Con Cristo estoy juntamente crucificado, y ya no vivo yo, mas vive Cristo en mí.",
        },

        suggestedStart: "Gálatas 2–3",
    },

    {
        id: "nt-10",
        slug: "efesios",
        name: "Efesios",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 6,

        theme:
            "La identidad, la unidad y la nueva vida de los creyentes en Cristo.",

        description: [
            "Efesios explica las bendiciones espirituales que los creyentes han recibido en Cristo, incluyendo la adopción, el perdón, la redención y la esperanza. Pablo muestra que la salvación es un regalo de la gracia de Dios.",
            "La segunda parte de la carta enseña cómo debe vivirse esta nueva identidad. Los creyentes son llamados a mantener la unidad, desarrollar sus dones, abandonar la antigua manera de vivir y permanecer firmes utilizando la armadura de Dios.",
        ],

        keyCharacters: [
            "Pablo",
            "Jesucristo",
            "El Espíritu Santo",
            "Tíquico",
            "Los creyentes de Éfeso",
            "Los apóstoles y profetas",
        ],

        keyEvents: [
            "La descripción de las bendiciones espirituales",
            "La oración de Pablo por sabiduría",
            "La enseñanza sobre la salvación por gracia",
            "La unión entre judíos y gentiles",
            "La revelación del misterio de Cristo",
            "La enseñanza sobre la unidad de la iglesia",
            "El llamado a abandonar la vieja vida",
            "Las instrucciones para las relaciones familiares",
            "La presentación de la armadura de Dios",
        ],

        keyThemes: [
            "Identidad en Cristo",
            "Gracia",
            "Unidad",
            "Iglesia",
            "Nueva vida",
            "Amor",
            "Guerra espiritual",
        ],

        featuredVerse: {
            reference: "Efesios 2:8–9",
            text:
                "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios.",
        },

        suggestedStart: "Efesios 1–2",
    },

    {
        id: "nt-11",
        slug: "filipenses",
        name: "Filipenses",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 4,

        theme:
            "El gozo y la confianza en Cristo en toda circunstancia.",

        description: [
            "Filipenses fue escrita por Pablo mientras se encontraba encarcelado. A pesar de sus circunstancias, la carta está llena de gratitud, esperanza y alegría por la obra que Dios estaba realizando en la iglesia.",
            "Pablo anima a los creyentes a vivir en unidad, humildad y contentamiento. Presenta a Jesús como el ejemplo supremo de servicio y enseña que el verdadero gozo no depende de las circunstancias, sino de la relación con Cristo.",
        ],

        keyCharacters: [
            "Pablo",
            "Timoteo",
            "Epafrodito",
            "Evodia",
            "Síntique",
            "Los creyentes de Filipos",
        ],

        keyEvents: [
            "La gratitud de Pablo por la iglesia",
            "El avance del evangelio durante su encarcelamiento",
            "El llamado a vivir dignamente",
            "El ejemplo de humildad de Cristo",
            "El envío de Timoteo",
            "La enfermedad y recuperación de Epafrodito",
            "La advertencia contra las falsas enseñanzas",
            "El llamado a reconciliar a Evodia y Síntique",
            "La enseñanza sobre la oración y la paz",
            "La declaración de contentamiento de Pablo",
        ],

        keyThemes: [
            "Gozo",
            "Humildad",
            "Unidad",
            "Contentamiento",
            "Perseverancia",
            "Servicio",
            "Paz",
        ],

        featuredVerse: {
            reference: "Filipenses 4:13",
            text:
                "Todo lo puedo en Cristo que me fortalece.",
        },

        suggestedStart: "Filipenses 2 y 4",
    },

    {
        id: "nt-12",
        slug: "colosenses",
        name: "Colosenses",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 4,

        theme:
            "La supremacía y suficiencia de Jesucristo.",

        description: [
            "Colosenses presenta a Jesucristo como la imagen del Dios invisible, el Creador y la cabeza de la iglesia. Pablo escribe para proteger a los creyentes de enseñanzas que intentaban añadir prácticas humanas, filosofías y reglas religiosas al evangelio.",
            "La carta enseña que Cristo es completamente suficiente para la salvación y el crecimiento espiritual. Por esta razón, los creyentes deben abandonar la antigua manera de vivir y reflejar el carácter de Jesús en sus palabras, relaciones y acciones.",
        ],

        keyCharacters: [
            "Pablo",
            "Timoteo",
            "Epafras",
            "Tíquico",
            "Onésimo",
            "Marcos",
            "Los creyentes de Colosas",
        ],

        keyEvents: [
            "La gratitud por la fe de los colosenses",
            "La oración de Pablo por crecimiento espiritual",
            "La presentación de la supremacía de Cristo",
            "La explicación de la reconciliación",
            "La defensa frente a las falsas filosofías",
            "La advertencia contra las reglas humanas",
            "El llamado a buscar las cosas de arriba",
            "La descripción de la nueva vida",
            "Las instrucciones para las relaciones familiares",
            "Los saludos y recomendaciones finales",
        ],

        keyThemes: [
            "Supremacía de Cristo",
            "Suficiencia",
            "Reconciliación",
            "Nueva vida",
            "Verdad",
            "Madurez espiritual",
            "Gratitud",
        ],

        featuredVerse: {
            reference: "Colosenses 1:16",
            text:
                "Porque en él fueron creadas todas las cosas, las que hay en los cielos y las que hay en la tierra.",
        },

        suggestedStart: "Colosenses 1–3",
    },
    {
        id: "nt-13",
        slug: "1-tesalonicenses",
        name: "1 Tesalonicenses",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 5,

        theme:
            "La esperanza en el regreso de Jesucristo y una vida de santidad.",

        description: [
            "Primera de Tesalonicenses fue escrita para animar a una iglesia joven que enfrentaba oposición y dificultades. Pablo expresa su gratitud por la fe, el amor y la perseverancia de los creyentes.",
            "La carta enseña cómo vivir de una manera agradable a Dios mientras se espera el regreso de Jesucristo. También ofrece consuelo respecto de los creyentes que han muerto y llama a permanecer atentos, firmes y esperanzados.",
        ],

        keyCharacters: [
            "Pablo",
            "Silas",
            "Timoteo",
            "Los creyentes de Tesalónica",
            "Jesucristo",
        ],

        keyEvents: [
            "La gratitud por la fe de los tesalonicenses",
            "El recuerdo del ministerio de Pablo",
            "La preocupación por la iglesia",
            "El envío de Timoteo",
            "El informe positivo de Timoteo",
            "El llamado a vivir en santidad",
            "La enseñanza sobre los creyentes fallecidos",
            "La explicación del regreso de Cristo",
            "Las instrucciones finales para la comunidad",
        ],

        keyThemes: [
            "Esperanza",
            "Regreso de Cristo",
            "Santidad",
            "Perseverancia",
            "Amor",
            "Consuelo",
            "Vigilancia",
        ],

        featuredVerse: {
            reference: "1 Tesalonicenses 5:16–18",
            text:
                "Estad siempre gozosos. Orad sin cesar. Dad gracias en todo.",
        },

        suggestedStart: "1 Tesalonicenses 4–5",
    },

    {
        id: "nt-14",
        slug: "2-tesalonicenses",
        name: "2 Tesalonicenses",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 3,

        theme:
            "La perseverancia y la correcta comprensión del día del Señor.",

        description: [
            "Segunda de Tesalonicenses fue escrita para fortalecer a los creyentes que continuaban sufriendo persecución. Pablo los anima recordándoles que Dios es justo y que finalmente corregirá toda injusticia.",
            "La carta también aclara confusiones relacionadas con el día del Señor. Pablo enseña que los creyentes no deben dejarse alarmar por rumores ni abandonar sus responsabilidades, sino permanecer firmes, trabajar y hacer el bien.",
        ],

        keyCharacters: [
            "Pablo",
            "Silas",
            "Timoteo",
            "Los creyentes de Tesalónica",
            "El hombre de pecado",
        ],

        keyEvents: [
            "La gratitud por la perseverancia de la iglesia",
            "El consuelo frente a la persecución",
            "La enseñanza sobre el juicio de Dios",
            "La aclaración sobre el día del Señor",
            "La descripción de la rebelión futura",
            "El llamado a permanecer firmes",
            "La petición de oración por el evangelio",
            "La corrección de quienes no querían trabajar",
            "El llamado a no cansarse de hacer el bien",
        ],

        keyThemes: [
            "Perseverancia",
            "Día del Señor",
            "Justicia",
            "Fidelidad",
            "Discernimiento",
            "Responsabilidad",
            "Esperanza",
        ],

        featuredVerse: {
            reference: "2 Tesalonicenses 3:13",
            text:
                "Y vosotros, hermanos, no os canséis de hacer bien.",
        },

        suggestedStart: "2 Tesalonicenses 1–2",
    },

    {
        id: "nt-15",
        slug: "1-timoteo",
        name: "1 Timoteo",
        testament: "Nuevo Testamento",
        group: "Cartas pastorales",
        chapters: 6,

        theme:
            "El liderazgo, la sana doctrina y el orden dentro de la iglesia.",

        description: [
            "Primera de Timoteo contiene instrucciones de Pablo para Timoteo, quien tenía la responsabilidad de servir y enseñar en la iglesia de Éfeso. Pablo le encarga enfrentar las falsas doctrinas y promover una enseñanza centrada en el evangelio.",
            "La carta también aborda la oración comunitaria, los requisitos para líderes, el cuidado de distintos grupos de la iglesia y la responsabilidad de vivir con integridad. Timoteo es llamado a ser ejemplo en palabra, conducta, amor, fe y pureza.",
        ],

        keyCharacters: [
            "Pablo",
            "Timoteo",
            "Los ancianos",
            "Los diáconos",
            "Las viudas",
            "Los falsos maestros",
            "Los creyentes de Éfeso",
        ],

        keyEvents: [
            "El encargo de enfrentar falsas doctrinas",
            "La enseñanza sobre la oración",
            "Las instrucciones para la adoración comunitaria",
            "Los requisitos para los supervisores",
            "Los requisitos para los diáconos",
            "La advertencia sobre la apostasía",
            "El llamado de Timoteo a ser ejemplo",
            "Las instrucciones sobre el cuidado de las viudas",
            "La enseñanza sobre el dinero",
            "El encargo final de guardar la fe",
        ],

        keyThemes: [
            "Sana doctrina",
            "Liderazgo",
            "Iglesia",
            "Integridad",
            "Servicio",
            "Disciplina",
            "Contentamiento",
        ],

        featuredVerse: {
            reference: "1 Timoteo 4:12",
            text:
                "Sé ejemplo de los creyentes en palabra, conducta, amor, espíritu, fe y pureza.",
        },

        suggestedStart: "1 Timoteo 3–4",
    },

    {
        id: "nt-16",
        slug: "2-timoteo",
        name: "2 Timoteo",
        testament: "Nuevo Testamento",
        group: "Cartas pastorales",
        chapters: 4,

        theme:
            "La fidelidad al evangelio y la perseverancia en el ministerio.",

        description: [
            "Segunda de Timoteo es considerada la última carta escrita por Pablo. Desde la prisión, el apóstol anima a Timoteo a mantener viva su vocación, no avergonzarse del evangelio y soportar las dificultades con valentía.",
            "Pablo enfatiza la importancia de transmitir fielmente la enseñanza a otros, utilizar correctamente la Palabra y mantenerse firme frente a las falsas doctrinas. La carta concluye con el testimonio de alguien que considera haber terminado fielmente su carrera.",
        ],

        keyCharacters: [
            "Pablo",
            "Timoteo",
            "Loida",
            "Eunice",
            "Onesíforo",
            "Demas",
            "Lucas",
            "Marcos",
        ],

        keyEvents: [
            "El llamado a avivar el don de Dios",
            "La exhortación a no avergonzarse del evangelio",
            "El ejemplo del soldado, atleta y labrador",
            "El encargo de enseñar a personas fieles",
            "La advertencia sobre las falsas enseñanzas",
            "La descripción de los tiempos difíciles",
            "La enseñanza sobre la inspiración de las Escrituras",
            "El mandato de predicar la Palabra",
            "La declaración final de Pablo",
            "La petición de que Timoteo lo visite",
        ],

        keyThemes: [
            "Fidelidad",
            "Perseverancia",
            "Evangelio",
            "Escrituras",
            "Ministerio",
            "Valentía",
            "Legado",
        ],

        featuredVerse: {
            reference: "2 Timoteo 3:16–17",
            text:
                "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir y para instruir en justicia.",
        },

        suggestedStart: "2 Timoteo 2–3",
    },

    {
        id: "nt-17",
        slug: "tito",
        name: "Tito",
        testament: "Nuevo Testamento",
        group: "Cartas pastorales",
        chapters: 3,

        theme:
            "La sana doctrina demostrada mediante una vida de buenas obras.",

        description: [
            "Tito contiene las instrucciones de Pablo para organizar las iglesias de Creta. Tito debía nombrar líderes responsables, corregir las falsas enseñanzas y fortalecer a las comunidades cristianas.",
            "La carta conecta constantemente la doctrina con la conducta. La gracia de Dios no solamente salva, sino que también enseña a vivir con dominio propio, justicia, respeto y disposición para realizar buenas obras.",
        ],

        keyCharacters: [
            "Pablo",
            "Tito",
            "Los ancianos",
            "Los falsos maestros",
            "Los creyentes de Creta",
            "Artemas",
            "Tíquico",
            "Zenas",
            "Apolos",
        ],

        keyEvents: [
            "El encargo de organizar las iglesias de Creta",
            "El nombramiento de ancianos",
            "La descripción de los falsos maestros",
            "Las instrucciones para hombres y mujeres mayores",
            "Las enseñanzas para jóvenes y siervos",
            "La explicación de la gracia que transforma",
            "El llamado a respetar a las autoridades",
            "La enseñanza sobre la salvación por misericordia",
            "La advertencia contra discusiones inútiles",
            "Las instrucciones finales para las buenas obras",
        ],

        keyThemes: [
            "Sana doctrina",
            "Buenas obras",
            "Liderazgo",
            "Gracia",
            "Conducta",
            "Orden",
            "Integridad",
        ],

        featuredVerse: {
            reference: "Tito 2:11–12",
            text:
                "La gracia de Dios se ha manifestado para salvación a todos los hombres, enseñándonos que vivamos en este siglo sobria, justa y piadosamente.",
        },

        suggestedStart: "Tito 2–3",
    },

    {
        id: "nt-18",
        slug: "filemon",
        name: "Filemón",
        testament: "Nuevo Testamento",
        group: "Cartas de Pablo",
        chapters: 1,

        theme:
            "El perdón, la reconciliación y la fraternidad cristiana.",

        description: [
            "Filemón es una breve carta personal escrita por Pablo en favor de Onésimo, un siervo que se había separado de su amo, Filemón. Durante su encuentro con Pablo, Onésimo se convirtió en creyente.",
            "Pablo pide a Filemón que lo reciba nuevamente, no solamente como siervo, sino como hermano amado en Cristo. La carta muestra cómo el evangelio puede transformar las relaciones mediante el perdón, la gracia y la reconciliación.",
        ],

        keyCharacters: [
            "Pablo",
            "Filemón",
            "Onésimo",
            "Apia",
            "Arquipo",
            "Epafras",
        ],

        keyEvents: [
            "El saludo de Pablo a Filemón",
            "La gratitud por la fe y el amor de Filemón",
            "La petición en favor de Onésimo",
            "La descripción de la transformación de Onésimo",
            "El llamado a recibirlo como hermano",
            "La disposición de Pablo a asumir cualquier deuda",
            "La confianza en la obediencia de Filemón",
            "Los saludos finales",
        ],

        keyThemes: [
            "Perdón",
            "Reconciliación",
            "Gracia",
            "Fraternidad",
            "Restauración",
            "Amor",
            "Transformación",
        ],

        featuredVerse: {
            reference: "Filemón 1:16",
            text:
                "No ya como esclavo, sino como más que esclavo, como hermano amado.",
        },

        suggestedStart: "Filemón 1",
    },
    // =====================================================
    // CARTAS GENERALES
    // =====================================================

    {
        id: "nt-19",
        slug: "hebreos",
        name: "Hebreos",
        testament: "Nuevo Testamento",
        group: "Cartas generales",
        chapters: 13,

        theme:
            "La superioridad de Jesucristo y la perseverancia en la fe.",

        description: [
            "Hebreos presenta a Jesucristo como superior a los ángeles, a Moisés, al sacerdocio levítico y a los sacrificios del antiguo pacto. Jesús es mostrado como el Hijo de Dios, el gran sumo sacerdote y el mediador de un pacto mejor.",
            "La carta anima a los creyentes a no abandonar su fe en medio de las dificultades. También destaca la importancia de acercarse a Dios con confianza, perseverar y seguir el ejemplo de quienes vivieron por fe.",
        ],

        keyCharacters: [
            "Jesucristo",
            "Moisés",
            "Aarón",
            "Melquisedec",
            "Abraham",
            "Sara",
            "Los héroes de la fe",
            "Los creyentes hebreos",
        ],

        keyEvents: [
            "La presentación de Cristo como revelación definitiva",
            "La superioridad de Jesús sobre los ángeles",
            "La comparación entre Jesús y Moisés",
            "La advertencia contra la incredulidad",
            "La presentación de Jesús como sumo sacerdote",
            "La explicación del sacerdocio de Melquisedec",
            "La enseñanza sobre el nuevo pacto",
            "La explicación del sacrificio perfecto de Cristo",
            "La galería de los héroes de la fe",
            "El llamado a correr con perseverancia",
            "Las instrucciones finales para la vida cristiana",
        ],

        keyThemes: [
            "Superioridad de Cristo",
            "Nuevo pacto",
            "Sacerdocio",
            "Sacrificio",
            "Fe",
            "Perseverancia",
            "Esperanza",
        ],

        featuredVerse: {
            reference: "Hebreos 4:16",
            text:
                "Acerquémonos, pues, confiadamente al trono de la gracia, para alcanzar misericordia.",
        },

        suggestedStart: "Hebreos 4 y 11",
    },

    {
        id: "nt-20",
        slug: "santiago",
        name: "Santiago",
        testament: "Nuevo Testamento",
        group: "Cartas generales",
        chapters: 5,

        theme:
            "Una fe auténtica demostrada mediante acciones y una vida transformada.",

        description: [
            "Santiago presenta enseñanzas prácticas para la vida cristiana. La carta aborda las pruebas, la tentación, el uso de las palabras, la sabiduría, las riquezas, la oración y la manera de tratar a otras personas.",
            "El autor enseña que la verdadera fe no se limita a palabras o conocimientos, sino que se demuestra mediante acciones concretas. Los creyentes son llamados a vivir con paciencia, humildad, dominio propio y compasión.",
        ],

        keyCharacters: [
            "Santiago",
            "Los creyentes dispersos",
            "Abraham",
            "Rahab",
            "Job",
            "Elías",
            "Los ricos opresores",
        ],

        keyEvents: [
            "La enseñanza sobre las pruebas",
            "La explicación del origen de la tentación",
            "El llamado a ser hacedores de la Palabra",
            "La condena del favoritismo",
            "La relación entre la fe y las obras",
            "La advertencia sobre el uso de la lengua",
            "La comparación entre la sabiduría terrenal y celestial",
            "La corrección del orgullo",
            "La denuncia contra los ricos injustos",
            "La enseñanza sobre la paciencia y la oración",
        ],

        keyThemes: [
            "Fe práctica",
            "Obras",
            "Sabiduría",
            "Palabras",
            "Pruebas",
            "Oración",
            "Justicia",
        ],

        featuredVerse: {
            reference: "Santiago 1:22",
            text:
                "Sed hacedores de la palabra, y no tan solamente oidores.",
        },

        suggestedStart: "Santiago 1–2",
    },

    {
        id: "nt-21",
        slug: "1-pedro",
        name: "1 Pedro",
        testament: "Nuevo Testamento",
        group: "Cartas generales",
        chapters: 5,

        theme:
            "La esperanza y la fidelidad en medio del sufrimiento.",

        description: [
            "Primera de Pedro fue escrita para creyentes que enfrentaban rechazo, dificultades y persecución. Pedro les recuerda que poseen una esperanza viva gracias a la resurrección de Jesucristo.",
            "La carta anima a responder al sufrimiento con una conducta santa, humilde y llena de esperanza. Los creyentes son presentados como pueblo de Dios, llamados a reflejar su carácter y confiar en Él durante las pruebas.",
        ],

        keyCharacters: [
            "Pedro",
            "Jesucristo",
            "Silvano",
            "Marcos",
            "Los creyentes dispersos",
            "Los ancianos de la iglesia",
        ],

        keyEvents: [
            "La presentación de la esperanza viva",
            "El llamado a vivir en santidad",
            "La descripción de los creyentes como piedras vivas",
            "La enseñanza sobre el pueblo de Dios",
            "Las instrucciones frente a las autoridades",
            "El ejemplo de Cristo en el sufrimiento",
            "Las enseñanzas para esposos y esposas",
            "El llamado a responder con bendición",
            "La exhortación a servir con los dones recibidos",
            "Las instrucciones a los ancianos",
            "El llamado a resistir firmes en la fe",
        ],

        keyThemes: [
            "Esperanza",
            "Sufrimiento",
            "Santidad",
            "Identidad",
            "Perseverancia",
            "Humildad",
            "Servicio",
        ],

        featuredVerse: {
            reference: "1 Pedro 5:7",
            text:
                "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.",
        },

        suggestedStart: "1 Pedro 1–2",
    },

    {
        id: "nt-22",
        slug: "2-pedro",
        name: "2 Pedro",
        testament: "Nuevo Testamento",
        group: "Cartas generales",
        chapters: 3,

        theme:
            "El crecimiento espiritual y la defensa frente a las falsas enseñanzas.",

        description: [
            "Segunda de Pedro anima a los creyentes a crecer en el conocimiento de Jesucristo y desarrollar cualidades como la fe, la virtud, el dominio propio, la paciencia y el amor.",
            "La carta también advierte sobre falsos maestros que introducen enseñanzas destructivas. Pedro recuerda que Dios cumplirá sus promesas y que el regreso de Cristo debe motivar una vida santa y responsable.",
        ],

        keyCharacters: [
            "Pedro",
            "Jesucristo",
            "Los creyentes",
            "Los falsos maestros",
            "Noé",
            "Lot",
            "Balaam",
            "Pablo",
        ],

        keyEvents: [
            "El llamado a crecer en las virtudes cristianas",
            "El recuerdo de la transfiguración",
            "La explicación del origen de la profecía",
            "La advertencia contra los falsos maestros",
            "Los ejemplos del juicio de Dios",
            "La denuncia de la corrupción moral",
            "La advertencia sobre los burladores",
            "La enseñanza sobre el día del Señor",
            "El llamado a vivir en santidad",
            "La recomendación de las cartas de Pablo",
        ],

        keyThemes: [
            "Crecimiento espiritual",
            "Conocimiento de Cristo",
            "Falsas enseñanzas",
            "Juicio",
            "Regreso de Cristo",
            "Santidad",
            "Perseverancia",
        ],

        featuredVerse: {
            reference: "2 Pedro 3:9",
            text:
                "El Señor no retarda su promesa, sino que es paciente para con nosotros.",
        },

        suggestedStart: "2 Pedro 1",
    },

    {
        id: "nt-23",
        slug: "1-juan",
        name: "1 Juan",
        testament: "Nuevo Testamento",
        group: "Cartas generales",
        chapters: 5,

        theme:
            "La seguridad de la salvación, el amor y la comunión con Dios.",

        description: [
            "Primera de Juan fue escrita para fortalecer la seguridad espiritual de los creyentes y protegerlos de enseñanzas falsas acerca de Jesucristo. Juan enfatiza que Jesús vino verdaderamente en carne y que la vida eterna se encuentra en Él.",
            "La carta enseña que una relación auténtica con Dios se manifiesta mediante la obediencia, el amor hacia los demás y el rechazo del pecado. También recuerda que Dios es luz y que Dios es amor.",
        ],

        keyCharacters: [
            "Juan",
            "Jesucristo",
            "Dios Padre",
            "El Espíritu Santo",
            "Los creyentes",
            "Los falsos maestros",
            "Caín",
        ],

        keyEvents: [
            "El testimonio sobre la Palabra de vida",
            "La enseñanza sobre caminar en la luz",
            "La promesa del perdón de los pecados",
            "La presentación de Cristo como abogado",
            "El mandamiento de amar a los hermanos",
            "La advertencia contra amar al mundo",
            "La explicación sobre los anticristos",
            "La enseñanza sobre los hijos de Dios",
            "El llamado a probar los espíritus",
            "La declaración de que Dios es amor",
            "La seguridad de la vida eterna",
        ],

        keyThemes: [
            "Amor",
            "Comunión",
            "Obediencia",
            "Verdad",
            "Seguridad",
            "Vida eterna",
            "Luz",
        ],

        featuredVerse: {
            reference: "1 Juan 4:19",
            text:
                "Nosotros le amamos a él, porque él nos amó primero.",
        },

        suggestedStart: "1 Juan 1 y 4",
    },
    {
        id: "nt-24",
        slug: "2-juan",
        name: "2 Juan",
        testament: "Nuevo Testamento",
        group: "Cartas generales",
        chapters: 1,

        theme:
            "La verdad, el amor y la protección frente a las falsas enseñanzas.",

        description: [
            "Segunda de Juan es una carta breve dirigida a una comunidad cristiana representada como la señora elegida y sus hijos. Juan expresa su alegría al saber que algunos de sus miembros continúan caminando en la verdad.",
            "La carta une el amor con la obediencia y advierte sobre personas que niegan la verdadera identidad de Jesucristo. Los creyentes son llamados a permanecer firmes en la enseñanza recibida y a no apoyar a quienes difunden doctrinas engañosas.",
        ],

        keyCharacters: [
            "Juan",
            "La señora elegida",
            "Sus hijos",
            "Los creyentes",
            "Los engañadores",
        ],

        keyEvents: [
            "El saludo a la señora elegida",
            "La alegría por quienes caminan en la verdad",
            "El recordatorio del mandamiento del amor",
            "La advertencia contra los engañadores",
            "La enseñanza sobre permanecer en la doctrina de Cristo",
            "La instrucción de no apoyar falsas enseñanzas",
            "La esperanza de una visita personal",
            "El saludo final",
        ],

        keyThemes: [
            "Verdad",
            "Amor",
            "Obediencia",
            "Discernimiento",
            "Falsas enseñanzas",
            "Fidelidad",
            "Comunión",
        ],

        featuredVerse: {
            reference: "2 Juan 1:6",
            text:
                "Y este es el amor, que andemos según sus mandamientos.",
        },

        suggestedStart: "2 Juan 1",
    },

    {
        id: "nt-25",
        slug: "3-juan",
        name: "3 Juan",
        testament: "Nuevo Testamento",
        group: "Cartas generales",
        chapters: 1,

        theme:
            "La hospitalidad, el servicio y el buen testimonio cristiano.",

        description: [
            "Tercera de Juan es una carta personal dirigida a Gayo, un creyente reconocido por su fidelidad y hospitalidad. Juan lo felicita por apoyar a los hermanos que viajaban anunciando el evangelio.",
            "La carta también contrasta la conducta de Gayo y Demetrio con la actitud orgullosa de Diótrefes, quien rechazaba la autoridad de Juan y se negaba a recibir a otros creyentes. El libro enseña la importancia de apoyar el bien y cultivar un testimonio digno.",
        ],

        keyCharacters: [
            "Juan",
            "Gayo",
            "Diótrefes",
            "Demetrio",
            "Los hermanos viajeros",
            "La iglesia local",
        ],

        keyEvents: [
            "El saludo y la oración por Gayo",
            "La alegría por su fidelidad",
            "El elogio de su hospitalidad",
            "La recomendación de apoyar a los obreros cristianos",
            "La denuncia de la conducta de Diótrefes",
            "La expulsión de creyentes por parte de Diótrefes",
            "La recomendación de imitar lo bueno",
            "El buen testimonio de Demetrio",
            "La promesa de una visita",
        ],

        keyThemes: [
            "Hospitalidad",
            "Servicio",
            "Verdad",
            "Buen testimonio",
            "Orgullo",
            "Liderazgo",
            "Apoyo misionero",
        ],

        featuredVerse: {
            reference: "3 Juan 1:4",
            text:
                "No tengo yo mayor gozo que este, el oír que mis hijos andan en la verdad.",
        },

        suggestedStart: "3 Juan 1",
    },

    {
        id: "nt-26",
        slug: "judas",
        name: "Judas",
        testament: "Nuevo Testamento",
        group: "Cartas generales",
        chapters: 1,

        theme:
            "La defensa de la fe frente a las falsas enseñanzas.",

        description: [
            "Judas escribe para advertir a los creyentes acerca de personas que se habían infiltrado en la comunidad y distorsionaban la gracia de Dios para justificar una conducta inmoral.",
            "La carta utiliza diversos ejemplos del Antiguo Testamento para mostrar que Dios juzga la rebelión y la corrupción. Al mismo tiempo, anima a los creyentes a mantenerse firmes, crecer en la fe, orar y mostrar misericordia a quienes tienen dudas.",
        ],

        keyCharacters: [
            "Judas",
            "Jesucristo",
            "Los creyentes",
            "Los falsos maestros",
            "Miguel el arcángel",
            "Caín",
            "Balaam",
            "Coré",
            "Enoc",
        ],

        keyEvents: [
            "El llamado a defender la fe",
            "La advertencia sobre personas infiltradas",
            "El recuerdo del juicio sobre Israel",
            "La referencia a los ángeles rebeldes",
            "El ejemplo de Sodoma y Gomorra",
            "La disputa de Miguel con el diablo",
            "La comparación con Caín, Balaam y Coré",
            "La profecía de Enoc",
            "La advertencia sobre los burladores",
            "El llamado a edificarse en la fe",
            "La instrucción de mostrar misericordia",
            "La doxología final",
        ],

        keyThemes: [
            "Defensa de la fe",
            "Falsas enseñanzas",
            "Juicio",
            "Perseverancia",
            "Misericordia",
            "Discernimiento",
            "Fidelidad",
        ],

        featuredVerse: {
            reference: "Judas 1:3",
            text:
                "Que contendáis ardientemente por la fe que ha sido una vez dada a los santos.",
        },

        suggestedStart: "Judas 1",
    },
    // =====================================================
    // LIBRO PROFÉTICO
    // =====================================================

    {
        id: "nt-27",
        slug: "apocalipsis",
        name: "Apocalipsis",
        testament: "Nuevo Testamento",
        group: "Libro profético",
        chapters: 22,

        theme:
            "La victoria final de Jesucristo y la restauración de todas las cosas.",

        description: [
            "Apocalipsis contiene las visiones que Juan recibió mientras se encontraba en la isla de Patmos. El libro comienza con mensajes dirigidos a siete iglesias y continúa mostrando escenas simbólicas relacionadas con el conflicto entre el bien y el mal.",
            "A pesar de sus imágenes de juicio, persecución y sufrimiento, el mensaje central del libro es de esperanza. Jesucristo aparece como el Rey victorioso que derrota definitivamente el mal, juzga con justicia y establece una nueva creación donde Dios habita con su pueblo.",
        ],

        keyCharacters: [
            "Jesucristo",
            "Juan",
            "Dios Padre",
            "El Espíritu Santo",
            "Los siete ángeles",
            "Los veinticuatro ancianos",
            "El Cordero",
            "El dragón",
            "La bestia",
            "El falso profeta",
        ],

        keyEvents: [
            "La visión de Cristo glorificado",
            "Los mensajes a las siete iglesias",
            "La visión del trono de Dios",
            "La aparición del Cordero",
            "La apertura de los siete sellos",
            "El sonido de las siete trompetas",
            "El conflicto entre la mujer y el dragón",
            "La aparición de las bestias",
            "El derramamiento de las siete copas",
            "La caída de Babilonia",
            "El regreso victorioso de Cristo",
            "La derrota final del mal",
            "El juicio ante el gran trono blanco",
            "La creación de un cielo nuevo y una tierra nueva",
            "La llegada de la nueva Jerusalén",
        ],

        keyThemes: [
            "Victoria de Cristo",
            "Juicio",
            "Perseverancia",
            "Adoración",
            "Reino de Dios",
            "Esperanza",
            "Nueva creación",
        ],

        featuredVerse: {
            reference: "Apocalipsis 21:4",
            text:
                "Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor.",
        },

        suggestedStart: "Apocalipsis 1 y 21–22",
    },
];

// Exporta el arreglo para poder utilizarlo en otros archivos.
export default newTestamentBooks;