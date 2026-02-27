const { chromium } = require('playwright');

// Map class names to canonical WoW class names
const CLASSES = [
  'Rogue', 'Priest', 'Mage', 'Warrior', 'Paladin', 
  'Hunter', 'Shaman', 'Warlock', 'Druid'
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

async function fetchRankingsForClass(className, difficulty = 'ascended') {
  const url = `https://ascensionlogs.gg/rankings/damage/overall?difficulty=${encodeURIComponent(difficulty)}&phase=2&location=Molten%20Core&class=${encodeURIComponent(className)}&page=1`;

  let browser = null;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log(`Fetching ${className} rankings for ${difficulty}...`);
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    
    try {
      await page.waitForSelector('table tbody tr', { timeout: 10000 });
    } catch {
      console.warn(`Table timeout for ${className} (${difficulty})`);
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

async function fetchAllClassRankings(difficulty = 'ascended') {
  const classStats = {};
  
  // Fetch data for each class
  for (const className of CLASSES) {
    const players = await fetchRankingsForClass(className, difficulty);
    
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

async function fetchAllDifficultiesRankings() {
  const difficulties = ['mythic', 'heroic', 'normal', 'ascended'];
  const allDifficultyStats = {};
  
  // Fetch data for each difficulty
  for (const difficulty of difficulties) {
    console.log(`Fetching all classes for ${difficulty}...`);
    const diffStats = await fetchAllClassRankings(difficulty);
    
    // Merge stats from this difficulty into the overall stats
    for (const className of CLASSES) {
      if (!allDifficultyStats[className]) {
        allDifficultyStats[className] = {
          class: className,
          playerCount: 0,
          totalPoints: 0,
          maxPoints: 0,
          minPoints: Infinity,
          topPlayer: 'N/A',
          topPlayerPoints: 0,
          difficultyBreakdown: {}
        };
      }
      
      if (diffStats[className]) {
        const stats = diffStats[className];
        allDifficultyStats[className].playerCount += stats.playerCount;
        allDifficultyStats[className].totalPoints += stats.totalPoints;
        allDifficultyStats[className].maxPoints = Math.max(
          allDifficultyStats[className].maxPoints,
          stats.maxPoints
        );
        allDifficultyStats[className].minPoints = Math.min(
          allDifficultyStats[className].minPoints,
          stats.minPoints === Infinity ? Infinity : stats.minPoints
        );
        
        // Track top player across all difficulties
        if (stats.topPlayerPoints > allDifficultyStats[className].topPlayerPoints) {
          allDifficultyStats[className].topPlayer = stats.topPlayer;
          allDifficultyStats[className].topPlayerPoints = stats.topPlayerPoints;
        }
        
        // Store breakdown by difficulty
        allDifficultyStats[className].difficultyBreakdown[difficulty] = {
          playerCount: stats.playerCount,
          avgPoints: stats.avgPoints,
          maxPoints: stats.maxPoints
        };
      }
    }
  }
  
  // Calculate final averages
  for (const className of CLASSES) {
    const stats = allDifficultyStats[className];
    if (stats.playerCount > 0) {
      stats.avgPoints = Math.round((stats.totalPoints / stats.playerCount) * 100) / 100;
    }
    // Handle minPoints if it was never set
    if (stats.minPoints === Infinity) {
      stats.minPoints = stats.maxPoints;
    }
  }
  
  return allDifficultyStats;
}

module.exports = { fetchAllClassRankings, fetchRankingsForClass, fetchAllDifficultiesRankings };
