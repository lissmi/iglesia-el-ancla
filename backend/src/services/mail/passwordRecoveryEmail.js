// =========================================================
// CORREO INSTITUCIONAL DE RECUPERACIÓN — EL ANCLA ⚓
// =========================================================
// Los estilos están en línea para Gmail, Outlook y otros clientes.
// No utilizamos imágenes remotas, datos sensibles ni URLs con códigos.

import { escapeRecoveryHtml } from "./passwordRecoveryPolicy.js";

// Generamos una versión HTML y otra de texto accesible.
export function buildPasswordRecoveryEmail(code) {
  // Solo admitimos el código de seis dígitos creado por el servidor.
  if (!/^\d{6}$/.test(code)) throw new Error("Código de correo no válido");

  // Incluimos el código en el correo, nunca en una URL ni en los logs.
  const safeCode = escapeRecoveryHtml(code);

  // Creamos el mensaje alternativo para lectores de correo sin HTML.
  const text = [
    "Iglesia El Ancla ⚓", "",
    "Hola 💙", "",
    "Recibimos una solicitud para recuperar el acceso a tu cuenta.",
    "Puedes usar este código para crear una nueva contraseña:", "",
    code, "",
    "El código vence en 10 minutos y solo puede utilizarse una vez.",
    "Si no solicitaste este cambio, puedes ignorar este mensaje.",
    "Nunca compartas este código con otras personas.", "",
    "Con cariño,", "El equipo de Iglesia El Ancla",
  ].join("\n");

  // Construimos una tarjeta sobria con la paleta azul y arena de El Ancla.
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:Arial,Helvetica,sans-serif;color:#233448;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f2ed;padding:36px 12px;">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:570px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e7e0d7;">
<tr><td style="padding:31px 30px 24px;text-align:center;background:#20364a;">
<div style="font-size:34px;color:#f3e1cc;line-height:1;">⚓</div>
<div style="font-size:24px;font-weight:700;color:#ffffff;margin-top:9px;">El Ancla</div>
<div style="font-size:12px;color:#e8d9c4;letter-spacing:1.5px;margin-top:6px;">COMUNIDAD CRISTIANA</div>
</td></tr>
<tr><td style="padding:32px 35px 18px;line-height:1.7;">
<div style="font-size:12px;color:#ab8d6d;font-weight:700;letter-spacing:1.6px;">SEGURIDAD DE TU CUENTA</div>
<h1 style="font-size:27px;line-height:1.28;margin:10px 0 15px;color:#213448;">Recuperemos tu acceso 💙</h1>
<p style="font-size:15px;color:#4e5e6a;margin:0 0 14px;">¡Hola! Recibimos una solicitud para crear una nueva contraseña de tu cuenta en El Ancla.</p>
<p style="font-size:15px;color:#4e5e6a;margin:0 0 20px;">Ingresa este código en la pantalla de recuperación:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:25px 10px;background:#f7f4ef;border:1px solid #e7d9c8;border-radius:14px;">
<span style="font-size:36px;font-weight:700;letter-spacing:9px;color:#20364a;font-family:Arial,Helvetica,sans-serif;">${safeCode}</span>
</td></tr></table>
<p style="font-size:14px;color:#536373;margin:21px 0 7px;">⏳ Este código vence en <strong>10 minutos</strong> y solo puede usarse una vez.</p>
<p style="font-size:14px;color:#536373;margin:7px 0 22px;">Si tú no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo la misma.</p>
<div style="background:#f1f6f7;border-left:3px solid #9fb8c2;padding:12px 15px;border-radius:6px;font-size:13px;color:#345166;">🔒 Por tu seguridad, nunca compartas este código con nadie, ni siquiera con alguien que diga pertenecer al equipo de El Ancla.</div>
<p style="font-size:15px;color:#536373;margin:25px 0 0;">Con cariño,<br><strong style="color:#233448;">El equipo de Iglesia El Ancla</strong></p>
</td></tr>
<tr><td style="padding:20px 30px;background:#faf9f7;border-top:1px solid #ece7e0;text-align:center;font-size:12px;line-height:1.6;color:#83909c;">
Este mensaje se envió automáticamente para proteger el acceso a tu cuenta.<br>El Ancla · Comunidad Cristiana
</td></tr>
</table></td></tr></table></body></html>`;

  // Devolvemos ambos formatos al mismo servicio de Gmail ya conectado.
  return { subject: "Recupera tu acceso a El Ancla ⚓", text, html };
}
