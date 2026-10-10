const fs = require('fs');
const path = require('path');
const config = require('../config/env');

function logPayment(entry) {
  let logs = [];
  try {
    if (fs.existsSync(config.LOG_PATH)) {
      logs = JSON.parse(fs.readFileSync(config.LOG_PATH, 'utf-8'));
    }
  } catch { /* primer registro */ }
  logs.push({ ...entry, createdAt: new Date().toISOString() });
  
  const dir = path.dirname(config.LOG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(config.LOG_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  console.log('[Payment Log] Nuevo registro:', JSON.stringify(entry));
}

module.exports = {
  logPayment
};
