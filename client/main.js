const classMap = {
  'Rogue': '#FFF569', 'Priest': '#FFFFFF', 'Mage': '#69CCF0',
  'Warrior': '#C79C6E', 'Paladin': '#F58CBA', 'Hunter': '#ABD473',
  'Shaman': '#0070DE', 'Warlock': '#9482C9', 'Druid': '#FF7D0A', 'Death Knight': '#C41F3B'
};

function colorForClass(className) {
  return classMap[className] || '#999';
}

function textColorForBg(hexColor) {
  if (!hexColor) return '#333';
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const luminosity = (r * 299 + g * 587 + b * 114) / 1000;
  return luminosity > 150 ? '#000' : '#fff';
}

async function init() {
  const statusDiv = document.getElementById('status');
  const rankingsContainer = document.getElementById('rankingsContainer');
  const refreshBtn = document.getElementById('refreshBtn');

  async function loadClassRankings() {
    statusDiv.className = 'loading';
    statusDiv.textContent = 'Loading class rankings...';
    rankingsContainer.innerHTML = '';

    try {
      const response = await fetch('/api/class-rankings');
      if (!response.ok) throw new Error('Failed to fetch class rankings');
        const payload = await response.json();
      if (!payload.ok) throw new Error('API responded with error');
      const classRankings = payload.data;

      if (!Array.isArray(classRankings) || classRankings.length === 0) {
        statusDiv.className = 'error';
        statusDiv.textContent = 'No class rankings available.';
        return;
      }

      classRankings.forEach((classData) => {
        const classColor = colorForClass(classData.class);
        const textColor = textColorForBg(classColor);

        const card = document.createElement('div');
        card.className = 'class-card';
        card.style.borderLeftColor = classColor;

        card.innerHTML = `
          <div class="rank-badge">#${classData.classRank}</div>
          <div class="class-badge" style="background: ${classColor}; color: ${textColor};">${classData.class}</div>
          <div class="stat">
            <span class="stat-label">Avg DPS</span>
            <span class="stat-value">${Math.round(classData.avgPoints)}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Players</span>
            <span class="stat-value">${classData.playerCount}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Max DPS</span>
            <span class="stat-value">${Math.round(classData.maxPoints)}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Min DPS</span>
            <span class="stat-value">${Math.round(classData.minPoints)}</span>
          </div>
          <div class="top-player">
            <span class="top-player-name">${classData.topPlayer}</span>: <span class="top-player-points">${Math.round(classData.topPlayerPoints)} pts</span>
          </div>
        `;

        rankingsContainer.appendChild(card);
      });

      statusDiv.className = 'success';
      statusDiv.textContent = `✓ Loaded ${classRankings.length} classes`;
    } catch (error) {
      statusDiv.className = 'error';
      statusDiv.textContent = `✗ Error: ${error.message}`;
      console.error('Load error:', error);
    }
  }

  refreshBtn?.addEventListener('click', loadClassRankings);

  // Auto-load on startup
  loadClassRankings();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
