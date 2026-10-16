'use strict';

// Tipos de mensaje que emiten bots/empresas o el propio sistema de WhatsApp.
// Quien los envía NO es un cliente humano: se silencia el chat para evitar bucles bot↔bot.
const BOT_MESSAGE_TYPES = new Set([
  'notification_template',
  'interactive',
  'e2e_notification',
  'call_log',
  'protocol',
]);

/** Estados, difusiones y grupos: nunca se responden. */
function isIgnoredSource(msg) {
  const from = msg?.from || '';
  return (
    from === 'status@broadcast' ||
    msg?.isStatus === true ||
    msg?.broadcast === true ||
    from.endsWith('@g.us')
  );
}

function isBotMessageType(type) {
  return BOT_MESSAGE_TYPES.has(type);
}

module.exports = { BOT_MESSAGE_TYPES, isIgnoredSource, isBotMessageType };
