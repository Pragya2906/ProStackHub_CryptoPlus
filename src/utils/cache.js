const cache = new Map();

export function getCached(key, maxAgeMs) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.time > maxAgeMs) return undefined;
  return entry.data;
}

export function setCached(key, data) {
  cache.set(key, { data, time: Date.now() });
}