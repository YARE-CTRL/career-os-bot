/**
 * Career OS — WhatsApp Bot
 *
 * Flujos automáticos:
 *  1. Usuario envía mensaje de pago desde la app → Bot responde con número Nequi e instrucciones.
 *  2. Usuario envía foto (comprobante)           → Bot confirma recepción y registra el pago.
 *  3. Saludo genérico                            → Bot explica el proceso.
 *
 * El QR de vinculación se sirve como imagen en la URL raíz del servicio de Railway.
 */

'use strict';

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const fs = require('fs');
const path = require('path');

// ── Configuración desde variables de entorno ──────────────────────────────────
const NEQUI_NUMBER   = process.env.NEQUI_NUMBER    || '3053421833';
const PLAN_PRICE     = process.env.PLAN_PRICE      || '9.900';
const PLAN_NAME      = process.env.PLAN_NAME       || 'Plan Pro';
const SESSION_PATH   = process.env.SESSION_DATA_PATH || '/data/.wwebjs_auth';
const LOG_PATH       = process.env.PAYMENT_LOG_PATH  || '/data/payments.json';
const PORT           = process.env.PORT              || 3001;

// ── Servidor Express (sirve el QR en Railway) ────────────────────────────────
const app = express();
let latestQR  = null;
let botReady  = false;

app.get('/', (_req, res) => {
  if (botReady) {
    return res.send(html('✅ Career OS Bot — Activo', '<p>El bot está conectado y escuchando mensajes.</p>', ''));
  }
  if (!latestQR) {
    return res.send(html('⏳ Iniciando...', '<p>Generando QR, recarga en 3 s.</p>', '<meta http-equiv="refresh" content="3">'));
  }
  return res.send(html(
    '📱 Escanea con WhatsApp',
    `<img src="${latestQR}" width="280" style="border-radius:12px;margin:16px 0"/>
     <p style="color:#888">WhatsApp → Dispositivos vinculados → Vincular dispositivo</p>
     <p style="color:#555;font-size:12px">El QR expira cada ~60 s. La página se recarga sola.</p>`,
    '<meta http-equiv="refresh" content="25">'
  ));
});

app.get('/status', (_req, res) => res.json({ connected: botReady, qrReady: !!latestQR }));

app.listen(PORT, '0.0.0.0', () => console.log(`[Server] Web activo en puerto ${PORT} (0.0.0.0)`));

function html(title, body, extra) {
  return `<!DOCTYPE html><html><head><title>Career OS Bot</title>${extra}</head>
  <body style="background:#0f0f0f;color:#f0f0f0;font-family:system-ui;display:flex;
  flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
  <h2>${title}</h2>${body}</body></html>`;
}

// ── Registro de pagos en JSON ─────────────────────────────────────────────────
function logPayment(entry) {
  let logs = [];
  try {
    if (fs.existsSync(LOG_PATH)) {
      logs = JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8'));
    }
  } catch { /* primer registro */ }
  logs.push({ ...entry, createdAt: new Date().toISOString() });
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  console.log('[Payment Log] Nuevo registro:', JSON.stringify(entry));
}

// ── Extrae el User ID del mensaje prefabricado de la app ─────────────────────
function extractUserId(text) {
  const match = text.match(/[Uu]ser\s*ID\s*[:\s]+([a-zA-Z0-9_\-]+)/);
  return match ? match[1].trim() : null;
}

// ── Detección de patrones de mensaje ─────────────────────────────────────────
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


// ── Plantillas de respuesta ───────────────────────────────────────────────────
function msgInstructions(userId) {
  return `¡Hola! 👋 Somos el equipo de *Career OS*.\n\n` +
    `Para activar tu *${PLAN_NAME}*, sigue estos pasos:\n\n` +
    `1️⃣  Transfiere *$${PLAN_PRICE} COP* a este Nequi:\n` +
    `   📲 *${NEQUI_NUMBER}*\n\n` +
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

// ── Estado de conversaciones en memoria ──────────────────────────────────────
// { chatId → { userId, step: 'waiting_receipt'|'receipt_received'|'human_requested' } }
const conversations = new Map();

// ── Cliente de WhatsApp ───────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--js-flags="--max-old-space-size=256"',
      '--disable-software-rasterizer',
      '--disable-features=site-per-process'
    ],
  },
});

client.on('qr', async (qr) => {
  console.log('[QR] Nuevo QR generado. Visita la URL de tu servicio Railway para escanearlo.');
  latestQR = await qrcode.toDataURL(qr);
  botReady = false;
});

client.on('authenticated', () => {
  console.log('[Auth] 🔐 Sesión autenticada.');
});

client.on('ready', () => {
  console.log('[Bot] ✅ Career OS Bot listo y escuchando.');
  botReady = true;
  latestQR  = null;
});

client.on('auth_failure', (msg) => {
  console.error('[Auth] ❌ Fallo de autenticación:', msg);
});

client.on('disconnected', (reason) => {
  console.warn('[Bot] ⚠️  Desconectado:', reason);
  botReady = false;
  setTimeout(() => {
    console.log('[Bot] Reintentando conexión...');
    client.initialize();
  }, 10_000);
});

// ── Manejador principal de mensajes ──────────────────────────────────────────
client.on('message', async (msg) => {
  if (msg.fromMe) return;                  // ignorar mensajes propios
  if (msg.from.includes('@g.us')) return;  // ignorar grupos

  const chatId   = msg.from;
  const body     = msg.body || '';
  const hasMedia = msg.hasMedia;
  const type     = msg.type;
  const convo    = conversations.get(chatId);

  console.log(`[Msg] ${chatId} | tipo:${type} | "${body.slice(0, 100)}"`);

  // ── Si ya está esperando asesor humano, no interrumpir ──────────────────
  if (convo?.step === 'human_requested') {
    console.log(`[Human] ⏳ Chat ${chatId} esperando asesor. Mensaje ignorado por bot.`);
    return;
  }

  // ── Comprobante de pago (imagen) ────────────────────────────────────────
  if (hasMedia && type === 'image') {
    if (convo?.step === 'waiting_receipt') {
      conversations.set(chatId, { ...convo, step: 'receipt_received' });
      logPayment({
        chatId,
        userId:  convo.userId || 'desconocido',
        plan:    'monthly',
        amount:  9900,
        status:  'pending_verification',
        note:    'Comprobante recibido. Verificación manual pendiente en Nequi.',
      });
      await msg.reply(msgReceiptConfirmed());
      console.log(`[Payment] 📸 Comprobante de ${chatId} | userId: ${convo.userId}`);
      return;
    }
  }

  // ── Solicitud de asesor humano ───────────────────────────────────────────
  if (isHumanRequest(body)) {
    conversations.set(chatId, { ...convo, step: 'human_requested' });
    await msg.reply(msgHumanHandoff());
    console.log(`[Human] 🙋 Asesor solicitado por ${chatId}`);
    return;
  }

  // ── Mensaje de pago desde la app (botón "Contactar por WhatsApp") ───────
  if (isPaymentRequest(body)) {
    const userId = extractUserId(body);
    conversations.set(chatId, { userId, step: 'waiting_receipt' });
    await msg.reply(msgInstructions(userId));
    console.log(`[Payment] 💳 Instrucciones enviadas → ${chatId} | userId: ${userId}`);
    return;
  }

  // ── Saludo genérico ──────────────────────────────────────────────────────
  if (isGreeting(body)) {
    await msg.reply(msgGreeting());
    return;
  }

  // ── Usuario en espera de comprobante ─────────────────────────────────────
  if (convo?.step === 'waiting_receipt') {
    await msg.reply(msgWaitingReceipt());
    return;
  }

  // ── Fallback general (pregunta o mensaje no reconocido) ──────────────────
  await msg.reply(msgFallback());
});

// ── Arranque ──────────────────────────────────────────────────────────────────
console.log('[Bot] Iniciando Career OS WhatsApp Bot...');
client.initialize();
