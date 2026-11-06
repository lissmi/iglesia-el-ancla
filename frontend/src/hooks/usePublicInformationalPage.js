// =========================================================
// HOOK PARA PÁGINAS INFORMATIVAS PÚBLICAS - IGLESIA EL ANCLA
// Devuelve exclusivamente la versión publicada por administración.
// =========================================================

import { useEffect, useState } from "react";
import { getPublishedInformationalPage, resolveInformationalImages } from "../services/informationalPagesApi";

export default function usePublicInformationalPage(slug, fallbackContent = null) {
  // Conserva el contenido original mientras se consulta el backend.
  const [content, setContent] = useState(fallbackContent);
  const [isLoading, setIsLoading] = useState(true);
  const [publishedAt, setPublishedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    setContent(fallbackContent);

    getPublishedInformationalPage(slug)
      .then(({ content: published, publishedAt: date }) => {
        if (!active) return;
        if (published) setContent(resolveInformationalImages(slug, published));
        setPublishedAt(date || null);
      })
      .catch((requestError) => {
        if (active) setError(requestError);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    // No actualizamos React si el visitante cambió de ruta.
    return () => { active = false; };
  }, [slug, fallbackContent]);

  return { content, isLoading, publishedAt, error };
}
