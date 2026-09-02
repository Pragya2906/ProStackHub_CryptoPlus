import { Moon, Search, Sun } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useTheme } from "@/hooks/useTheme";
const NAV = [
  { key: "markets", label: "Markets" },
  { key: "watchlist", label: "Watchlist" },
  { key: "compare", label: "Compare" },
];
export function AppHeader({ currentPage, onNavigate }) {
  const { query, setQuery } = useSearch();
  const { theme, toggle, mounted } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate("markets")}
          className="flex items-baseline gap-2 rounded-md">
          <span className="font-display text-2xl font-semibold italic leading-none tracking-tight">
            CryptoPulse
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:inline">
            live · coingecko
          </span>
        </button>

        <nav aria-label="Primary" className="order-3 flex items-center gap-1 text-sm sm:order-2">
          {NAV.map((item) => {
            const active = currentPage === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={`rounded-md px-3 py-2 font-medium transition-colors ${
                  active
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted hover:text-foreground"
                }`}>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
          <label className="relative">
            <span className="sr-only">Search assets by name or ticker</span>
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assets"
              className="w-36 rounded-md border border-border bg-surface py-2 pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary/50 sm:w-56"
            />
          </label>

          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-primary/40">
            {mounted ? (
              theme === "dark" ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )
            ) : (
              <span className="size-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}