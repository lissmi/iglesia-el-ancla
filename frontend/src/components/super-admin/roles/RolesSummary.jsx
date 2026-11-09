

import {
  KeyRound,
  ShieldCheck,
  UsersRound,
} from "lucide-react";


import "../../../styles/components/super-admin/roles/RolesSummary.css";

function RolesSummary({ data }) {
  const roles = data.roles;
  const permissions = data.permissions;
  const protectedRoles = roles.filter((role) => role.protected).length;

  const summary = [
    {
      id: "roles",
      label: "Roles del sistema",
      value: roles.length,
      icon: UsersRound,
      description: "Niveles de acceso definidos",
    },
    {
      id: "permissions",
      label: "Funciones disponibles",
      value: permissions.length,
      icon: KeyRound,
      description: "Acciones contempladas en esta tabla",
    },
    {
      id: "protected",
      label: "Roles protegidos",
      value: protectedRoles,
      icon: ShieldCheck,
      description: "Tipos de cuenta con mayor protección",
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




