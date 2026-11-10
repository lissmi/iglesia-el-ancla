// Pruebas puras sin conexión a Gmail, Express ni MongoDB.
import test from "node:test";
import assert from "node:assert/strict";
import {
  RESET_PURPOSE, RESET_CODE_TTL_MS, RESET_MAX_ATTEMPTS,
  normalizeRecoveryEmail, isValidRecoveryEmail, isValidRecoveryCode,
  hashRecoveryCode, recoveryHashesMatch, REQUEST_MESSAGE,
} from "../../src/services/mail/passwordRecoveryPolicy.js";
import { buildPasswordRecoveryEmail } from "../../src/services/mail/passwordRecoveryEmail.js";

// Clave de 32 bytes reservada exclusivamente para estas pruebas.
process.env.EMAIL_VERIFICATION_HMAC_KEY = Buffer.alloc(32, 42).toString("base64");

test("separa recuperación de cambio de contraseña autenticado", () => {
  assert.equal(RESET_PURPOSE, "password_reset");
  assert.equal(RESET_CODE_TTL_MS, 10 * 60 * 1000);
  assert.equal(RESET_MAX_ATTEMPTS, 5);
});

test("normaliza correo y rechaza formatos inseguros", () => {
  assert.equal(normalizeRecoveryEmail("  USUARIO@ELANCLA.CL "), "usuario@elancla.cl");
  assert.equal(isValidRecoveryEmail("usuario@elancla.cl"), true);
  assert.equal(isValidRecoveryEmail("persona\r\nBCC:a@b.cl"), false);
  assert.equal(isValidRecoveryEmail("noesuncorreo"), false);
});

test("requiere exactamente seis dígitos para el OTP", () => {
  assert.equal(isValidRecoveryCode("000019"), true);
  assert.equal(isValidRecoveryCode("12345"), false);
  assert.equal(isValidRecoveryCode("1234567"), false);
  assert.equal(isValidRecoveryCode("12A456"), false);
});

test("HMAC vincula código, cuenta y correo", () => {
  const a = hashRecoveryCode({ userId: "1", email: "a@example.org", code: "123456" });
  const b = hashRecoveryCode({ userId: "1", email: "a@example.org", code: "123456" });
  const anotherUser = hashRecoveryCode({ userId: "2", email: "a@example.org", code: "123456" });
  const anotherCode = hashRecoveryCode({ userId: "1", email: "a@example.org", code: "111111" });
  assert.equal(a, b);
  assert.notEqual(a, anotherUser);
  assert.notEqual(a, anotherCode);
  assert.equal(recoveryHashesMatch(a, b), true);
  assert.equal(recoveryHashesMatch(a, anotherUser), false);
});

test("mensaje público no revela si existe una cuenta", () => {
  assert.match(REQUEST_MESSAGE, /Si el correo corresponde/);
  assert.doesNotMatch(REQUEST_MESSAGE, /no existe|encontramos tu cuenta/);
});

test("el correo es amable, accesible y muestra vencimiento", () => {
  const mail = buildPasswordRecoveryEmail("000019");
  assert.match(mail.subject, /El Ancla/);
  assert.match(mail.html, /000019/);
  assert.match(mail.html, /10 minutos/);
  assert.match(mail.text, /ignorar este mensaje/);
  assert.doesNotMatch(mail.html, /https?:\/\//);
  assert.throws(() => buildPasswordRecoveryEmail("<script>"));
});
