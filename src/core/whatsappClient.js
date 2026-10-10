const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('../config/env');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: config.SESSION_PATH }),
  puppeteer: {
    headless: true,
    executablePath: config.PUPPETEER_EXECUTABLE_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--js-flags="--max-old-space-size=256"',
      '--disable-software-rasterizer',
      '--disable-features=site-per-process'
    ],
  },
});

module.exports = client;
