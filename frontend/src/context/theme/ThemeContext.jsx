// =========================================================
// TEMA GLOBAL - IGLESIA EL ANCLA
// Controlador compartido por las rutas públicas y privadas.
// =========================================================

// React administra el tema sin recargar la aplicación.
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";

// Esta clave se limita a la apariencia; no contiene datos personales.
const STORAGE_KEY = "el-ancla:theme:v1";

// El contexto permite que cualquier componente consulte el tema activo.
const ThemeContext = createContext(null);

// Recuperamos la preferencia guardada exclusivamente para esta pestaña.
function getInitialTheme() {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    return saved === "dark" || saved === "light" ? saved : "light";
  } catch {
    // Si el navegador bloquea el almacenamiento, la PWA sigue funcionando.
    return "light";
  }
}

// Envolvemos la PWA completa con una sola fuente de verdad visual.
export function ThemeProvider({ children }) {
  // La inicialización diferida evita lecturas repetidas de sessionStorage.
  const [theme, setTheme] = useState(getInitialTheme);

  // Aplicamos el atributo al elemento HTML, no a una página particular.
  // useLayoutEffect evita que React pinte primero el tema equivocado.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    // Actualizamos el color de la barra del navegador en teléfonos compatibles.
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#101c26" : "#f8f7f3");
    }

    // Guardamos solamente "light" o "dark" durante esta sesión.
    try {
      window.sessionStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // El almacenamiento privado puede estar deshabilitado: no interrumpimos.
    }
  }, [theme]);

  // Alternamos el tema usando el estado anterior para evitar condiciones de carrera.
  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  // Conservamos una referencia estable al objeto compartido.
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

  // Los componentes hijos comparten el mismo tema incluso al navegar.
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Único hook público para consultar o cambiar la apariencia global.
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe utilizarse dentro de ThemeProvider");
  }
  return context;
}
