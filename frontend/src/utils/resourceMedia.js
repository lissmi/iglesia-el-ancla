
/* =========================================================
   UTILIDADES PARA RECURSOS MULTIMEDIA
   ========================================================= */

export function getSafeResourceUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    try {
        const url = new URL(value.trim());

        return ["https:", "http:"].includes(url.protocol)
            ? url.href
            : null;
    } catch {
        return null;
    }
}

// =========================================================
// YOUTUBE
// =========================================================

export function getYouTubeVideoId(value) {
    const safeUrl = getSafeResourceUrl(value);

    if (!safeUrl) return null;

    const url = new URL(safeUrl);
    const hostname = url.hostname.toLowerCase();

    let videoId = null;

    if (
        hostname === "youtube.com" ||
        hostname === "www.youtube.com" ||
        hostname === "m.youtube.com" ||
        hostname === "music.youtube.com"
    ) {
        if (url.pathname === "/watch") {
            videoId = url.searchParams.get("v");
        } else {
            const parts = url.pathname.split("/").filter(Boolean);

            if (["shorts", "embed", "live"].includes(parts[0])) {
                videoId = parts[1];
            }
        }
    } else if (hostname === "youtu.be" || hostname === "www.youtu.be") {
        videoId = url.pathname.split("/").filter(Boolean)[0];
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(videoId || "")
        ? videoId
        : null;
}

export function getYouTubeThumbnail(value) {
    const videoId = getYouTubeVideoId(value);

    return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : null;
}

// =========================================================
// SPOTIFY
// =========================================================

export function getSpotifyEmbedUrl(value) {
    const safeUrl = getSafeResourceUrl(value);

    if (!safeUrl) return null;

    const url = new URL(safeUrl);
    const hostname = url.hostname.toLowerCase();

    if (
        hostname !== "open.spotify.com" &&
        hostname !== "www.open.spotify.com"
    ) {
        return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);

    // Permite enlaces internacionales, por ejemplo /intl-es/playlist/...
    const index = parts.findIndex((part) =>
        ["playlist", "album", "track", "episode", "show"].includes(part)
    );

    if (index === -1) return null;

    const type = parts[index];
    const id = parts[index + 1];

    if (!id || !/^[a-zA-Z0-9]+$/.test(id)) {
        return null;
    }

    return `https://open.spotify.com/embed/${type}/${id}`;
}
