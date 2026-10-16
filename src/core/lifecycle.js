const qrcode = require('qrcode');
const client = require('./whatsappClient');
const { routeMessage } = require('../handlers/messageRouter');
const { isIgnoredSource } = require('../utils/messageGuards');

const RESTART_DELAY_MS = 10_000;
const RESTART_RETRY_MS = 30_000;
const LOGOUT_QR_WATCHDOG_MS = 60_000;

let latestQR = null;
let botReady = false;
let restarting = false;
let logoutWatchdog = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Reinicio completo y serializado del cliente (destroy → initialize).
 * Solo se usa para desconexiones que la librería NO recupera sola.
 */
async function restartClient(reason) {
  if (restarting) return;
  restarting = true;
  try {
    console.log(`[Bot] 🔄 Reiniciando cliente (${reason})...`);
    await client.destroy().catch((err) => console.warn('[Bot] destroy() falló (ignorado):', err.message));
    await sleep(RESTART_DELAY_MS);
    await client.initialize();
  } catch (err) {
    console.error('[Bot] ❌ Error al reiniciar el cliente:', err);
    restarting = false;
    setTimeout(() => restartClient('reintento tras error'), RESTART_RETRY_MS);
    return;
  }
  restarting = false;
}

function clearLogoutWatchdog() {
  if (logoutWatchdog) {
    clearTimeout(logoutWatchdog);
    logoutWatchdog = null;
  }
}

/** Evita que un rechazo suelto de Puppeteer/whatsapp-web.js tumbe todo el proceso. */
function setupProcessGuards() {
  process.on('unhandledRejection', (reason) => {
    console.error('[Process] ⚠️ unhandledRejection (el bot sigue vivo):', reason?.message || reason);
  });
}

function setupLifecycle() {
  setupProcessGuards();

  client.on('qr', async (qr) => {
    console.log('[QR] Nuevo QR generado. Visita la URL de tu servicio Railway para escanearlo.');
    clearLogoutWatchdog();
    latestQR = await qrcode.toDataURL(qr);
    botReady = false;
  });

  client.on('authenticated', () => {
    console.log('[Auth] 🔐 Sesión autenticada.');
  });

  client.on('ready', () => {
    console.log('[Bot] ✅ Career OS Bot listo y escuchando.');
    clearLogoutWatchdog();
    botReady = true;
    latestQR = null;
  });

  client.on('auth_failure', (msg) => {
    console.error('[Auth] ❌ Fallo de autenticación:', msg);
  });

  client.on('disconnected', (reason) => {
    console.warn('[Bot] ⚠️  Desconectado:', reason);
    botReady = false;

    if (reason === 'LOGOUT') {
      // whatsapp-web.js ya borra la sesión inválida y vuelve a pedir un QR por sí mismo.
      // Llamar a initialize() de nuevo aquí abriría un segundo navegador y causaba el crash.
      console.warn('[Bot] 🔓 Sesión cerrada desde el teléfono/WhatsApp. Escanea el nuevo QR en la URL del servicio.');
      clearLogoutWatchdog();
      logoutWatchdog = setTimeout(() => {
        if (!latestQR && !botReady) restartClient('sin QR tras LOGOUT');
      }, LOGOUT_QR_WATCHDOG_MS);
      return;
    }

    restartClient(`desconectado: ${reason}`);
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
