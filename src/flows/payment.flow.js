const { msgInstructions, msgReceiptConfirmed, msgWaitingReceipt } = require('../messages/templates');
const { setState } = require('../repositories/stateRepository');
const { extractUserId } = require('../utils/phone');
const { logPayment } = require('../repositories/paymentRepository');

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
    note: 'Comprobante recibido. Verificación manual pendiente en Nequi.',
  });
  await msg.reply(msgReceiptConfirmed());
  console.log(`[Payment] 📸 Comprobante de ${chatId} | userId: ${state.userId}`);
}

async function handleWaitingReceipt(msg) {
  await msg.reply(msgWaitingReceipt());
}

module.exports = {
  handlePaymentRequest,
  handleReceipt,
  handleWaitingReceipt
};
