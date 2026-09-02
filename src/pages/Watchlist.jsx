import { MarketTable } from "@/components/MarketTable";
import {
  Card,
  EmptyState,
  ErrorState,
  SectionLabel,
  TableSkeleton,
  errorMessage,
} from "@/components/States";
import { useTopCoins } from "@/hooks/useMarketData";
import { matchesQuery, useSearch } from "@/hooks/useSearch";
import { useWatchlist } from "@/hooks/useWatchlist";

export function Watchlist({ onSelectCoin, onNavigate }) {
  const { query } = useSearch();
  const watchlist = useWatchlist();
  const { data, isPending, isError, error, refetch } = useTopCoins(20);
  const coins = (data ?? []).filter((coin) => watchlist.ids.includes(coin.id));
  const filtered = coins.filter((coin) => matchesQuery(query, coin.name, coin.symbol));

  return (
    <div>
      <section className="mb-6">
        <SectionLabel>Saved assets</SectionLabel>
        <h1 className="mt-1 text-balance font-display text-4xl font-semibold italic tracking-tight sm:text-5xl">
          Your watchlist.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Stored locally in this browser — it survives refreshes and returns on your next visit.
        </p>
      </section>

      {watchlist.ids.length === 0 ? (
        <Card>
          <EmptyState
            title="No coins starred yet"
            message="Open the markets table and star the assets you want to follow. They will appear here."
            action={
              <button
                type="button"
                onClick={() => onNavigate("markets")}
                className="rounded-md bg-foreground px-3 py-2 font-mono text-xs text-surface transition-opacity hover:opacity-90"
              >
                Browse markets
              </button>
            }
          />
        </Card>
      ) : isPending ? (
        <Card className="overflow-hidden">
          <TableSkeleton rows={Math.min(watchlist.ids.length, 6)} />
        </Card>
      ) : isError ? (
        <Card>
          <ErrorState
            title="Could not refresh your watchlist"
            message={errorMessage(error)}
            onRetry={() => refetch()}
          />
        </Card>
      ) : coins.length === 0 ? (
        <Card>
          <EmptyState
            title="Your starred coins left the top 20"
            message="This view tracks the top 20 by market cap. Star an asset that is currently ranked to see it here."
          />
        </Card>
      ) : (
        <MarketTable
          coins={filtered}
          onSelectCoin={onSelectCoin}
          emptyTitle="No matching starred assets"
          emptyMessage="None of your starred coins match that search."
        />
      )}
    </div>
  );
}