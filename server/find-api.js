const fetch = require('node-fetch');
const cheerio = require('cheerio');

(async () => {
  const pageUrl = 'https://ascensionlogs.gg/rankings/damage/overall?difficulty=ascended&phase=2&location=Molten%20Core';
  const res = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  const scripts = [];
  $('script[src]').each((i, s) => scripts.push($(s).attr('src')));
  for (const s of scripts) {
    const full = s.startsWith('http') ? s : `https://ascensionlogs.gg${s}`;
    const r = await fetch(full, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const txt = await r.text();
    const re = /fetch\(`[^`]*\/api[^`]*`/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      const idx = m.index;
      console.log('\nFOUND FETCH CALL context:', txt.slice(Math.max(0, idx-80), Math.min(txt.length, idx+200)));
    }
  }
})();
