/**
 * Career OS — WhatsApp Bot
 * Entry Point
 */
'use strict';

const express = require('express');
const config = require('./config/env');
const client = require('./core/whatsappClient');
const { setupLifecycle, getStatus } = require('./core/lifecycle');

const app = express();

app.get('/', (_req, res) => {
  const { botReady, latestQR } = getStatus();
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

app.get('/status', (_req, res) => {
  const { botReady, latestQR } = getStatus();
  res.json({ connected: botReady, qrReady: !!latestQR });
});

function html(title, body, extra) {
  return `<!DOCTYPE html><html><head><title>Career OS Bot</title>${extra}</head>
  <body style="background:#0f0f0f;color:#f0f0f0;font-family:system-ui;display:flex;
  flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
  <h2>${title}</h2>${body}</body></html>`;
}

app.listen(config.PORT, '0.0.0.0', () => console.log(`[Server] Web activo en puerto ${config.PORT} (0.0.0.0)`));

console.log('[Bot] Iniciando Career OS WhatsApp Bot...');
setupLifecycle();
client.initialize().catch(err => {
  console.error('[Bot] Error al inicializar cliente WWebJS:', err);
});
