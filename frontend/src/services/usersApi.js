// Cliente HTTP compartido: mantiene las cookies HttpOnly de sesión.
import api from "./api";

// Consulta el listado existente de MongoDB, sin datos ficticios.
export const getUsers = async () => (await api.get("/users")).data.users;

// Consulta las estadísticas institucionales.
export const getUsersStats = async () => (await api.get("/users/stats")).data.stats;

// Actualiza datos permitidos de una cuenta no privilegiada.
export const updateUser = async (id, payload) =>
  (await api.patch(`/users/${encodeURIComponent(id)}`, payload)).data.user;

// Habilita o desactiva una cuenta desde una sesión super_admin.
export const updateUserStatus = async (id, isActive) =>
  (await api.patch(`/users/${encodeURIComponent(id)}/status`, { isActive })).data.user;
