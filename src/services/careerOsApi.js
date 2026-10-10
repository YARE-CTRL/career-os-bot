const config = require('../config/env');

async function grantProPlan(userId) {
  const url = `${config.WEB_APP_URL}/api/admin/grant`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      secret: config.API_SECRET,
      planId: 'pro'
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return await response.json();
}

module.exports = { grantProPlan };
