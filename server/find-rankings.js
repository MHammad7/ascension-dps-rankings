const fetch = require('node-fetch');

(async () => {
  const asset = 'https://ascensionlogs.gg/assets/index-DfQGqQ4J.js';
  try {
    const r = await fetch(asset, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const txt = await r.text();
    const idx = txt.indexOf('damage');
    console.log('indexOf "damage" =', idx);
    if (idx !== -1) console.log(txt.slice(Math.max(0, idx-120), idx+200));
  } catch (e) {
    console.error('err', e.message);
  }
})();
