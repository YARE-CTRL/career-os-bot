'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Aislar la persistencia en un directorio temporal ANTES de cargar los módulos
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bot-test-'));
process.env.PAYMENT_LOG_PATH = path.join(tmp, 'payments.json');
process.env.ADMIN_NUMBER = '573000000000@c.us';

const { routeMessage } = require('../src/handlers/messageRouter');
const { isIgnoredSource } = require('../src/utils/messageGuards');
const stateRepo = require('../src/repositories/stateRepository');

function fakeMsg(overrides = {}) {
  const replies = [];
  return {
    from: '573111111111@c.us',
    to: 'me@c.us',
    fromMe: false,
    body: 'blah blah',
    type: 'chat',
    hasMedia: false,
    replies,
    reply: async (t) => { replies.push(t); },
    ...overrides,
  };
}

test('ignora status@broadcast, isStatus, broadcast y grupos', async () => {
  const cases = [
    { from: 'status@broadcast', type: 'video' },
    { isStatus: true },
    { broadcast: true },
    { from: '1203630@g.us' },
  ];
  for (const c of cases) {
    const m = fakeMsg(c);
    assert.equal(isIgnoredSource(m), true);
    await routeMessage(m);
    assert.equal(m.replies.length, 0);
  }
});

test('notification_template/interactive silencian el chat para siempre', async () => {
  const from = '14744840851698@lid';
  const first = fakeMsg({ from, type: 'notification_template' });
  await routeMessage(first);
  assert.equal(first.replies.length, 0);
  assert.equal(stateRepo.getState(from).step, 'ignored_bot');

  // Respuesta automática posterior tipo 'chat' → silencio
  const later = fakeMsg({ from, type: 'chat', body: 'El mensaje es demasiado largo...' });
  await routeMessage(later);
  assert.equal(later.replies.length, 0);

  for (const type of ['interactive', 'e2e_notification', 'call_log', 'protocol']) {
    const m = fakeMsg({ from: `${type}@lid`, type });
    await routeMessage(m);
    assert.equal(m.replies.length, 0);
  }
});

test('fallback se envía una sola vez (cooldown anti-bucle)', async () => {
  const from = '573222222222@c.us';
  const m1 = fakeMsg({ from, body: 'asdfgh' });
  const m2 = fakeMsg({ from, body: 'qwerty' });
  const m3 = fakeMsg({ from, body: 'zxcvbn' });
  await routeMessage(m1);
  await routeMessage(m2);
  await routeMessage(m3);
  assert.equal(m1.replies.length, 1);
  assert.equal(m2.replies.length, 0);
  assert.equal(m3.replies.length, 0);
});

test('mensajes que no son tipo chat (sticker, audio) no disparan fallback', async () => {
  for (const type of ['sticker', 'ptt', 'audio', 'video']) {
    const m = fakeMsg({ from: `${type}@c.us`, type, body: '' });
    await routeMessage(m);
    assert.equal(m.replies.length, 0);
  }
});

test('el menú sigue funcionando para saludos tipo chat', async () => {
  const m = fakeMsg({ from: '573333333333@c.us', body: 'hola' });
  await routeMessage(m);
  assert.equal(m.replies.length, 1);
});
