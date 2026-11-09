// Reutilizamos el cliente HTTP institucional y su cookie de sesión.
import api from "./api";

// Recuperamos únicamente administradores y superadministradores reales.
export const getAdministrators = async () => {
  const response = await api.get("/users/administrators");
  return response.data;
};
