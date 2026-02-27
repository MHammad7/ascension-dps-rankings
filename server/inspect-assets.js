const fetch = require('node-fetch');
const cheerio = require('cheerio');

(async () => {
  const url = 'https://ascensionlogs.gg/rankings/damage/overall?difficulty=ascended&phase=2&location=Molten%20Core';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    const scripts = [];
    $('script[src]').each((i, s) => scripts.push($(s).attr('src')));
    console.log('Scripts found:', scripts);
    for (const s of scripts) {
      const full = s.startsWith('http') ? s : `https://ascensionlogs.gg${s}`;
      try {
        const r = await fetch(full, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const txt = await r.text();
        console.log('\n--- asset:', full, 'length', txt.length);
        const idx = txt.indexOf('/api/');
        if (idx !== -1) {
          console.log('Found /api/ at', idx, 'context:', txt.slice(Math.max(0, idx-100), idx+200));
        }
        // Also search for 'rankings' endpoint usage
        const idx2 = txt.indexOf('rankings');
        if (idx2 !== -1) console.log('Found "rankings" at', idx2);
      } catch (e) {
        console.error('Failed to fetch asset', full, e.message);
      }
    }
  } catch (err) {
    console.error('Inspect error', err);
  }
})();
