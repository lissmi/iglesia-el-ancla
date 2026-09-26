// Importamos los estilos generales
// de la página principal del super administrador.
import "../../styles/pages/super-admin/SuperAdminHome.css";

// Importamos el resumen personal
// correspondiente a la experiencia como miembro.
import MemberOverview from "../../components/super-admin/home/MemberOverview";

// Importamos el resumen de las
// funciones administrativas generales.
import AdminOverview from "../../components/super-admin/home/AdminOverview";

// Importamos las herramientas
// exclusivas del super administrador.
import SuperAdminOverview from "../../components/super-admin/home/SuperAdminOverview";


// Creamos la página principal
// de la sesión del super administrador.
function SuperAdminHome() {

    return (
        <main className="super-admin-home">

            {/* Contenedor principal de la página. */}
            <div className="super-admin-home__container">


                {/* ================================================= */}
                {/* ENCABEZADO */}
                {/* ================================================= */}

                <section className="super-admin-home__welcome">

                    <span className="super-admin-home__eyebrow">
                        Panel general
                    </span>

                    <h1>
                        Bienvenido a tu espacio
                    </h1>

                    <p>
                        Revisa tu actividad como miembro de la comunidad
                        y accede a las herramientas de administración
                        de Iglesia El Ancla.
                    </p>

                </section>


                {/* ================================================= */}
                {/* ÁREA PERSONAL / MIEMBRO */}
                {/* ================================================= */}

                <MemberOverview />


                {/* ================================================= */}
                {/* ÁREA ADMINISTRATIVA */}
                {/* ================================================= */}

                <AdminOverview />


                {/* ================================================= */}
                {/* CONTROL DEL SUPER ADMINISTRADOR */}
                {/* ================================================= */}

                <SuperAdminOverview />

            </div>

        </main>
    );
}


// Exportamos la página para utilizarla en App.js.
export default SuperAdminHome;