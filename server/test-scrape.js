const { fetchRankings } = require('./scraper-pw');

(async () => {
  try {
    const rows = await fetchRankings({ class: 'Rogue', page: 1 });
    console.log('Rows length:', rows.length);
    console.log(JSON.stringify(rows.slice(0, 10), null, 2));
  } catch (err) {
    console.error('Error during test scrape:', err);
  }
})();
