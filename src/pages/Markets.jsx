import { CoinAvatar } from "@/components/CoinAvatar";
import { PriceChart } from "@/components/PriceChart";
import { MarketTable } from "@/components/MarketTable";
import { StarButton } from "@/components/StarButton";
import { BlockSkeleton, Card, EmptyState, ErrorState, SectionLabel, TableSkeleton, errorMessage} from "@/components/States";
import { useCompare } from "@/hooks/useCompare";
import { useTopCoins } from "@/hooks/useMarketData";
import { matchesQuery, useSearch } from "@/hooks/useSearch";
import { useWatchlist } from "@/hooks/useWatchlist";
import { changeToneClass, formatCompactUsd, formatPercent, formatPrice } from "@/utils/format";
import { sparklineToPoints } from "@/utils/sparkline";

export function Markets({ onSelectCoin, onNavigate }) {
  const { query } = useSearch();
  const watchlist = useWatchlist();
  const compare = useCompare();
  const { data, isPending, isError, error, refetch } = useTopCoins(20);

  const coins = data ?? [];
  const filtered = coins.filter((coin) => matchesQuery(query, coin.name, coin.symbol));
  const watched = coins.filter((coin) => watchlist.ids.includes(coin.id));
  const focus = coins[0];
  const focusPoints = sparklineToPoints(focus?.sparkline_in_7d?.price);
  const compareCoins = compare.ids
    .map((id) => coins.find((coin) => coin.id === id))
    .filter((coin) => Boolean(coin));

  return (
    <div>
      <section className="mb-6">
        <SectionLabel>(a) Top 20 · by market cap</SectionLabel>
        <h1 className="mt-1 text-balance font-display text-4xl font-semibold italic tracking-tight sm:text-5xl">
          The morning tape, ordered.
        </h1>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {isPending ? (
            <Card className="overflow-hidden">
              <div className="border-b border-border px-4 py-3">
                <SectionLabel>Loading markets</SectionLabel>
              </div>
              <TableSkeleton />
            </Card>
          ) : isError ? (
            <Card>
              <ErrorState
                title="Market feed unavailable"
                message={errorMessage(error)}
                onRetry={() => refetch()}
              />
            </Card>
          ) : (
            <MarketTable coins={filtered} onSelectCoin={onSelectCoin} />
          )}

          <Card className="mt-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <SectionLabel>(b) Watchlist</SectionLabel>
              <span className="font-mono text-xs text-muted">{watchlist.ids.length} saved</span>
            </div>
            {watchlist.ids.length === 0 ? (
              <EmptyState
                title="Nothing starred yet"
                message="Star any asset in the table to pin it here. Your picks are saved in this browser."
              />
            ) : (
              <div className="divide-y divide-border text-sm">
                {watched.map((coin) => (
                  <div key={coin.id} className="flex items-center gap-3 px-4 py-3">
                    <StarButton
                      active
                      label={coin.name}
                      onToggle={() => watchlist.toggle(coin.id)}
                    />
                    <button
                      type="button"
                      onClick={() => onSelectCoin(coin.id)}
                      className="flex min-w-0 items-center gap-2 rounded-md text-left hover:text-primary">
                      <span className="truncate font-medium">{coin.name}</span>
                      <span className="font-mono text-xs uppercase text-muted">{coin.symbol}</span>
                    </button>
                    <span
                      className={`ml-auto font-mono text-[13px] tabular-nums ${changeToneClass(coin.price_change_percentage_24h_in_currency)}`}>
                      {formatPercent(coin.price_change_percentage_24h_in_currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-4">
            {isPending ? (
              <BlockSkeleton className="h-32" />
            ) : focus ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CoinAvatar src={focus.image} name={focus.name} size="lg" />
                    <div>
                      <button
                        type="button"
                        onClick={() => onSelectCoin(focus.id)}
                        className="font-display text-2xl font-semibold italic leading-none hover:text-primary">
                        {focus.name}
                      </button>
                      <p className="mt-1 font-mono text-xs uppercase text-muted">
                        {focus.symbol} · #{focus.market_cap_rank}
                      </p>
                    </div>
                  </div>
                  <StarButton
                    active={watchlist.isWatched(focus.id)}
                    label={focus.name}
                    onToggle={() => watchlist.toggle(focus.id)}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border">
                  <Stat label="Price" value={formatPrice(focus.current_price)} />
                  <Stat label="Mkt Cap" value={formatCompactUsd(focus.market_cap)} />
                  <Stat
                    label="24h"
                    value={formatPercent(focus.price_change_percentage_24h_in_currency)}
                    tone={changeToneClass(focus.price_change_percentage_24h_in_currency)}
                  />
                  <Stat
                    label="7d"
                    value={formatPercent(focus.price_change_percentage_7d_in_currency)}
                    tone={changeToneClass(focus.price_change_percentage_7d_in_currency)}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">No asset data available.</p>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <SectionLabel>(c) 7-day · {focus?.symbol.toUpperCase() ?? "—"}</SectionLabel>
              {focusPoints.length > 1 ? (
                <p className="font-mono text-xs text-muted">
                  {formatPrice(focusPoints[0]?.price ?? null)} →{" "}
                  {formatPrice(focusPoints[focusPoints.length - 1]?.price ?? null)}
                </p>
              ) : null}
            </div>
            <div className="mt-3">
              {isPending ? (
                <BlockSkeleton className="h-40" />
              ) : focusPoints.length > 1 && focus ? (
                <PriceChart data={focusPoints} label={focus.name} height={180} />
              ) : (
                <p className="py-10 text-center text-sm text-muted">
                  No 7-day history available for this asset.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <SectionLabel>(d) Compare · two coins</SectionLabel>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {compareCoins.map((coin) => (
                <span
                  key={coin.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm">
                  <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                  {coin.name}
                  <button
                    type="button"
                    onClick={() => compare.remove(coin.id)}
                    aria-label={`Remove ${coin.name} from comparison`}
                    className="text-muted hover:text-foreground">
                    ×
                  </button>
                </span>
              ))}
              {compare.ids.length < 2 ? (
                <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-sm text-muted">
                  {compare.ids.length === 0
                    ? "Pick two coins with + in the table"
                    : "Pick one more coin"}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onNavigate("compare")}
              className="mt-3 inline-flex rounded-md bg-foreground px-3 py-2 font-mono text-xs text-surface transition-opacity hover:opacity-90">
              Open compare view
            </button>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, tone = "" }) {
  return (
    <div className="bg-surface p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={`mt-1 font-mono text-lg tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}