
import {
  KeyRound,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import {
  SYSTEM_PERMISSIONS,
  SYSTEM_ROLES,
} from "../../../data/admin/rolesPermissions";

import "../../../styles/components/super-admin/roles/RolesSummary.css";

function RolesSummary() {
  const protectedRoles = SYSTEM_ROLES.filter(
    (role) => role.protected
  ).length;

  const summary = [
    {
      id: "roles",
      label: "Roles del sistema",
      value: SYSTEM_ROLES.length,
      icon: UsersRound,
      description: "Niveles de acceso definidos",
    },
    {
      id: "permissions",
      label: "Permisos documentados",
      value: SYSTEM_PERMISSIONS.length,
      icon: KeyRound,
      description: "Operaciones en la matriz propuesta",
    },
    {
      id: "protected",
      label: "Roles privilegiados",
      value: protectedRoles,
      icon: ShieldCheck,
      description: "Roles con protección especial",
    },
  ];

  return (
    <div className="roles-summary">
      {summary.map((item) => {
        const Icon = item.icon;

        return (
          <article
            className="roles-summary__card"
            key={item.id}
          >
            <div className="roles-summary__icon">
              <Icon
                size={22}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <div className="roles-summary__information">
              <span className="roles-summary__label">
                {item.label}
              </span>

              <strong className="roles-summary__value">
                {item.value}
              </strong>

              <small>
                {item.description}
              </small>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default RolesSummary;
