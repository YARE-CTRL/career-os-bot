// Estado de conversaciones en memoria
// { chatId → { userId, step: 'waiting_receipt'|'receipt_received'|'human_requested' } }
const conversations = new Map();

function getState(chatId) {
  return conversations.get(chatId) || null;
}

function setState(chatId, state) {
  const current = getState(chatId) || {};
  conversations.set(chatId, { ...current, ...state });
}

function clearState(chatId) {
  conversations.delete(chatId);
}

module.exports = {
  getState,
  setState,
  clearState
};
