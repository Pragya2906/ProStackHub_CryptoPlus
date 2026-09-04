import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, fetchCoinDetail, fetchMarketChart, fetchTopCoins } from "@/services/coingecko";
import { getCached, setCached } from "@/utils/cache";

const ONE_MINUTE = 60_000;
export const RATE_LIMIT_RETRY_DELAY = 7_000;

export function isRateLimited(error) {
  return error instanceof ApiError && error.status === 429;
}


export function isRetryable(error) {
  if (isRateLimited(error)) return true;
  if (error instanceof ApiError && error.status === null) return true;
  return false;
}

function useCachedFetch(key, fetcher, maxAgeMs) {
  const [state, setState] = useState(() => {
    const cached = getCached(key, maxAgeMs);
    return { data: cached, isPending: cached === undefined, isError: false, error: null };
  });
  const retryCountRef = useRef(0);

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) {
        const cached = getCached(key, maxAgeMs);
        if (cached !== undefined) {
          setState({ data: cached, isPending: false, isError: false, error: null });
          return;
        }
      }
      setState((prev) => ({ ...prev, isPending: true, isError: false, error: null }));
      retryCountRef.current = 0;
      await attempt();

      async function attempt() {
        try {
          const data = await fetcher();
          setCached(key, data);
          setState({ data, isPending: false, isError: false, error: null });
        } catch (error) {
          if (isRetryable(error) && retryCountRef.current < 2) {
            retryCountRef.current += 1;
            await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_RETRY_DELAY));
            await attempt();
            return;
          }
          setState({ data: undefined, isPending: false, isError: true, error });
        }
      }
    },
    [key, maxAgeMs],
  );

  useEffect(() => {
    load();
  }, [key]);

  return { ...state, refetch: () => load(true) };
}

export function useTopCoins(limit = 20) {
  return useCachedFetch(`markets:${limit}`, () => fetchTopCoins(limit), ONE_MINUTE);
}

export function useCoinDetail(id) {
  return useCachedFetch(`detail:${id}`, () => fetchCoinDetail(id), 5 * ONE_MINUTE);
}

export function useMarketChart(id, days = 7) {
  return useCachedFetch(`chart:${id}:${days}`, () => fetchMarketChart(id, days), 10 * ONE_MINUTE);
}