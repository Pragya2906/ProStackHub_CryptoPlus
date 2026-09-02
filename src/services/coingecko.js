/*** All CoinGecko network access lives here */
const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;

export class ApiError extends Error {
  status;
  constructor(message, status = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
/** Safely read a key from unknown JSON. */
function get(value, ...path) {
  let current = value;
  for (const key of path) {
    if (typeof current !== "object" || current === null) return undefined;
    current = current[key];
  }
  return current;
}
/** Coerce anything non-numeric (null, undefined, NaN) to null. */
function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function str(value) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
async function request(path, signal) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        accept: "application/json",
        ...(API_KEY ? { "x-cg-demo-api-key": API_KEY } : {}),
      },
      signal: signal ?? null,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("Could not reach the market feed. Check your connection and try again.");
  }
  if (response.status === 429) {
    throw new ApiError(
      "CoinGecko's free rate limit was hit. Wait a few seconds and try again.",
      429,
    );
  }
  if (!response.ok) {
    throw new ApiError(`The market feed responded with ${response.status}.`, response.status);
  }
  try {
    return await response.json();
  } catch {
    throw new ApiError("The market feed returned data we could not read.");
  }
}
/** Top coins by market cap, including a 7-day sparkline used for previews. */
export async function fetchTopCoins(limit = 20, signal) {
  const data = await request(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h%2C7d`,
    signal,
  );
  if (!Array.isArray(data)) throw new ApiError("The market feed returned an unexpected shape.");
  return data
    .map((raw, index) => {
      const sparkline = get(raw, "sparkline_in_7d", "price");
      return {
        id: str(get(raw, "id")) ?? "",
        symbol: str(get(raw, "symbol")) ?? "",
        name: str(get(raw, "name")) ?? "Unknown asset",
        image: str(get(raw, "image")) ?? "",
        market_cap_rank: num(get(raw, "market_cap_rank")) ?? index + 1,
        current_price: num(get(raw, "current_price")),
        market_cap: num(get(raw, "market_cap")),
        total_volume: num(get(raw, "total_volume")),
        high_24h: num(get(raw, "high_24h")),
        low_24h: num(get(raw, "low_24h")),
        circulating_supply: num(get(raw, "circulating_supply")),
        price_change_percentage_24h_in_currency: num(
          get(raw, "price_change_percentage_24h_in_currency"),
        ),
        price_change_percentage_7d_in_currency: num(
          get(raw, "price_change_percentage_7d_in_currency"),
        ),
        sparkline_in_7d: {
          price: Array.isArray(sparkline)
            ? sparkline.filter((p) => typeof p === "number" && Number.isFinite(p))
            : [],
        },
      };
    })
    .filter((coin) => coin.id.length > 0);
}

/** Full profile for a single coin. */
export async function fetchCoinDetail(id, signal) {
  const raw = await request(
    `/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
    signal,
  );
  const usd = (key) => num(get(raw, "market_data", key, "usd"));
  const categories = get(raw, "categories");
  return {
    id: str(get(raw, "id")) ?? id,
    symbol: str(get(raw, "symbol")) ?? "",
    name: str(get(raw, "name")) ?? "Unknown asset",
    image: str(get(raw, "image", "large")) ?? str(get(raw, "image", "small")) ?? "",
    rank: num(get(raw, "market_cap_rank")),
    description: str(get(raw, "description", "en"))?.replace(/<[^>]*>/g, "") ?? null,
    homepage: str(get(raw, "links", "homepage", "0")),
    genesisDate: str(get(raw, "genesis_date")),
    categories: Array.isArray(categories)
      ? categories.filter((c) => typeof c === "string").slice(0, 4)
      : [],
    price: usd("current_price"),
    marketCap: usd("market_cap"),
    volume24h: usd("total_volume"),
    high24h: usd("high_24h"),
    low24h: usd("low_24h"),
    ath: usd("ath"),
    atl: usd("atl"),
    circulatingSupply: num(get(raw, "market_data", "circulating_supply")),
    totalSupply: num(get(raw, "market_data", "total_supply")),
    change24h: num(get(raw, "market_data", "price_change_percentage_24h")),
    change7d: num(get(raw, "market_data", "price_change_percentage_7d")),
  };
}
/** Historical prices for a coin over `days` days. */
export async function fetchMarketChart(id, days = 7, signal) {
  const raw = await request(
    `/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`,
    signal,
  );
  const prices = get(raw, "prices");
  if (!Array.isArray(prices)) throw new ApiError("No price history is available right now.");
  const points = prices
    .filter((entry) => Array.isArray(entry) && entry.length >= 2)
    .map((entry) => ({ t: Number(entry[0]), price: Number(entry[1]) }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.price));
  if (points.length === 0) throw new ApiError("No price history is available right now.");
  return points;
}