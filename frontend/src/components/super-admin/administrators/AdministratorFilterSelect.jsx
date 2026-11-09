// Selector personalizado para los filtros de la página Administradores.
// La lista se dibuja dentro de la PWA, evitando el menú rectangular del navegador.
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import "../../../styles/components/super-admin/administrators/AdministratorsFilterSelect.css";

function AdministratorFilterSelect({ label, value, options, onChange, icon: Icon }) {
  // Controlamos la apertura del menú sin modificar el filtro seleccionado.
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const listId = useId();

  // Buscamos el texto visible del filtro actualmente aplicado.
  const currentOption = options.find((item) => item.value === value) || options[0];
  const selectedIndex = Math.max(0, options.findIndex((item) => item.value === value));

  // Cerramos el menú al hacer clic fuera del componente.
  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [open]);

  // Al abrir el menú, situamos el foco en la opción seleccionada.
  useEffect(() => {
    if (open) optionRefs.current[selectedIndex]?.focus();
  }, [open, selectedIndex]);

  // Seleccionar una opción actualiza el filtro y devuelve el foco al botón.
  const chooseOption = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Compatibilidad con Escape, flechas, Inicio y Fin.
  const handleOptionKeyDown = (event, index) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      optionRefs.current[(index + step + options.length) % options.length]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      optionRefs.current[event.key === "Home" ? 0 : options.length - 1]?.focus();
    } else if (event.key === "Tab") {
      // La tecla Tab conserva el desplazamiento natural entre controles.
      setOpen(false);
    }
  };

  return (
    <div className="admin-filter-select" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`admin-filter-select__trigger${open ? " admin-filter-select__trigger--open" : ""}`}
        aria-label={`${label}: ${currentOption.label}`}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            setOpen(false);
          }
        }}
      >
        {Icon && <Icon size={17} aria-hidden="true" className="admin-filter-select__prefix" />}
        <span className="admin-filter-select__text">{currentOption.label}</span>
        <ChevronDown size={17} aria-hidden="true" className="admin-filter-select__chevron" />
      </button>

      {open && (
        <div id={listId} className="admin-filter-select__menu" role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              ref={(element) => { optionRefs.current[index] = element; }}
              type="button"
              role="option"
              aria-selected={option.value === value}
              tabIndex={-1}
              key={option.value}
              className={`admin-filter-select__option${option.value === value ? " admin-filter-select__option--selected" : ""}`}
              onClick={() => chooseOption(option.value)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdministratorFilterSelect;
