const { msgHumanHandoff } = require('../messages/templates');
const { setState } = require('../repositories/stateRepository');

module.exports = async (msg, chatId) => {
  setState(chatId, { step: 'human_requested', humanRequestedAt: Date.now() });
  await msg.reply(msgHumanHandoff());
  console.log(`[Human] 🙋 Asesor solicitado por ${chatId}`);
};
