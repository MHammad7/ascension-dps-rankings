const fetch = require('node-fetch');

(async () => {
  const asset = 'https://ascensionlogs.gg/assets/index-DfQGqQ4J.js';
  try {
    const r = await fetch(asset, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const txt = await r.text();
    const re = /fetch\(`[^`]*rankings[^`]*`/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      const idx = m.index;
      console.log('\nFOUND fetch with rankings context:\n', txt.slice(Math.max(0, idx-120), Math.min(txt.length, idx+200)));
    }
  } catch (e) {
    console.error('err', e.message);
  }
})();
