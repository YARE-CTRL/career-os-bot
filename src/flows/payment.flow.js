const { msgInstructions } = require('../messages/templates');
const { setState } = require('../repositories/stateRepository');
const { extractUserId } = require('../utils/phone');
const { logPayment } = require('../repositories/paymentRepository');
const config = require('../config/env');

async function handlePaymentRequest(msg, chatId, body) {
  const userId = extractUserId(body);
  setState(chatId, { userId, step: 'waiting_receipt' });
  await msg.reply(msgInstructions(userId));
  console.log(`[Payment] 💳 Instrucciones enviadas → ${chatId} | userId: ${userId}`);
}

async function handleReceipt(msg, chatId, state) {
  setState(chatId, { step: 'receipt_received' });
  logPayment({
    chatId,
    userId: state.userId || 'desconocido',
    plan: 'monthly',
    amount: 9900,
    status: 'pending_verification',
    note: 'Comprobante recibido. Esperando aprobación del Admin.',
  });
  
  await msg.reply('Recibo tu comprobante. Lo estamos validando y en breve te activaremos la cuenta.');
  console.log(`[Payment] 📸 Comprobante de ${chatId} | userId: ${state.userId}`);

  if (config.ADMIN_NUMBER) {
    try {
      const client = require('../core/whatsappClient');
      const media = await msg.downloadMedia();
      await client.sendMessage(config.ADMIN_NUMBER, media, {
        caption: `Nuevo pago de ${state.userId}. Para aprobar responde:\n!aprobar ${state.userId}`
      });
    } catch (err) {
      console.error('[Payment] Error al reenviar comprobante al admin:', err);
    }
  } else {
    console.warn('[Payment] ADMIN_NUMBER no está configurado. No se puede reenviar el comprobante.');
  }
}

async function handleWaitingReceipt(msg) {
  await msg.reply(`Cuando tengas el comprobante listo, envíanos la *foto* por aquí y activamos tu cuenta de inmediato. 📸`);
}

module.exports = {
  handlePaymentRequest,
  handleReceipt,
  handleWaitingReceipt
};
