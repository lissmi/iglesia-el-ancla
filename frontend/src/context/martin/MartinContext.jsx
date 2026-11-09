import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
} from "react";
import api from "../../services/api";

// Configuración inicial mientras se consulta la versión persistida del servidor.
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
    visitorDailyLimit: 0, // El público no realiza consultas a Gemini.
    memberDailyLimit: 10,
    adminDailyLimit: 20,
    abuseStrikeLimit: 3,
    abuseBlockMinutes: 30,
    maxMessageLength: 700,
    maxConversationTurns: 12,
    logSecurityEvents: true,
    enableAbuseDetection: true,
    fallbackMessage:
        "Puedo ayudarte con información de Iglesia El Ancla y recursos bíblicos. ¿Qué te gustaría consultar?",
};

export const DEFAULT_MARTIN_KNOWLEDGE = [];

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

export function MartinProvider({ children }) {
    const [settings, setSettings] = useState(() => clone(DEFAULT_MARTIN_SETTINGS));
    const [security, setSecurity] = useState(() => clone(DEFAULT_MARTIN_SECURITY));
    // Los contenidos se leen de MongoDB; no cargamos ejemplos que puedan confundirse con información real.
    const [knowledgeEntries, setKnowledgeEntries] = useState([]);
    const [knowledgeError, setKnowledgeError] = useState("");
    const [isKnowledgeLoading, setIsKnowledgeLoading] = useState(true);

    // Las métricas y los eventos permanecerán vacíos hasta disponer de backend.
    const [activityEvents, setActivityEvents] = useState([]);
    const [activityMetrics, setActivityMetrics] = useState(null);
    const [isBackendConnected, setIsBackendConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [backendError, setBackendError] = useState("");

    // El panel obtiene datos reales de un endpoint protegido para administradores.
    const refreshBackend = useCallback(async () => {
        try {
            const [configuration, activity, knowledge] = await Promise.all([
                api.get("/martin/admin/configuracion"),
                api.get("/martin/admin/actividad"),
                api.get("/martin/admin/conocimientos"),
            ]);
            setKnowledgeEntries(knowledge.data.data);
            setKnowledgeError("");
            const data = configuration.data.data;
            setSettings({
                enabled: data.enabled,
                audiences: data.audiences,
                capabilities: data.capabilities,
                welcomeMessage: data.welcomeMessage,
                outOfScopeMessage: data.outOfScopeMessage,
            });
            setSecurity(previous => ({
                ...previous,
                memberDailyLimit: data.memberDailyLimit,
                adminDailyLimit: data.adminDailyLimit,
                abuseStrikeLimit: data.abuseStrikeLimit,
                abuseBlockMinutes: data.abuseBlockMinutes,
                maxMessageLength: data.maxMessageLength,
            }));
            setActivityEvents(activity.data.data.events);
            setActivityMetrics(activity.data.data.metrics);
            setIsBackendConnected(true);
            setBackendError("");
        } catch (error) {
            setIsBackendConnected(false);
            const message = error.response?.data?.message || "No fue posible cargar los datos de Martín.";
            setBackendError(message);
            setKnowledgeError(message);
        } finally { setIsLoading(false); setIsKnowledgeLoading(false); }
    }, []);

    useEffect(() => { refreshBackend(); }, [refreshBackend]);

    // Guardamos primero en MongoDB y después sincronizamos el estado compartido.
    const saveSettings = useCallback(async (nextSettings) => {
        validateSettings(nextSettings);
        const response = await api.patch("/martin/admin/configuracion", nextSettings);
        const data = response.data.data;
        setSettings({ enabled: data.enabled, audiences: data.audiences,
            capabilities: data.capabilities, welcomeMessage: data.welcomeMessage,
            outOfScopeMessage: data.outOfScopeMessage });
        return data;
    }, []);

    const resetSettings = useCallback(() => {}, []); // Sin borrado automático de configuración persistente.

    // Las protecciones esenciales no se pueden desactivar desde este panel.
    const saveSecurity = useCallback(async (nextSecurity) => {
        const numeric = ["memberDailyLimit", "adminDailyLimit", "abuseStrikeLimit", "abuseBlockMinutes", "maxMessageLength"];
        const payload = Object.fromEntries(numeric.map(key => [key, Number(nextSecurity[key])]));
        const response = await api.patch("/martin/admin/configuracion", payload);
        const data = response.data.data;
        setSecurity(previous => ({ ...previous, ...payload,
            rejectSensitiveRequests: true, avoidPersonalData: true, blockPromptInjection: true }));
        return data;
    }, []);

    const resetSecurity = useCallback(() => {}, []);

    // Cada operación espera la respuesta del servidor antes de cambiar la lista visible.
    const addKnowledgeEntry = useCallback(async (entry) => {
        const result = await api.post("/martin/admin/conocimientos", entry);
        setKnowledgeEntries((previous) => [result.data.data, ...previous]);
        return result.data.data.id;
    }, []);

    const updateKnowledgeEntry = useCallback(async (id, changes) => {
        const result = await api.patch(`/martin/admin/conocimientos/${encodeURIComponent(id)}`, changes);
        setKnowledgeEntries((previous) => previous.map((entry) => entry.id === id ? result.data.data : entry));
        return result.data.data;
    }, []);

    const deleteKnowledgeEntry = useCallback(async (id) => {
        await api.delete(`/martin/admin/conocimientos/${encodeURIComponent(id)}`);
        setKnowledgeEntries((previous) => previous.filter((entry) => entry.id !== id));
    }, []);

    const overview = useMemo(() => ({
        // No indicar "activo" hasta que exista el backend público.
        status: isBackendConnected ? (settings.enabled ? "active" : "inactive") : "development",
        publicEnabled: settings.enabled && settings.audiences.visitors,
        membersEnabled: settings.enabled && settings.audiences.members,
        bibleEnabled: settings.enabled && settings.capabilities.biblicalGuidance,
        resourcesEnabled: settings.enabled && settings.capabilities.resourceSearch,
        todayRequests: activityMetrics?.todayRequests ?? null,
        monthRequests: activityMetrics?.monthRequests ?? null,
        estimatedCost: null,
        lastActivity: null,
    }), [settings, activityMetrics, isBackendConnected]);

    const value = useMemo(() => ({
        settings,
        saveSettings,
        resetSettings,
        security,
        saveSecurity,
        resetSecurity,
        knowledgeEntries,
        knowledgeError, isKnowledgeLoading,
        addKnowledgeEntry,
        updateKnowledgeEntry,
        deleteKnowledgeEntry,
        activityEvents,
        activityMetrics,
        overview,
        isBackendConnected, isLoading, backendError, refreshBackend,
    }), [
        settings, saveSettings, resetSettings,
        security, saveSecurity, resetSecurity,
        knowledgeEntries, knowledgeError, isKnowledgeLoading, addKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry,
        activityEvents, activityMetrics, overview,
        isBackendConnected, isLoading, backendError, refreshBackend,
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
