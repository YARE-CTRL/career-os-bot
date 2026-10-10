const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('../config/env');

const isLinux = process.platform === 'linux';

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: config.SESSION_PATH }),
  puppeteer: {
    headless: true,
    executablePath: config.PUPPETEER_EXECUTABLE_PATH || (isLinux ? '/usr/bin/google-chrome-stable' : undefined),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu',
    ],
  },
});

module.exports = client;
