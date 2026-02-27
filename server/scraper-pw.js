const { chromium } = require('playwright');

// Map class names to canonical WoW class names

async function fetchRankings({ location = 'Molten Core', difficulty = 'ascended', phase = '2', class: cls = null, page = 1 } = {}) {
  const qLocation = encodeURIComponent(location);
  const params = `difficulty=${encodeURIComponent(difficulty)}&phase=${encodeURIComponent(phase)}&location=${qLocation}&page=${page}` + (cls ? `&class=${encodeURIComponent(cls)}` : '');
  const url = `https://ascensionlogs.gg/rankings/damage/overall?${params}`;

  let browser = null;
  try {
    browser = await chromium.launch({ headless: true });
    const page_ctx = await browser.newPage();
    
    console.log(`Fetching ${url}...`);
    await page_ctx.goto(url, { waitUntil: 'load' });
    
    // Wait for table to load
    try {
      await page_ctx.waitForSelector('table tbody tr', { timeout: 10000 });
    } catch {
      console.warn('Table selector timeout, proceeding anyway...');
    }

    // Extract rows from DOM
    const rows = await page_ctx.evaluate(() => {
      const result = [];
      const tableRows = Array.from(document.querySelectorAll('table tbody tr'));
      
      tableRows.forEach((el, i) => {
        const tds = el.querySelectorAll('td');
        let rank = null;
        let name = null;
        let points = null;

        if (tds.length >= 3) {
          const rankText = tds[0].textContent.trim().replace(/[^0-9]/g, '');
          rank = rankText ? parseInt(rankText, 10) : i + 1;
          name = tds[1].textContent.trim();
          const ptsText = tds[2].textContent.trim().replace(/[^0-9]/g, '');
          points = ptsText ? parseInt(ptsText, 10) : null;
        }

        result.push({
          rank,
          name: name || null,
          points,
          class: null // We'll set this based on the URL parameter
        });
      });

      return result;
    });

    await page_ctx.close();

    // Since we're filtering by class in the URL, all results are that class
    if (cls) {
      rows.forEach(r => { r.class = cls; });
    }

    return rows;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { fetchRankings };
