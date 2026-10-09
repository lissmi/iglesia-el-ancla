
import {
  ShieldCheck,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

import "../../../styles/components/super-admin/administrators/AdministratorsSummary.css";

function AdministratorsSummary({ administrators = [] }) {

  const stats = [
    {
      label: "Cuentas administrativas",
      value: administrators.length,
      icon: Shield,
      type: "total",
      description: "Administradores y superadministradores",
    },
    {
      label: "Administradores",
      value: administrators.filter(
        (user) => user.role === "admin"
      ).length,
      icon: ShieldCheck,
      type: "admins",
      description: "Cuentas con rol administrativo",
    },
    {
      label: "Cuentas activas",
      value: administrators.filter(
        (user) => user.isActive === true
      ).length,
      icon: UserCheck,
      type: "active",
      description: "Con acceso habilitado",
    },
    {
      label: "Cuentas desactivadas",
      value: administrators.filter(
        (user) => user.isActive === false
      ).length,
      icon: UserX,
      type: "inactive",
      description: "Sin acceso al sistema",
    },
  ];

  return (
    <section
      className="administrators-summary"
      aria-label="Resumen de cuentas administrativas"
    >
      {stats.map((stat) => {

        const Icon = stat.icon;

        return (
          <article
            key={stat.type}
            className={`administrators-summary__card administrators-summary__card--${stat.type}`}
          >
            <div className="administrators-summary__top">
              <span>{stat.label}</span>
              <div className="administrators-summary__icon">
                <Icon size={19} strokeWidth={1.8} />
              </div>
            </div>

            <strong className="administrators-summary__value">
              {stat.value}
            </strong>

            <p>{stat.description}</p>
          </article>
        );
      })}
    </section>
  );
}

export default AdministratorsSummary;
