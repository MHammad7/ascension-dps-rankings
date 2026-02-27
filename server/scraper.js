const fetch = require('node-fetch');
const cheerio = require('cheerio');
const CLASS_MAP = require('./classMap');

function normalizeClassToken(token) {
  if (!token) return null;
  const t = token.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  if (CLASS_MAP[t]) return CLASS_MAP[t].name;
  // try contains
  for (const key of Object.keys(CLASS_MAP)) {
    if (t.indexOf(key) !== -1) return CLASS_MAP[key].name;
  }
  return null;
}

async function fetchRankings({ location = 'Molten Core', difficulty = 'ascended', phase = '2', class: cls = null, page = 1 } = {}) {
  const qLocation = encodeURIComponent(location);
  const params = `difficulty=${encodeURIComponent(difficulty)}&phase=${encodeURIComponent(phase)}&location=${qLocation}&page=${page}` + (cls ? `&class=${encodeURIComponent(cls)}` : '');
  const url = `https://ascensionlogs.gg/rankings/damage/overall?${params}`;

  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' } });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const rows = [];
  // Primary: table rows
  let tableRows = $('table tbody tr');
  if (tableRows.length === 0) {
    // fallback: rows in divs
    tableRows = $('div.rankings-list .row');
  }

  tableRows.each((i, el) => {
    const $el = $(el);
    const tds = $el.find('td');
    let rank = null;
    let name = null;
    let points = null;

    if (tds.length >= 3) {
      rank = $($el.find('td').get(0)).text().trim().replace(/[^0-9]/g, '') || (i + 1);
      name = $($el.find('td').get(1)).text().trim();
      const ptsText = $($el.find('td').get(2)).text().trim().replace(/[^0-9]/g, '');
      points = ptsText ? parseInt(ptsText, 10) : null;
    } else {
      // fallback parsing for list layout
      const cols = $el.find('.col');
      rank = $($el.find('.rank').first()).text().trim().replace(/[^0-9]/g, '') || (i + 1);
      name = $el.find('.player').first().text().trim() || $el.text().trim();
      const ptsText = $el.find('.points').first().text().trim().replace(/[^0-9]/g, '');
      points = ptsText ? parseInt(ptsText, 10) : null;
    }

    // detect class
    let detectedClass = null;
    const dataClass = $el.attr('data-class');
    if (dataClass) detectedClass = normalizeClassToken(dataClass);

    if (!detectedClass) {
      // look for class tokens in children class attributes
      $el.find('*').each((_, node) => {
        if (detectedClass) return;
        const clsAttr = $(node).attr('class') || '';
        const match = clsAttr.match(/(rogue|mage|priest|warrior|paladin|hunter|shaman|warlock|druid|deathknight|death-knight|death_knight)/i);
        if (match) detectedClass = normalizeClassToken(match[0]);
      });
    }

    if (!detectedClass) {
      // try to infer from inline style color on name
      const nameElem = $el.find('td').eq(1).find('*').first();
      const color = nameElem.css('color');
      if (color) {
        // not attempting to map arbitrary colors here; leave null for frontend to color by class mapping
      }
    }

    rows.push({ rank: rank ? parseInt(rank, 10) : i + 1, name: name || null, points, class: detectedClass });
  });

  return rows;
}

module.exports = { fetchRankings };
