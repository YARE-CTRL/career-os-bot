const { msgGreeting } = require('../messages/templates');

module.exports = async (msg) => {
  await msg.reply(msgGreeting());
};
