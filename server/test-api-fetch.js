const fetch = require('node-fetch');

(async () => {
  const url = 'https://ascensionlogs.gg/api/rankings/damage/overall?difficulty=ascended&phase=2&location=Molten%20Core';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://ascensionlogs.gg/rankings/damage/overall?difficulty=ascended&phase=2&location=Molten%20Core',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    console.log('Status', res.status);
    const txt = await res.text();
    console.log('Body length:', txt.length);
    console.log('Preview:', txt.slice(0,1000));
  } catch (err) {
    console.error('Error fetching api', err);
  }
})();
