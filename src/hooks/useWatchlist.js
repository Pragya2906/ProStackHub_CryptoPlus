import { useCallback } from "react";
import { createStore, useStore } from "@/utils/store";
const watchlistStore = createStore([], "cryptopulse:watchlist");
export function useWatchlist() {
  const ids = useStore(watchlistStore);
  const toggle = useCallback((id) => {
    const current = watchlistStore.get();
    watchlistStore.set(
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }, []);
  const remove = useCallback((id) => {
    watchlistStore.set(watchlistStore.get().filter((item) => item !== id));
  }, []);
  const isWatched = useCallback((id) => ids.includes(id), [ids]);
  return { ids, toggle, remove, isWatched };
}
