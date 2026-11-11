// =========================================================
// SELECTOR GLOBAL DE TEMA - IGLESIA EL ANCLA
// Botón de solo icono; accesible con teclado y lector de pantalla.
// =========================================================

// Utilizamos los iconos disponibles en el proyecto.
import { Moon, Sun } from "lucide-react";

// Obtenemos el tema de un único contexto compartido en toda la PWA.
import { useTheme } from "../../context/theme/ThemeContext";

// Mantenemos los estilos del selector separados de los de cada página.
import "../../styles/components/theme/ThemeSwitcher.css";

function ThemeSwitcher() {
  // La preferencia se conserva en sessionStorage mediante ThemeContext.
  const { theme, toggleTheme } = useTheme();

  // El icono representa el tema ACTIVO; la etiqueta indica la acción siguiente.
  const isDark = theme === "dark";
  const actionLabel = isDark ? "Activar modo claro" : "Activar modo oscuro";

  return (
    <div className="el-ancla-theme-control" data-reading-ignore="true">
      <button
        className="el-ancla-theme-control__button"
        data-member-tour="theme-switcher"
        type="button"
        onClick={toggleTheme}
        aria-label={actionLabel}
        aria-pressed={isDark}
        title={actionLabel}
      >
        {/* Un único icono, sin ocupar espacio con texto visible. */}
        {isDark ? (
          <Moon size={21} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Sun size={21} strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export default ThemeSwitcher;
