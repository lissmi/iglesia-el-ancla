
 // =========================================================
 // IMPORTACIÓN DE ICONOS
 // =========================================================

 import {
   UsersRound,
   UserRoundCheck,
   UserRoundX,
   ShieldCheck,
 } from "lucide-react";


 // =========================================================
 // ESTILOS DEL COMPONENTE
 // =========================================================

 import "../../../styles/components/administration/users/UsersSummary.css";


 // =========================================================
 // CONFIGURACIÓN DE LAS ESTADÍSTICAS
 // =========================================================

 // Definimos las tarjetas que aparecerán
 // en el resumen de usuarios.
 //
 // Cada tarjeta contiene:
 //
 // id: identificador único.
 // title: nombre de la estadística.
 // description: explicación del indicador.
 // icon: icono correspondiente.
 // valueKey: propiedad que recibiremos
 // desde los datos del backend.
 // variant: variante visual de la tarjeta.

 const summaryCards = [
   {
     id: "total",

     title: "Total de usuarios",

     description: "Cuentas registradas en el sistema.",

     icon: UsersRound,

     valueKey: "total",

     variant: "total",
   },

   {
     id: "active",

     title: "Usuarios activos",

     description: "Cuentas habilitadas para acceder.",

     icon: UserRoundCheck,

     valueKey: "active",

     variant: "active",
   },

   {
     id: "blocked",

     title: "Usuarios bloqueados",

     description: "Cuentas con acceso restringido.",

     icon: UserRoundX,

     valueKey: "blocked",

     variant: "blocked",
   },

   {
     id: "administrators",

     title: "Administradores",

     description: "Cuentas con permisos administrativos.",

     icon: ShieldCheck,

     valueKey: "administrators",

     variant: "administrators",
   },
 ];


 // =========================================================
 // COMPONENTE USERS SUMMARY
 // =========================================================

 // Este componente recibe las estadísticas
 // mediante la propiedad "stats".
 //
 // Si todavía no tenemos información,
 // las tarjetas mostrarán un guion.
 //
 // Ejemplo futuro:
 //
 // <UsersSummary
 //   stats={{
 //     total: 120,
 //     active: 105,
 //     blocked: 15,
 //     administrators: 4,
 //   }}
 // />

 function UsersSummary({
   stats = null,
 }) {

   // =========================================================
   // FORMATEAR VALORES
   // =========================================================

   // Mostramos el número únicamente
   // cuando recibimos un valor válido.
   //
   // Es importante conservar el valor 0
   // cuando sea un dato real.

   const formatValue = (value) => {

     if (
       typeof value !== "number" ||
       !Number.isFinite(value) ||
       value < 0
     ) {
       return "—";
     }

     return new Intl.NumberFormat("es-CL").format(value);
   };


   // =========================================================
   // INTERFAZ
   // =========================================================

   return (

     <section
       className="users-summary"
       aria-labelledby="users-summary-title"
     >


       {/* ================================================= */}
       {/* ENCABEZADO */}
       {/* ================================================= */}

       <div className="users-summary__header">

         <div>

           <h2
             className="users-summary__title"
             id="users-summary-title"
           >
             Resumen de usuarios
           </h2>

           <p className="users-summary__description">
             Visualiza las estadísticas generales
             de las cuentas registradas.
           </p>

         </div>

       </div>


       {/* ================================================= */}
       {/* TARJETAS DE ESTADÍSTICAS */}
       {/* ================================================= */}

       <div className="users-summary__grid">

         {summaryCards.map((card) => {

           // Obtenemos el icono de la tarjeta.
           const CardIcon = card.icon;

           // Obtenemos el valor correspondiente.
           const value = stats?.[card.valueKey];

           return (

             <article
               className={`
                 users-summary-card
                 users-summary-card--${card.variant}
               `}
               key={card.id}
             >


               {/* ========================================= */}
               {/* ENCABEZADO DE LA TARJETA */}
               {/* ========================================= */}

               <div className="users-summary-card__header">

                 <span className="users-summary-card__label">
                   {card.title}
                 </span>

                 <div className="users-summary-card__icon">

                   <CardIcon
                     size={21}
                     strokeWidth={1.8}
                     aria-hidden="true"
                   />

                 </div>

               </div>


               {/* ========================================= */}
               {/* VALOR DE LA ESTADÍSTICA */}
               {/* ========================================= */}

               <strong className="users-summary-card__value">
                 {formatValue(value)}
               </strong>


               {/* ========================================= */}
               {/* DESCRIPCIÓN */}
               {/* ========================================= */}

               <p className="users-summary-card__description">
                 {card.description}
               </p>

             </article>
           );
         })}

       </div>

     </section>
   );
 }


 // =========================================================
 // EXPORTACIÓN
 // =========================================================

 export default UsersSummary;
