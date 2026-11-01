import { Boxes, Plus } from "lucide-react";
import "../../../styles/components/administration/basicSupplies/BasicSuppliesHeader.css";

// =========================================================
// ENCABEZADO DEL MÓDULO DE INSUMOS BÁSICOS
// =========================================================

// onAddSupply: función que abre el formulario
// para registrar un nuevo insumo.

function BasicSuppliesHeader({
    onAddSupply,
}) {

    return (

        <header className="basic-supplies__header">

            <div className="basic-supplies__header-content">

                

                <div className="basic-supplies__title-row">

                    <div className="basic-supplies__title-icon">
                        <Boxes
                            size={29}
                            aria-hidden="true"
                        />
                    </div>

                    <div>

                        <h1>
                            Insumos básicos
                        </h1>

                        <p>
                            Administra el inventario,
                            las necesidades y el
                            abastecimiento de la iglesia.
                        </p>

                    </div>

                </div>

            </div>

            <button
                type="button"
                className="basic-supplies__primary-button"
                onClick={onAddSupply}
            >
                <Plus size={18} aria-hidden="true" />

                Nuevo insumo
            </button>

        </header>

    );
}

export default BasicSuppliesHeader;




