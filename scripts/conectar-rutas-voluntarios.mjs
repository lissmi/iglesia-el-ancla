// =========================================================
// INSTALACIÓN DE RUTAS DEL VOLUNTARIADO - EJECUCIÓN UNA VEZ
// Ejecutar desde la raíz del repositorio: node scripts/conectar-rutas-voluntarios.mjs
// =========================================================
import fs from "node:fs";
import path from "node:path";

// Buscamos las rutas reales desde la raíz del proyecto.
const root = process.cwd();
const backendPath = path.join(root, "backend/src/app.js");
const frontendPath = path.join(root, "frontend/src/App.js");
const headerPath = path.join(root, "frontend/src/components/member/layout/MemberHeader.jsx");

function readExisting(file) {
  if (!fs.existsSync(file)) throw new Error(`No se encontró ${path.relative(root, file)}. Ejecuta este script desde la raíz del proyecto.`);
  return fs.readFileSync(file, "utf8");
}

// Leemos antes de tocar archivos para minimizar cambios parciales.
let backend = readExisting(backendPath);
let frontend = readExisting(frontendPath);
let header = fs.existsSync(headerPath) ? fs.readFileSync(headerPath, "utf8") : null;

// =========================================================
// APP EXPRESS: IMPORT + MOUNT ANTES DEL 404
// =========================================================
if (!backend.includes('import volunteerRoutes from "./routes/volunteerRoutes.js";')) {
  const importAnchor = 'import prayerRequestRoutes from "./routes/prayerRequestRoutes.js";';
  if (!backend.includes(importAnchor)) throw new Error("No se encontró la importación de prayerRequestRoutes en backend/src/app.js");
  backend = backend.replace(importAnchor, `${importAnchor}\n\n// CRUD de equipos, turnos y confirmaciones de voluntarios.\nimport volunteerRoutes from "./routes/volunteerRoutes.js";`);
}
if (!backend.includes('app.use("/api/volunteers", volunteerRoutes);')) {
  const mountAnchor = 'app.use("/api/prayer-requests", prayerRequestRoutes);';
  if (!backend.includes(mountAnchor)) throw new Error("No se encontró el montaje de peticiones de oración en backend/src/app.js");
  backend = backend.replace(mountAnchor, `${mountAnchor}\n\n// Acceso a turnos de servicio. El router comprueba sesión y roles.\napp.use("/api/volunteers", volunteerRoutes);`);
}

// =========================================================
// REACT: IMPORT + RUTA DENTRO DE /member
// =========================================================
if (!frontend.includes('import MemberVolunteerAssignments from "./pages/member/MemberVolunteerAssignments";')) {
  const importAnchor = 'import MemberPrayerRequests from "./pages/member/MemberPrayerRequests";';
  if (!frontend.includes(importAnchor)) throw new Error("No se encontró la importación MemberPrayerRequests en frontend/src/App.js");
  frontend = frontend.replace(importAnchor, `${importAnchor}\n// Página privada para confirmar turnos de servicio.\nimport MemberVolunteerAssignments from "./pages/member/MemberVolunteerAssignments";`);
}
if (!frontend.includes('path="voluntariado" element={<MemberVolunteerAssignments />}')) {
  // Esta línea debe ubicarse dentro de las rutas anidadas de /member.
  const candidate = /(<Route\s+path="peticiones-oracion"\s+element=\{<MemberPrayerRequests\s*\/>\}\s*\/\s*>)/;
  if (!candidate.test(frontend)) throw new Error("No se encontró la ruta de peticiones de oración en frontend/src/App.js");
  frontend = frontend.replace(candidate, '$1\n              <Route path="voluntariado" element={<MemberVolunteerAssignments />} />');
}

// =========================================================
// MENÚ PERSONAL: ENLACE A MIS TURNOS (SI USA LA VERSIÓN ACTUAL)
// =========================================================
let headerModified = false;
if (header && !header.includes('to: "/member/voluntariado"')) {
  const navAnchor = '{ label: "Mis actividades", to: "/member/eventos", icon: CalendarDays },';
  if (header.includes(navAnchor)) {
    header = header.replace(navAnchor, `${navAnchor}\n  { label: "Mis turnos", to: "/member/voluntariado", icon: CalendarDays },`);
    headerModified = true;
  } else {
    console.log("Aviso: menú personal distinto. Añade manualmente el acceso a /member/voluntariado.");
  }
}

// Guardamos únicamente cuando todos los anclajes obligatorios se verificaron.
fs.writeFileSync(backendPath, backend, "utf8");
fs.writeFileSync(frontendPath, frontend, "utf8");
if (headerModified) fs.writeFileSync(headerPath, header, "utf8");
console.log("Rutas de voluntariado conectadas. Verifica con git diff antes del commit.");
