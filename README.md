# Ascension Logs DPS Rankings by Class

This repository contains a small Node.js/Express application that scrapes
[Ascension Logs](https://ascensionlogs.gg) (a React SPA) to compute and
present **class-level DPS rankings** for Molten Core (ascended difficulty,
phase 2).

## Features

- Headless Playwright browser renders the site & extracts ranking table data.
- Aggregates statistics across all ten WoW classes: average/max/min DPS,
  player count and top player.
- Caches results in-memory for 1 hour to avoid excessive scraping.
- REST API endpoints:
  - `/api/rankings?class=CLASS` returns the first page of individual player
    rankings for the given class.
  - `/api/class-rankings` returns aggregated class statistics sorted by average
    DPS.
  - `/api/class-map` returns a mapping of classes to their colors.
- Simple front‑end grid of cards showing each class with colored badges and
  stats; refresh button to re-fetch from the server.

## Getting started

1. **Clone** the repository:

   ```bash
   git clone https://github.com/<your-username>/ascension-dps-rankings.git
   cd ascension-dps-rankings
   ```

2. **Install dependencies** (Node.js 16+ recommended):

   ```bash
   npm install
   ```

3. **Run the server**:

   ```bash
   node server/index.js
   ```

   By default it listens on port 3000. Open http://localhost:3000 in your
   browser.

4. **Usage**
   - The homepage shows class rankings. Click "Refresh Rankings" to scrape
     fresh data (caching prevents redundant requests).
   - The JSON APIs can be queried directly for integration with other tools.

## Deploying / GitHub Pages

This is a dynamic Node.js application and cannot be fully hosted on GitHub
Pages. However, you can push this repository to GitHub and share the link so
others can clone and run it locally. To deploy the backend publicly, consider
hosting on a service like Heroku, Render, or Vercel (with a serverless
wrapper).

## Contributing

Feel free to fork and submit PRs. Issues and feature requests are welcome.

## License

MIT © Your Name

