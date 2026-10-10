const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const STATE_FILE = path.join(path.dirname(config.LOG_PATH), 'state.json');
let conversations = new Map();

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
      conversations = new Map(Object.entries(data));
    }
  } catch (err) {
    console.error('[State] Error cargando estado:', err);
  }
}

function saveState() {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = Object.fromEntries(conversations);
    fs.writeFileSync(STATE_FILE, JSON.stringify(data), 'utf-8');
  } catch (err) {
    console.error('[State] Error guardando estado:', err);
  }
}

loadState();

function getState(chatId) {
  return conversations.get(chatId) || null;
}

function setState(chatId, state) {
  const current = getState(chatId) || {};
  conversations.set(chatId, { ...current, ...state });
  saveState();
}

function clearState(chatId) {
  conversations.delete(chatId);
  saveState();
}

module.exports = {
  getState,
  setState,
  clearState
};
