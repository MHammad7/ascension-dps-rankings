const express = require('express');
const path = require('path');
const scraper = require('./scraper-pw');
const classStats = require('./class-stats');
const CLASS_MAP = require('./classMap');

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const cache = new Map();

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

function makeCacheKey(params) { return JSON.stringify(params); }

async function getRankings(params) {
  const key = makeCacheKey(params);
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && (now - entry.ts) < CACHE_TTL) return { data: entry.data, cached: true };
  const data = await scraper.fetchRankings(params);
  cache.set(key, { data, ts: now });
  return { data, cached: false };
}

async function getClassStats() {
  const key = 'class-stats';
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && (now - entry.ts) < CACHE_TTL) return { data: entry.data, cached: true };
  const data = await classStats.fetchAllClassRankings();
  cache.set(key, { data, ts: now });
  return { data, cached: false };
}

// Individual class rankings (original endpoint)
app.get('/api/rankings', async (req, res) => {
  const params = {
    location: req.query.location || 'Molten Core',
    difficulty: req.query.difficulty || 'ascended',
    phase: req.query.phase || '2',
    class: req.query.class || null,
    page: req.query.page || 1
  };
  try {
    const { data, cached } = await getRankings(params);
    res.json({ ok: true, meta: { cached }, data });
  } catch (err) {
    console.error('Error fetching rankings', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// CLASS-LEVEL DPS RANKINGS (new endpoint - aggregated by class)
app.get('/api/class-rankings', async (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'ascended';
    
    let diffData;
    if (difficulty === 'all' || difficulty === 'overall') {
      diffData = await classStats.fetchAllDifficultiesRankings();
    } else {
      diffData = await classStats.fetchAllClassRankings(difficulty);
    }
    
    // Sort by average points (descending)
    const sorted = Object.values(diffData).sort((a, b) => b.avgPoints - a.avgPoints);
    
    // Add rank
    const ranked = sorted.map((item, i) => ({
      ...item,
      classRank: i + 1,
      difficulty: difficulty === 'all' || difficulty === 'overall' ? 'overall' : difficulty
    }));
    
    res.json({ ok: true, meta: { difficulty }, data: ranked });
  } catch (err) {
    console.error('Error fetching class stats', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/class-map', (req, res) => {
  res.json(CLASS_MAP);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
