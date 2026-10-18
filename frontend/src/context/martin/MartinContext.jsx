import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

// Estado compartido de demostración. No habilita servicios públicos ni GPT.
export const DEFAULT_MARTIN_SETTINGS = {
    enabled: false,
    audiences: { visitors: true, members: true },
    capabilities: {
        churchInformation: true,
        resourceSearch: true,
        biblicalGuidance: true,
        navigationHelp: true,
    },
    welcomeMessage:
        "¡Hola! Soy Martín, el asistente virtual de Iglesia El Ancla. Puedo ayudarte a conocer nuestra comunidad y encontrar recursos bíblicos. ¿En qué puedo ayudarte?",
    outOfScopeMessage:
        "Puedo ayudarte con información de Iglesia El Ancla y recursos bíblicos. ¿Te gustaría consultar alguna actividad o estudio?",
};

export const DEFAULT_MARTIN_SECURITY = {
    restrictToChurchTopics: true,
    rejectSensitiveRequests: true,
    blockPromptInjection: true,
    avoidPersonalData: true,
    visitorDailyLimit: 10,
    memberDailyLimit: 30,
    maxMessageLength: 500,
    maxConversationTurns: 12,
    logSecurityEvents: true,
    enableAbuseDetection: true,
    fallbackMessage:
        "Puedo ayudarte con información de Iglesia El Ancla y recursos bíblicos. ¿Qué te gustaría consultar?",
};

export const DEFAULT_MARTIN_KNOWLEDGE = [
    {
        id: "demo-1",
        title: "Horario del culto general",
        category: "institutional",
        audience: "public",
        status: "draft",
        question: "¿Cuándo es el culto general?",
        answer: "El culto general se realiza los domingos a las 11:00 horas.",
        source: "Horario institucional (verificar antes de publicar)",
    },
    {
        id: "demo-2",
        title: "Estudios bíblicos publicados",
        category: "resources",
        audience: "members",
        status: "draft",
        question: "¿Dónde encuentro los estudios bíblicos?",
        answer:
            "Puedes revisar los estudios y guías disponibles en la sección Recursos de la plataforma.",
        source: "Sección Recursos de la PWA (enlace pendiente)",
    },
];

const MartinContext = createContext(null);

const clone = (value) => JSON.parse(JSON.stringify(value));

function validateSettings(settings) {
    if (!settings || typeof settings !== "object") {
        throw new Error("La configuración de Martín no es válida.");
    }
    if (settings.enabled && !Object.values(settings.audiences || {}).some(Boolean)) {
        throw new Error("Selecciona al menos un tipo de usuario para habilitar a Martín.");
    }
    if (!String(settings.welcomeMessage || "").trim()) {
        throw new Error("El mensaje de bienvenida es obligatorio.");
    }
    if (!String(settings.outOfScopeMessage || "").trim()) {
        throw new Error("El mensaje fuera de alcance es obligatorio.");
    }
}

function validateSecurity(security) {
    if (!security || typeof security !== "object") {
        throw new Error("La configuración de seguridad no es válida.");
    }
    const ranges = {
        visitorDailyLimit: [1, 100],
        memberDailyLimit: [1, 200],
        maxMessageLength: [100, 2000],
        maxConversationTurns: [1, 30],
    };
    for (const [key, [min, max]] of Object.entries(ranges)) {
        if (!Number.isInteger(Number(security[key])) || Number(security[key]) < min || Number(security[key]) > max) {
            throw new Error(`El valor de ${key} debe estar entre ${min} y ${max}.`);
        }
    }
    if (!String(security.fallbackMessage || "").trim()) {
        throw new Error("El mensaje de rechazo es obligatorio.");
    }
}

export function MartinProvider({ children }) {
    const [settings, setSettings] = useState(() => clone(DEFAULT_MARTIN_SETTINGS));
    const [security, setSecurity] = useState(() => clone(DEFAULT_MARTIN_SECURITY));
    const [knowledgeEntries, setKnowledgeEntries] = useState(() => clone(DEFAULT_MARTIN_KNOWLEDGE));

    // Las métricas y los eventos permanecerán vacíos hasta disponer de backend.
    const [activityEvents] = useState([]);
    const [activityMetrics] = useState(null);

    const saveSettings = useCallback((nextSettings) => {
        validateSettings(nextSettings);
        setSettings(clone(nextSettings));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(clone(DEFAULT_MARTIN_SETTINGS));
    }, []);

    const saveSecurity = useCallback((nextSecurity) => {
        validateSecurity(nextSecurity);
        // Estas protecciones no pueden desactivarse desde la interfaz.
        setSecurity(clone({
            ...nextSecurity,
            rejectSensitiveRequests: true,
            avoidPersonalData: true,
        }));
    }, []);

    const resetSecurity = useCallback(() => {
        setSecurity(clone(DEFAULT_MARTIN_SECURITY));
    }, []);

    const addKnowledgeEntry = useCallback((entry) => {
        const id = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const created = { ...entry, id, status: entry.status || "draft" };
        setKnowledgeEntries((previous) => [created, ...previous]);
        return id;
    }, []);

    const updateKnowledgeEntry = useCallback((id, changes) => {
        setKnowledgeEntries((previous) => previous.map((entry) =>
            entry.id === id ? { ...entry, ...changes, id } : entry
        ));
    }, []);

    const deleteKnowledgeEntry = useCallback((id) => {
        setKnowledgeEntries((previous) => previous.filter((entry) => entry.id !== id));
    }, []);

    const overview = useMemo(() => ({
        // No indicar "activo" hasta que exista el backend público.
        status: "development",
        publicEnabled: settings.enabled && settings.audiences.visitors,
        membersEnabled: settings.enabled && settings.audiences.members,
        bibleEnabled: settings.enabled && settings.capabilities.biblicalGuidance,
        resourcesEnabled: settings.enabled && settings.capabilities.resourceSearch,
        todayRequests: null,
        monthRequests: null,
        estimatedCost: null,
        lastActivity: null,
    }), [settings]);

    const value = useMemo(() => ({
        settings,
        saveSettings,
        resetSettings,
        security,
        saveSecurity,
        resetSecurity,
        knowledgeEntries,
        addKnowledgeEntry,
        updateKnowledgeEntry,
        deleteKnowledgeEntry,
        activityEvents,
        activityMetrics,
        overview,
        isBackendConnected: false,
    }), [
        settings, saveSettings, resetSettings,
        security, saveSecurity, resetSecurity,
        knowledgeEntries, addKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry,
        activityEvents, activityMetrics, overview,
    ]);

    return <MartinContext.Provider value={value}>{children}</MartinContext.Provider>;
}

export function useMartin() {
    const context = useContext(MartinContext);
    if (!context) {
        throw new Error("useMartin debe utilizarse dentro de MartinProvider.");
    }
    return context;
}
