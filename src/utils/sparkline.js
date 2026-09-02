const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
export function sparklineToPoints(prices, now = Date.now()) {
  if (!prices || prices.length < 2) return [];
  const step = SEVEN_DAYS_MS / (prices.length - 1);
  return prices.map((price, index) => ({ t: now - SEVEN_DAYS_MS + index * step, price }));
}
