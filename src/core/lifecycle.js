const qrcode = require('qrcode');
const client = require('./whatsappClient');
const { routeMessage } = require('../handlers/messageRouter');
const { isIgnoredSource } = require('../utils/messageGuards');

let latestQR = null;
let botReady = false;

function setupLifecycle() {
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
    latestQR = null;
  });

  client.on('auth_failure', (msg) => {
    console.error('[Auth] ❌ Fallo de autenticación:', msg);
  });

  client.on('disconnected', (reason) => {
    console.warn('[Bot] ⚠️  Desconectado:', reason);
    botReady = false;
    setTimeout(() => {
      console.log('[Bot] Reintentando conexión...');
      client.initialize().catch(err => console.error('[Bot] Error al inicializar:', err));
    }, 10_000);
  });

  client.on('message', async (msg) => {
    if (isIgnoredSource(msg)) return; // estados, difusiones y grupos
    try {
      await routeMessage(msg);
    } catch (err) {
      console.error('[Msg] ❌ Error manejando mensaje:', err);
    }
  });
}

function getStatus() {
  return { latestQR, botReady };
}

module.exports = {
  setupLifecycle,
  getStatus
};
