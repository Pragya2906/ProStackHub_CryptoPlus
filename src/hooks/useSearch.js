import { createStore, useStore } from "@/utils/store";
/** Session-only search term shared between the header input and the tables. */
const searchStore = createStore("");
export function useSearch() {
  const query = useStore(searchStore);
  return { query, setQuery: (next) => searchStore.set(next) };
}
/** Case-insensitive match against a coin's name or ticker. */
export function matchesQuery(query, name, symbol) {
  const term = query.trim().toLowerCase();
  if (term.length === 0) return true;
  return name.toLowerCase().includes(term) || symbol.toLowerCase().includes(term);
}
