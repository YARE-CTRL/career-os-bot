require('dotenv').config();

const config = {
  NEQUI_NUMBER: process.env.NEQUI_NUMBER || '3053421833',
  PLAN_PRICE: process.env.PLAN_PRICE || '9.900',
  PLAN_NAME: process.env.PLAN_NAME || 'Plan Pro',
  SESSION_PATH: process.env.SESSION_DATA_PATH || '/data/.wwebjs_auth',
  LOG_PATH: process.env.PAYMENT_LOG_PATH || '/data/payments.json',
  PORT: process.env.PORT || 3001,
  PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH,
};

module.exports = config;
