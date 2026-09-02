import { useCallback } from "react";
import { createStore, useStore } from "@/utils/store";
/** Compare mode accepts exactly two coins. */
export const MAX_COMPARE = 2;
const compareStore = createStore([], "cryptopulse:compare");
export function useCompare() {
  const ids = useStore(compareStore);
  const toggle = useCallback((id) => {
    const current = compareStore.get();
    if (current.includes(id)) {
      compareStore.set(current.filter((item) => item !== id));
      return;
    }
    if (current.length >= MAX_COMPARE) return; // selection is capped at two
    compareStore.set([...current, id]);
  }, []);
  const remove = useCallback((id) => {
    compareStore.set(compareStore.get().filter((item) => item !== id));
  }, []);
  const clear = useCallback(() => compareStore.set([]), []);
  return {
    ids,
    toggle,
    remove,
    clear,
    isSelected: (id) => ids.includes(id),
    isFull: ids.length >= MAX_COMPARE,
  };
}
