// =========================================================
// CONTENIDO LEGAL DE LA INVITACIÓN - IGLESIA EL ANCLA
// =========================================================
// Versión fija que el backend utiliza al activar una cuenta.
// Cuando se modifiquen los documentos publicados, actualizar
// esta versión y volver a publicar las páginas legales.
// Este archivo no sustituye los textos completos del sitio.

export const ACTIVATION_LEGAL_VERSION = "2026-11-20-v2";

// Texto acordado para la casilla de aceptación explícita.
export const ACTIVATION_LEGAL_ACKNOWLEDGEMENT =
  "Declaro haber leído y aceptado los Términos y Condiciones y haber sido informado sobre el tratamiento de mis datos personales y los posibles riesgos tecnológicos, incluidos incidentes de seguridad o accesos no autorizados.";

// Informamos al destinatario que sus datos ya fueron ingresados
// por una persona autorizada, antes de que active la cuenta.
export const ACTIVATION_DATA_NOTICE = Object.freeze([
  "Un administrador de Iglesia El Ancla ha ingresado previamente tu nombre, apellidos, correo electrónico, fecha de nacimiento, rol y sucursal para preparar esta invitación. También puede haber registrado un teléfono si lo proporcionaste.",
  "Estos datos se utilizan para gestionar tu cuenta, verificar tu dirección de correo y, si aceptas la invitación, ofrecerte las funciones comunitarias correspondientes a tu rol, como información, actividades y participación. Algunas funciones tratarán datos adicionales solamente cuando decidas utilizarlas.",
  "Los datos podrán ser tratados por proveedores tecnológicos necesarios para prestar el servicio, en las condiciones informadas en la Política de Privacidad. No se destinan a su venta ni a publicidad comercial.",
  "Puedes revisar las finalidades, medidas de protección, conservación de datos, destinatarios y tus derechos en la Política de Privacidad. Si decides no activar tu cuenta, basta con ignorar esta invitación: el enlace vencerá a las 24 horas y el registro provisional se eliminará automáticamente de nuestra base de datos después del vencimiento, sin que tengas que solicitarlo.",
]);

// Reproducimos íntegramente la cláusula aprobada por el proyecto.
export const ACTIVATION_SECURITY_HEADING =
  "Seguridad de la información y riesgos tecnológicos";

export const ACTIVATION_SECURITY_PARAGRAPHS = Object.freeze([
  "La plataforma digital de Iglesia El Ancla Comunidad Cristiana incorpora medidas técnicas y organizativas destinadas a proteger la información de sus usuarios y prevenir accesos no autorizados.",
  "No obstante, el usuario reconoce y comprende que ningún sistema informático conectado a Internet puede garantizar una seguridad absoluta. Por lo tanto, existe la posibilidad de que ocurran incidentes tecnológicos, ataques informáticos, accesos no autorizados, filtraciones de información o interrupciones del servicio, aun cuando se hayan implementado medidas de protección.",
  "Al aceptar las condiciones de uso, el usuario declara haber sido informado de estos riesgos y comprende las características del entorno digital en el que participará.",
  "Asimismo, se compromete a proteger sus credenciales de acceso, utilizar contraseñas seguras, no compartir su cuenta y comunicar cualquier actividad sospechosa.",
  "Iglesia El Ancla Comunidad Cristiana y los prestadores tecnológicos que participen en el funcionamiento de la plataforma responderán únicamente conforme a las obligaciones y responsabilidades que les correspondan de acuerdo con la legislación aplicable.",
  "Esta disposición no constituye una renuncia a los derechos que la ley reconoce a los titulares de datos personales ni excluye las responsabilidades que legalmente no pueden ser limitadas.",
]);
