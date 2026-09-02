import { useSyncExternalStore } from "react";
export function createStore(fallback, storageKey) {
  let value = fallback;
  let hydrated = false;
  const listeners = new Set();
  const emit = () => listeners.forEach((listener) => listener());
  function hydrate() {
    if (hydrated || !storageKey || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) {
        value = JSON.parse(raw);
        emit();
      }
    } catch {
      // Corrupt or unavailable storage: keep the in-memory fallback.
    }
  }
  return {
    get: () => value,
    getServerSnapshot: () => fallback,
    set(next) {
      value = next;
      if (storageKey && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // Storage full or blocked: state still works for this session.
        }
      }
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      hydrate();
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.get, store.getServerSnapshot);
}
