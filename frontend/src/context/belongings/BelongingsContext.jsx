
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import {
    initialBelongings,
    initialBelongingsMovements,
} from "../../data/belongings/belongingsDemoData";

// =========================================================
// CONTEXTO DEL INVENTARIO DE BIENES
// IGLESIA EL ANCLA
// =========================================================

const BelongingsContext = createContext(null);

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

const getNextNumber = (records, field, prefix) => {

    return records.reduce((maximum, item) => {

        const value = String(item[field] || "");

        if (!value.startsWith(prefix)) {
            return maximum;
        }

        const number = Number(value.slice(prefix.length));

        return Number.isInteger(number)
            ? Math.max(maximum, number)
            : maximum;

    }, 0) + 1;
};

// =========================================================
// GENERAR IDENTIFICADORES
// =========================================================

const createIdentifiers = (records) => {

    const nextId = getNextNumber(
        records,
        "id",
        "BEL-"
    );

    const nextCode = getNextNumber(
        records,
        "code",
        "BIEN-"
    );

    return {
        id: `BEL-${String(nextId).padStart(3, "0")}`,
        code: `BIEN-${String(nextCode).padStart(4, "0")}`,
    };
};

// =========================================================
// OBTENER FECHA LOCAL
// FORMATO YYYY-MM-DD
// =========================================================

const getLocalDate = () => {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// =========================================================
// PROVEEDOR DEL INVENTARIO
// =========================================================

export function BelongingsProvider({ children }) {

    // =====================================================
    // ESTADOS COMPARTIDOS
    // =====================================================

    const [belongings, setBelongings] = useState(
        () => initialBelongings.map(
            (item) => ({ ...item })
        )
    );

    const [movements, setMovements] = useState(
        () => initialBelongingsMovements.map(
            (item) => ({ ...item })
        )
    );

    // =====================================================
    // REGISTRAR NUEVO BIEN
    // =====================================================

    const createBelonging = useCallback((formData) => {

        setBelongings((previous) => {

            const identifiers = createIdentifiers(previous);

            const createdBelonging = {
                ...formData,
                ...identifiers,
                image: null,
            };

            return [
                ...previous,
                createdBelonging,
            ];
        });

    }, []);

    // =====================================================
    // EDITAR BIEN DEL INVENTARIO
    // =====================================================

    const updateBelonging = useCallback((id, formData) => {

        setBelongings((previous) =>
            previous.map((item) => {

                if (item.id !== id) {
                    return item;
                }

                return {
                    ...item,
                    ...formData,

                    // Identificadores permanentes.
                    id: item.id,
                    code: item.code,
                };

            })
        );

    }, []);




    // =====================================================
    // ELIMINAR BIEN Y SUS MOVIMIENTOS ASOCIADOS
    // ELIMINACIÓN EN CASCADA
    // =====================================================

    const deleteBelonging = useCallback((id) => {

        // Verificar que el bien exista.

        const belongingExists = belongings.some(
            (item) => item.id === id
        );

        if (!belongingExists) {
            throw new Error(
                "El bien seleccionado no existe."
            );
        }

        // Eliminar el bien del inventario.

        setBelongings((previous) =>
            previous.filter(
                (item) => item.id !== id
            )
        );

        // Eliminar todos los movimientos asociados.

        setMovements((previous) =>
            previous.filter(
                (movement) =>
                    movement.belongingId !== id
            )
        );

    }, [belongings]);



    // =====================================================
    // REGISTRAR MOVIMIENTO DE INVENTARIO
    // =====================================================

    const registerMovement = useCallback((movementData) => {

        const {
            belongingId,
            type,
            destinationLocationId,
            condition,
            description,
            performedBy,
        } = movementData;

        // Buscar el bien seleccionado.

        const belonging = belongings.find(
            (item) => item.id === belongingId
        );

        if (!belonging) {
            throw new Error(
                "El bien seleccionado no existe."
            );
        }

        // Validar tipos de movimiento habilitados.

        if (!["transfer", "inspection"].includes(type)) {
            throw new Error(
                "Este tipo de movimiento todavía no está habilitado."
            );
        }

        // =================================================
        // VALIDAR TRASLADO
        // =================================================

        if (type === "transfer") {

            if (!destinationLocationId) {
                throw new Error(
                    "Debes seleccionar una ubicación de destino."
                );
            }

            if (
                destinationLocationId === belonging.locationId
            ) {
                throw new Error(
                    "La ubicación de destino debe ser diferente de la actual."
                );
            }
        }

        // =================================================
        // VALIDAR INSPECCIÓN
        // =================================================

        if (
            type === "inspection" &&
            !condition
        ) {
            throw new Error(
                "Debes indicar el estado del bien."
            );
        }

        // =================================================
        // VALIDAR INFORMACIÓN GENERAL
        // =================================================

        if (!description?.trim()) {
            throw new Error(
                "Debes ingresar una observación del movimiento."
            );
        }

        if (!performedBy?.trim()) {
            throw new Error(
                "Debes indicar quién realizó el movimiento."
            );
        }


        // =================================================
        // GENERAR IDENTIFICADOR DEL MOVIMIENTO
        // =================================================

        const nextNumber = getNextNumber(
            movements,
            "id",
            "MOV-"
        );

        const movement = {
            id: `MOV-${String(nextNumber).padStart(3, "0")}`,
            belongingId,
            type,
            quantity: belonging.quantity,
            date: getLocalDate(),
            description: description.trim(),
            performedBy: performedBy.trim(),

            ...(type === "transfer" && {
                originLocationId: belonging.locationId,
                destinationLocationId,
            }),

            ...(type === "inspection" && {
                previousCondition: belonging.condition,
                newCondition: condition,
            }),
        };

        // =================================================
        // ACTUALIZAR INFORMACIÓN DEL BIEN
        // =================================================

        setBelongings((previous) =>
            previous.map((item) => {

                if (item.id !== belongingId) {
                    return item;
                }

                if (type === "transfer") {

                    return {
                        ...item,
                        locationId: destinationLocationId,
                    };
                }

                if (type === "inspection") {

                    return {
                        ...item,
                        condition,
                    };
                }

                return item;

            })
        );

        // =================================================
        // GUARDAR MOVIMIENTO EN EL HISTORIAL
        // =================================================

        setMovements((previous) => [
            ...previous,
            movement,
        ]);

        return movement;

    }, [belongings, movements]);

    // =====================================================
    // EDITAR MOVIMIENTO Y SINCRONIZAR BIEN CUANDO CORRESPONDA
    // =====================================================

    const updateMovement = useCallback((id, formData) => {
        const movement = movements.find((item) => item.id === id);
        if (!movement) throw new Error("El movimiento seleccionado no existe.");

        const date = String(formData.date || "").trim();
        const performedBy = String(formData.performedBy || "").trim();
        const description = String(formData.description || "").trim();

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
        if (!match) throw new Error("Debes ingresar una fecha válida.");
        const parsed = new Date(`${date}T00:00:00`);
        if (Number.isNaN(parsed.getTime()) ||
            parsed.getFullYear() !== Number(match[1]) ||
            parsed.getMonth() + 1 !== Number(match[2]) ||
            parsed.getDate() !== Number(match[3])) {
            throw new Error("Debes ingresar una fecha válida.");
        }
        if (!performedBy) throw new Error("Debes indicar el responsable.");
        if (!description) throw new Error("Debes ingresar una observación.");

        const belonging = belongings.find((item) => item.id === movement.belongingId);
        if (!belonging) throw new Error("El bien asociado ya no existe.");

        const sameKind = movements.filter((item) =>
            item.belongingId === movement.belongingId && item.type === movement.type
        );
        const isLastOfKind = sameKind[sameKind.length - 1]?.id === id;

        let updatedMovement = { ...movement, date, performedBy, description };
        let belongingPatch = null;

        if (movement.type === "transfer") {
            const destinationLocationId = formData.destinationLocationId;
            if (!destinationLocationId || destinationLocationId === movement.originLocationId) {
                throw new Error("Selecciona un destino distinto al origen.");
            }
            if (destinationLocationId !== movement.destinationLocationId) {
                // Rechazar cambios que alteren la continuidad de movimientos posteriores.
                if (!isLastOfKind || belonging.locationId !== movement.destinationLocationId) {
                    throw new Error("No es posible cambiar el destino: existen movimientos posteriores o la ubicación actual ya fue modificada.");
                }
                updatedMovement.destinationLocationId = destinationLocationId;
                belongingPatch = { locationId: destinationLocationId };
            }
        }

        if (movement.type === "inspection") {
            const condition = formData.condition;
            if (!condition) throw new Error("Selecciona el estado registrado.");
            if (condition !== movement.newCondition) {
                if (!isLastOfKind || belonging.condition !== movement.newCondition) {
                    throw new Error("No es posible cambiar el estado: existen inspecciones posteriores o el estado actual ya fue modificado.");
                }
                updatedMovement.newCondition = condition;
                belongingPatch = { condition };
            }
        }

        setMovements((previous) => previous.map((item) =>
            item.id === id ? updatedMovement : item
        ));
        if (belongingPatch) {
            setBelongings((previous) => previous.map((item) =>
                item.id === movement.belongingId ? { ...item, ...belongingPatch } : item
            ));
        }
    }, [movements, belongings]);

    // =====================================================
    // ELIMINAR MOVIMIENTO SIN ELIMINAR EL BIEN
    // =====================================================

    const deleteMovement = useCallback((id) => {
        if (!movements.some((item) => item.id === id)) {
            throw new Error("El movimiento seleccionado no existe.");
        }
        setMovements((previous) => previous.filter((item) => item.id !== id));
    }, [movements]);

    // =====================================================
    // INDICADORES COMPARTIDOS
    // =====================================================

    const statistics = useMemo(() => {

        const totalRecords = belongings.length;

        const totalUnits = belongings.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

        const totalCategories = new Set(
            belongings.map(
                (item) => item.categoryId
            )
        ).size;

        return {
            totalRecords,
            totalUnits,
            totalCategories,
            totalMovements: movements.length,
        };

    }, [belongings, movements]);

    // =====================================================
    // VALORES DISPONIBLES EN EL CONTEXTO
    // =====================================================



    const contextValue = useMemo(() => ({
        belongings,
        movements,
        statistics,

        createBelonging,
        updateBelonging,
        deleteBelonging,

        registerMovement,
        updateMovement,
        deleteMovement,

    }), [
        belongings,
        movements,
        statistics,

        createBelonging,
        updateBelonging,
        deleteBelonging,

        registerMovement,
        updateMovement,
        deleteMovement,
    ]);



    return (
        <BelongingsContext.Provider value={contextValue}>
            {children}
        </BelongingsContext.Provider>
    );
}

// =========================================================
// HOOK PARA CONSUMIR EL CONTEXTO
// =========================================================

export function useBelongings() {

    const context = useContext(BelongingsContext);

    if (!context) {
        throw new Error(
            "useBelongings debe utilizarse dentro de BelongingsProvider."
        );
    }

    return context;
}
