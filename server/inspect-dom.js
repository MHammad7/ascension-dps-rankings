const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://ascensionlogs.gg/rankings/damage/overall?difficulty=ascended&phase=2&location=Molten%20Core&page=1&class=Rogue', { waitUntil: 'load' });
  
  try {
    await page.waitForSelector('table tbody tr, div.rankings-list .row', { timeout: 5000 });
  } catch {
    console.log('No table found');
  }

  const pageHtml = await page.content();
  const lines = pageHtml.split('\n');
  // Find lines with "Yungpumpar" or similar player names
  for (let i = 0; i < Math.min(500, lines.length); i++) {
    if (lines[i].includes('Yungpumpar') || lines[i].includes('Snit') || lines[i].includes('row') || lines[i].includes('Rogue')) {
      console.log(`Line ${i}: ${lines[i]}`);
    }
  }

  await browser.close();
})();
