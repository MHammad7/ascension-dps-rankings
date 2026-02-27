const { chromium } = require('playwright');

// Map class names to canonical WoW class names
const CLASSES = [
  'Rogue', 'Priest', 'Mage', 'Warrior', 'Paladin', 
  'Hunter', 'Shaman', 'Warlock', 'Druid', 'Death Knight'
];

const CLASS_MAP = {
  "druid": { name: "Druid", color: "#FF7D0A" },
  "hunter": { name: "Hunter", color: "#ABD473" },
  "mage": { name: "Mage", color: "#69CCF0" },
  "paladin": { name: "Paladin", color: "#F58CBA" },
  "priest": { name: "Priest", color: "#FFFFFF" },
  "rogue": { name: "Rogue", color: "#FFF569" },
  "shaman": { name: "Shaman", color: "#0070DE" },
  "warlock": { name: "Warlock", color: "#9482C9" },
  "warrior": { name: "Warrior", color: "#C79C6E" },
  "deathknight": { name: "Death Knight", color: "#C41F3B" },
};

async function fetchRankingsForClass(className) {
  const url = `https://ascensionlogs.gg/rankings/damage/overall?difficulty=ascended&phase=2&location=Molten%20Core&class=${encodeURIComponent(className)}&page=1`;

  let browser = null;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log(`Fetching ${className} rankings...`);
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    
    try {
      await page.waitForSelector('table tbody tr', { timeout: 10000 });
    } catch {
      console.warn(`Table timeout for ${className}`);
    }

    const rows = await page.evaluate(() => {
      const result = [];
      const tableRows = Array.from(document.querySelectorAll('table tbody tr'));
      
      tableRows.forEach((el) => {
        const tds = el.querySelectorAll('td');
        if (tds.length >= 3) {
          const rankText = tds[0].textContent.trim().replace(/[^0-9]/g, '');
          const rank = rankText ? parseInt(rankText, 10) : null;
          const name = tds[1].textContent.trim();
          const ptsText = tds[2].textContent.trim().replace(/[^0-9]/g, '');
          const points = ptsText ? parseInt(ptsText, 10) : null;
          
          if (name && points) {
            result.push({ rank, name, points });
          }
        }
      });

      return result;
    });

    await page.close();
    return rows;
  } catch (err) {
    console.error(`Error fetching ${className}:`, err.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

async function fetchAllClassRankings() {
  const classStats = {};
  
  // Fetch data for each class
  for (const className of CLASSES) {
    const players = await fetchRankingsForClass(className);
    
    if (players.length > 0) {
      const totalPoints = players.reduce((sum, p) => sum + (p.points || 0), 0);
      const avgPoints = totalPoints / players.length;
      const maxPoints = Math.max(...players.map(p => p.points || 0));
      const minPoints = Math.min(...players.map(p => p.points || 0));
      
      classStats[className] = {
        class: className,
        playerCount: players.length,
        totalPoints,
        avgPoints: Math.round(avgPoints * 100) / 100,
        maxPoints,
        minPoints,
        topPlayer: players[0]?.name || 'N/A',
        topPlayerPoints: players[0]?.points || 0
      };
    }
  }
  
  return classStats;
}

module.exports = { fetchAllClassRankings, fetchRankingsForClass };
