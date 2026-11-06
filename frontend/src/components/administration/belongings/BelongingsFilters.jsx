// Filtros exclusivamente por nombre/código, categoría y estado.
import { Search, RotateCcw } from "lucide-react";
import "../../../styles/components/administration/belongings/BelongingsFilters.css";

function BelongingsFilters({
  search = "", category = "", condition = "", categories = [], conditions = [],
  onSearchChange, onCategoryChange, onConditionChange, onReset,
}) {
  return (
    <section className="belongings-filters" aria-label="Filtros del inventario">
      <div className="belongings-filters__search">
        <Search size={19} aria-hidden="true" />
        <input type="search" value={search} onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Buscar por nombre o código..." aria-label="Buscar bienes" />
      </div>
      <div className="belongings-filters__controls">
        <label className="belongings-filters__field">
          <span>Categoría</span>
          <select value={category} onChange={(e) => onCategoryChange?.(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="belongings-filters__field">
          <span>Estado</span>
          <select value={condition} onChange={(e) => onConditionChange?.(e.target.value)}>
            <option value="">Todos los estados</option>
            {conditions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <button type="button" className="belongings-filters__reset" onClick={() => onReset?.()} title="Limpiar filtros">
          <RotateCcw size={17} aria-hidden="true" /><span>Limpiar</span>
        </button>
      </div>
    </section>
  );
}
export default BelongingsFilters;
