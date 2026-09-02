# Architecture

## Structure
src/
App.jsx currentPage state — decides which page renders
pages/ Markets, CoinDetail, Watchlist, Compare
components/ Table, charts, header/footer, loading/error states
hooks/ Data fetching, watchlist, compare, theme, search
services/ coingecko.js — the only file that calls the API
utils/ Formatting, sparkline conversion, localStorage store, fetch cache


## Navigation

No router library. `App.jsx` holds a `currentPage` value and swaps between page
components. Coin clicks call `onSelectCoin(id)`, which sets the selected coin and
switches to the detail view.

## Data & caching

`services/coingecko.js` is the single network boundary — it attaches the API key,
normalizes responses, and throws a typed error on failure (with special handling for
HTTP 429 rate limits).

`utils/cache.js` is a small in-memory cache (timestamped `Map`) so switching between
Markets/Watchlist/Compare doesn't refetch data that's still fresh.

`hooks/useMarketData.js` wraps that cache in three hooks — `useTopCoins`,
`useCoinDetail`, `useMarketChart` — each checking the cache, fetching if stale, and
retrying once (~7s delay) on a 429.

## Persistence

Watchlist, compare selection, and theme all persist via `localStorage`, sharing one
`createStore`/`useStore` primitive (`utils/store.js`) built on `useSyncExternalStore`.