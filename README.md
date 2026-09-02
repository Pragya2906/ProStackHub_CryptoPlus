# CryptoPulse

A cryptocurrency market tracker — top 20 coins by market cap, live prices, 7-day charts,
a persistent watchlist, and a two-coin comparison view. Built for the ProStackHub
Frontend Development Internship (Task 2). Data from the CoinGecko API.

## Features

- **Markets table** — sortable (rank, price, market cap, 24h, 7d) and searchable by name/ticker
- **Coin detail view** — price, market cap, volume, ATH/ATL, and a 7-day Recharts line chart
- **Watchlist** — star coins, persisted in `localStorage`
- **Compare mode** — pick exactly two coins, overlay both 7-day trends on one chart
- **Dark/light mode** — persisted across sessions
- **Responsive**, with loading skeletons and error states (including graceful CoinGecko
  rate-limit handling)

## Tech stack

React 19 · Vite · Tailwind CSS v4 · Recharts · CoinGecko API

No router or data-fetching library — navigation and caching are hand-rolled and kept small.

## Running locally

```bash
npm install
npm run dev
```

Requires a free [CoinGecko Demo API key](https://www.coingecko.com/en/api). Add it to a
`.env` file in the project root: