const config = require('../config/env');

function msgInstructions(userId) {
  return `¡Hola! 👋 Somos el equipo de *Career OS*.\n\n` +
    `Para activar tu *${config.PLAN_NAME}*, sigue estos pasos:\n\n` +
    `1️⃣  Transfiere *$${config.PLAN_PRICE} COP* a este Nequi:\n` +
    `   📲 *${config.NEQUI_NUMBER}*\n\n` +
    `2️⃣  Envíanos aquí la *foto del comprobante* de pago.\n\n` +
    `3️⃣  Activamos tu cuenta *Pro en menos de 5 minutos* ⚡\n\n` +
    (userId ? `📌 _Tu User ID registrado:_ \`${userId}\`` : '');
}

function msgReceiptConfirmed() {
  return `✅ *¡Comprobante recibido!*\n\n` +
    `Estamos verificando tu pago. Te confirmamos la activación en los próximos minutos.\n\n` +
    `¡Gracias por confiar en Career OS! 🚀`;
}

function msgGreeting() {
  return `¡Hola! 👋 Bienvenido a *Career OS*, tu plataforma de desarrollo profesional con IA.\n\n` +
    `¿En qué te puedo ayudar hoy?\n\n` +
    `1️⃣  *Quiero adquirir el Plan Pro* — Te guío con el pago.\n` +
    `2️⃣  *Tengo una duda sobre la plataforma* — Escríbeme tu pregunta.\n` +
    `3️⃣  *Quiero hablar con un asesor* — Escríbeme "quiero hablar con un asesor".\n\n` +
    `😊 Escríbeme lo que necesitas.`;
}

function msgHumanHandoff() {
  return `Entendido 🙌 Voy a conectarte con un miembro de nuestro equipo.\n\n` +
    `*Un asesor se comunicará contigo en breve.* Puedes seguir escribiendo aquí y lo veremos.\n\n` +
    `¡Gracias por tu paciencia! 🙏`;
}

function msgFallback() {
  return `Entendido 😊 Puedo ayudarte con lo siguiente:\n\n` +
    `💳 *Pagar el Plan Pro con Nequi* — escríbeme _"quiero pagar"_\n` +
    `👤 *Hablar con un asesor humano* — escríbeme _"quiero hablar con un asesor"_\n` +
    `🌐 *Ver la plataforma* — visita *careeros-yare.vercel.app*\n\n` +
    `¿En qué más te puedo ayudar?`;
}

function msgWaitingReceipt() {
  return `Cuando tengas el comprobante listo, envíanos la *foto* por aquí y activamos tu cuenta de inmediato. 📸`;
}

module.exports = {
  msgInstructions,
  msgReceiptConfirmed,
  msgGreeting,
  msgHumanHandoff,
  msgFallback,
  msgWaitingReceipt
};
