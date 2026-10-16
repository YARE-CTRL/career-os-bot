const { msgFallback } = require('../messages/templates');
const stateRepo = require('../repositories/stateRepository');

const FALLBACK_COOLDOWN_MS = 60 * 60 * 1000; // 60 minutos

module.exports = async (msg) => {
  const chatId = msg.from;
  const last = stateRepo.getState(chatId)?.lastFallbackAt || 0;

  if (Date.now() - last < FALLBACK_COOLDOWN_MS) {
    console.log(`[Fallback] 🤫 Cooldown activo para ${chatId}. Sin respuesta.`);
    return;
  }

  // Se guarda ANTES de enviar: si el envío falla no se reintenta en bucle.
  stateRepo.setState(chatId, { lastFallbackAt: Date.now() });
  await msg.reply(msgFallback());
};

module.exports.FALLBACK_COOLDOWN_MS = FALLBACK_COOLDOWN_MS;
