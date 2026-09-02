/** Display formatting helpers. Every function tolerates null/undefined input. */
const DASH = "—";
export function formatPrice(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return DASH;
  // Sub-dollar assets need more precision than blue chips.
  const digits = Math.abs(value) >= 1 ? 2 : Math.abs(value) >= 0.01 ? 4 : 8;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
export function formatCompactUsd(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return DASH;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}
export function formatNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return DASH;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}
export function formatPercent(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return DASH;
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}
/** Tailwind text token for a signed value. */
export function changeToneClass(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "text-muted";
  if (value > 0) return "text-gain";
  if (value < 0) return "text-loss";
  return "text-muted";
}
export function formatChartDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export function formatChartDateTime(ts) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
export function formatClock(date) {
  return date.toLocaleTimeString("en-GB", { hour12: false });
}
