const { msgFallback } = require('../messages/templates');

module.exports = async (msg) => {
  await msg.reply(msgFallback());
};
