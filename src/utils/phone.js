function extractUserId(text) {
  const match = text.match(/[Uu]ser\s*ID\s*[:\s]+([a-zA-Z0-9_\-]+)/);
  return match ? match[1].trim() : null;
}

function isGroup(chatId) {
  return chatId.includes('@g.us');
}

module.exports = {
  extractUserId,
  isGroup
};
