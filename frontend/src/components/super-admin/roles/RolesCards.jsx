
import {
  Crown,
  Shield,
  UserRound,
} from "lucide-react";

import {
  SYSTEM_ROLES,
} from "../../../data/admin/rolesPermissions";

import "../../../styles/components/super-admin/roles/RolesCards.css";

const ROLE_ICONS = {
  member: UserRound,
  admin: Shield,
  super_admin: Crown,
};

function RolesCards({
  selectedRole,
  onSelectRole,
}) {
  return (
    <div className="roles-cards">
      {SYSTEM_ROLES.map((role) => {
        const Icon = ROLE_ICONS[role.id];

        const isSelected =
          selectedRole === role.id;

        return (
          <button
            key={role.id}
            type="button"
            aria-pressed={isSelected}
            className={[
              "roles-card",
              isSelected
                ? "roles-card--selected"
                : "",
            ].join(" ")}
            onClick={() => onSelectRole(role.id)}
          >
            <div className="roles-card__top">
              <div className="roles-card__icon">
                <Icon
                  size={23}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              <span className="roles-card__level">
                Nivel {role.level}
              </span>
            </div>

            <div className="roles-card__content">
              <h3>{role.name}</h3>

              <p>{role.description}</p>
            </div>

            <div className="roles-card__footer">
              <span>{role.scope}</span>

              {role.protected && (
                <strong>Protegido</strong>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default RolesCards;
