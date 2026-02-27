const fetch = require('node-fetch');

(async () => {
  const url = 'https://ascensionlogs.gg/rankings/damage/overall?difficulty=ascended&phase=2&location=Molten%20Core&class=Rogue&page=1';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
    console.log('Status', res.status, res.statusText);
    const html = await res.text();
    console.log('HTML length:', html.length);
    console.log('Preview:\n', html.slice(0, 4000));
  } catch (err) {
    console.error('Fetch error:', err);
  }
})();
