const client = require('../core/whatsappClient');
const { grantProPlan } = require('../services/careerOsApi');
const stateRepo = require('../repositories/stateRepository');

module.exports = async (msg) => {
  const text = msg.body.trim();
  if (text.startsWith('!aprobar')) {
    const parts = text.split(' ');
    if (parts.length < 2) {
      return msg.reply('❌ Formato incorrecto. Usa: !aprobar [userId]');
    }
    const userId = parts[1];

    try {
      await msg.reply(`⏳ Activando cuenta para ${userId}...`);
      await grantProPlan(userId);
      await msg.reply(`✅ Plan Pro activado exitosamente para ${userId}`);
      
      const customerChatId = stateRepo.findChatIdByUserId(userId);
      if (customerChatId) {
        await client.sendMessage(
          customerChatId, 
          '🎉 *¡Tu pago ha sido aprobado!*\n\nTu cuenta Pro ya está activa. Ya puedes acceder a todas las funciones en la plataforma.'
        );
        stateRepo.clearState(customerChatId);
      }
    } catch (err) {
      console.error('[Admin] Error activando plan:', err);
      await msg.reply(`❌ Error al activar plan: ${err.message}`);
    }
  }
};
