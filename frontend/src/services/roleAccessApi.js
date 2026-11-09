// Reutiliza el cliente HTTP del proyecto y su cookie HttpOnly.
import api from "./api";

// La información proviene del endpoint protegido por super_admin.
export const getRoleAccessOverview = async () => {
  const response = await api.get("/system/role-access");
  return response.data.data;
};
