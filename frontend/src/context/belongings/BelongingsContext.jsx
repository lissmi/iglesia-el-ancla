// =========================================================
// CONTEXTO DEL INVENTARIO DE BIENES - MONGODB
// Compartido por Inventario, Movimientos y Resumen general.
// Ya no importa datos ficticios ni calcula IDs en el navegador.
// =========================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  listBelongings, createBelongingRequest, updateBelongingRequest,
  deleteBelongingRequest, createBelongingMovementRequest,
  updateBelongingMovementRequest, deleteBelongingMovementRequest,
  belongingsApiError,
} from "../../services/belongingsApi";

const BelongingsContext = createContext(null);

export function BelongingsProvider({ children }) {
  const [belongings, setBelongings] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Siempre refrescamos las tres pantallas desde la misma fuente MongoDB.
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listBelongings();
      setBelongings(result.belongings || []);
      setMovements(result.movements || []);
      return result;
    } catch (cause) {
      setError(belongingsApiError(cause));
      throw cause;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // El efecto captura errores para evitar una promesa no controlada.
    reload().catch(() => {});
  }, [reload]);

  // Una mutación espera confirmación del backend antes de cerrar un formulario.
  const run = useCallback(async (request) => {
    if (busy) throw new Error("Hay otra operación en curso");
    setBusy(true);
    setError("");
    try {
      const result = await request();
      // Si falla solamente la recarga, informamos al usuario, sin reintentar el POST.
      try { await reload(); }
      catch { setError("El cambio se guardó, pero no pudimos actualizar la lista. Pulsa Actualizar."); }
      return result;
    } catch (cause) {
      const message = belongingsApiError(cause);
      setError(message);
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  }, [busy, reload]);

  const createBelonging = useCallback((data) => run(() => createBelongingRequest(data)), [run]);
  const updateBelonging = useCallback((id, data, version) => run(() => updateBelongingRequest(id, data, version)), [run]);
  const deleteBelonging = useCallback((id) => run(() => deleteBelongingRequest(id)), [run]);
  const registerMovement = useCallback((data) => run(() => createBelongingMovementRequest(data)), [run]);
  const updateMovement = useCallback((id, data) => run(() => updateBelongingMovementRequest(id, data)), [run]);
  const deleteMovement = useCallback((id) => run(() => deleteBelongingMovementRequest(id)), [run]);

  const statistics = useMemo(() => ({
    totalRecords: belongings.length,
    totalUnits: belongings.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    totalCategories: new Set(belongings.map((item) => item.categoryId)).size,
    totalMovements: movements.length,
  }), [belongings, movements]);

  const value = useMemo(() => ({
    belongings, movements, loading, busy, error, reload, statistics,
    createBelonging, updateBelonging, deleteBelonging,
    registerMovement, updateMovement, deleteMovement,
  }), [belongings, movements, loading, busy, error, reload, statistics,
    createBelonging, updateBelonging, deleteBelonging,
    registerMovement, updateMovement, deleteMovement]);

  return <BelongingsContext.Provider value={value}>{children}</BelongingsContext.Provider>;
}

export function useBelongings() {
  const context = useContext(BelongingsContext);
  if (!context) throw new Error("useBelongings necesita BelongingsProvider");
  return context;
}
