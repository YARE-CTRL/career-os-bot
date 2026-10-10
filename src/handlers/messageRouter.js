const stateRepo = require('../repositories/stateRepository');
const { isGroup } = require('../utils/phone');
const config = require('../config/env');
const menuFlow = require('../flows/menu.flow');
const { handlePaymentRequest, handleReceipt, handleWaitingReceipt } = require('../flows/payment.flow');
const humanAgentFlow = require('../flows/humanAgent.flow');
const fallbackFlow = require('../flows/fallback.flow');
const adminFlow = require('../flows/admin.flow');

function isPaymentRequest(text) {
  const t = text.toLowerCase();
  return t.includes('career os') && (t.includes('user id') || t.includes('confirmar') || t.includes('pago'));
}

function isGreeting(text) {
  return /^\s*(hola|buenas|buen\s?d[ií]a|buenos|hi|hello|ey|saludos|ola)\b/i.test(text);
}

function isHumanRequest(text) {
  const t = text.toLowerCase();
  return (
    t.includes('asesor') ||
    t.includes('humano') ||
    t.includes('hablar con alguien') ||
    t.includes('hablar con una persona') ||
    t.includes('agente') ||
    t.includes('persona real') ||
    t.includes('soporte') ||
    t.includes('ayuda humana') ||
    t.includes('quiero hablar')
  );
}

async function routeMessage(msg) {
  if (msg.fromMe) {
    if (msg.body && msg.body.trim() === '!fin-asesor') {
      stateRepo.clearState(msg.to);
      console.log(`[Admin] 🤖 Bot reactivado manualmente para ${msg.to}`);
    }
    return;
  }

  if (isGroup(msg.from)) return;

  const chatId = msg.from;
  const body = msg.body || '';
  const hasMedia = msg.hasMedia;
  const type = msg.type;
  let state = stateRepo.getState(chatId);

  console.log(`[Msg] ${chatId} | tipo:${type} | "${body.slice(0, 100)}"`);

  // Flujo Admin
  if (chatId === config.ADMIN_NUMBER && body.startsWith('!')) {
    return adminFlow(msg);
  }

  // Timeout para asesor humano (24 horas)
  if (state?.step === 'human_requested') {
    const elapsed = Date.now() - (state.humanRequestedAt || 0);
    if (elapsed > 86400000) {
      stateRepo.clearState(chatId);
      state = null;
      console.log(`[Admin] ⏳ Timeout de asesor humano expirado para ${chatId}. Bot reactivado.`);
    } else {
      console.log(`[Human] ⏳ Chat ${chatId} esperando asesor. Mensaje ignorado por bot.`);
      return;
    }
  }

  if (hasMedia && type === 'image') {
    if (state?.step === 'waiting_receipt') {
      return handleReceipt(msg, chatId, state);
    }
  }

  if (isHumanRequest(body)) {
    return humanAgentFlow(msg, chatId);
  }

  if (isPaymentRequest(body)) {
    return handlePaymentRequest(msg, chatId, body);
  }

  if (isGreeting(body)) {
    return menuFlow(msg);
  }

  if (state?.step === 'waiting_receipt') {
    return handleWaitingReceipt(msg);
  }

  return fallbackFlow(msg);
}

module.exports = { routeMessage };
