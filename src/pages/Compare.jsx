import { useMemo } from "react";
import { CoinAvatar } from "@/components/CoinAvatar";
import { CompareChart } from "@/components/CompareChart";
import {
  BlockSkeleton,
  Card,
  EmptyState,
  ErrorState,
  SectionLabel,
  errorMessage,
} from "@/components/States";
import { MAX_COMPARE, useCompare } from "@/hooks/useCompare";
import { useMarketChart, useTopCoins } from "@/hooks/useMarketData";
import { matchesQuery, useSearch } from "@/hooks/useSearch";
import { changeToneClass, formatPercent, formatPrice } from "@/utils/format";

const SERIES_COLORS = ["var(--color-primary)", "var(--color-foreground)"];

function toRelative(points) {
  const base = points[0]?.price;
  if (!base) return [];
  return points.map((point) => ((point.price - base) / base) * 100);
}

export function Compare({ onSelectCoin }) {
  const compare = useCompare();
  const { query } = useSearch();
  const markets = useTopCoins(20);
  const [firstId, secondId] = compare.ids;
  const firstChart = useMarketChart(firstId ?? "");
  const secondChart = useMarketChart(secondId ?? "");

  const coins = markets.data ?? [];
  const selected = compare.ids
    .map((id) => coins.find((coin) => coin.id === id))
    .filter((coin) => Boolean(coin));
  const pickable = coins.filter((coin) => matchesQuery(query, coin.name, coin.symbol));

  const bothSelected = Boolean(firstId) && Boolean(secondId);

  const rows = useMemo(() => {
    const a = firstChart.data ?? [];
    const b = secondChart.data ?? [];
    if (a.length < 2 || b.length < 2 || !firstId || !secondId) return [];
    const relA = toRelative(a);
    const relB = toRelative(b);
    const length = Math.min(relA.length, relB.length);
    return Array.from({ length }, (_, index) => ({
      t: a[index]?.t ?? 0,
      [firstId]: relA[index] ?? 0,
      [secondId]: relB[index] ?? 0,
    }));
  }, [firstChart.data, secondChart.data, firstId, secondId]);

  const chartsPending = bothSelected && (firstChart.isPending || secondChart.isPending);
  const chartsError = firstChart.isError || secondChart.isError;

  return (
    <div>
      <section className="mb-6">
        <SectionLabel>Compare · exactly two coins</SectionLabel>
        <h1 className="mt-1 text-balance font-display text-4xl font-semibold italic tracking-tight sm:text-5xl">
          Two assets, one week.
        </h1>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              {selected.map((coin, index) => (
                <span
                  key={coin.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-sm"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: SERIES_COLORS[index] }}
                    aria-hidden="true"
                  />
                  {coin.name}
                  <button
                    type="button"
                    onClick={() => compare.remove(coin.id)}
                    aria-label={`Remove ${coin.name} from comparison`}
                    className="text-muted transition-colors hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
              {compare.ids.length < MAX_COMPARE ? (
                <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-sm text-muted">
                  {MAX_COMPARE - compare.ids.length} more to pick
                </span>
              ) : (
                <button
                  type="button"
                  onClick={compare.clear}
                  className="rounded-full border border-border px-2.5 py-1 text-sm text-muted transition-colors hover:text-foreground"
                >
                  Clear both
                </button>
              )}
            </div>

            <div className="mt-4">
              {compare.ids.length < MAX_COMPARE ? (
                <EmptyState
                  title="Pick two coins"
                  message="Choose two assets from the list to draw both 7-day lines on the same chart."
                />
              ) : chartsPending ? (
                <BlockSkeleton className="h-72" />
              ) : chartsError ? (
                <ErrorState
                  title="Comparison data unavailable"
                  message={errorMessage(firstChart.error ?? secondChart.error)}
                  onRetry={() => {
                    firstChart.refetch();
                    secondChart.refetch();
                  }}
                />
              ) : rows.length > 1 ? (
                <>
                  <CompareChart
                    rows={rows}
                    series={selected.map((coin, index) => ({
                      key: coin.id,
                      name: `${coin.name} (${coin.symbol.toUpperCase()})`,
                      color: SERIES_COLORS[index] ?? "var(--color-muted)",
                    }))}
                  />
                  <p className="mt-2 font-mono text-[11px] text-muted">
                    Lines show percent change from 7 days ago, so assets at very different prices
                    stay comparable.
                  </p>
                </>
              ) : (
                <EmptyState
                  title="Not enough history"
                  message="One of these assets does not have enough 7-day data to compare."
                />
              )}
            </div>
          </Card>

          {selected.length === MAX_COMPARE ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {selected.map((coin) => (
                <Card key={coin.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <CoinAvatar src={coin.image} name={coin.name} />
                    <button
                      type="button"
                      onClick={() => onSelectCoin(coin.id)}
                      className="font-medium hover:text-primary"
                    >
                      {coin.name}
                    </button>
                  </div>
                  <dl className="mt-3 space-y-1 font-mono text-[13px]">
                    <div className="flex justify-between">
                      <dt className="text-muted">Price</dt>
                      <dd className="tabular-nums">{formatPrice(coin.current_price)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">24h</dt>
                      <dd
                        className={`tabular-nums ${changeToneClass(coin.price_change_percentage_24h_in_currency)}`}
                      >
                        {formatPercent(coin.price_change_percentage_24h_in_currency)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">7d</dt>
                      <dd
                        className={`tabular-nums ${changeToneClass(coin.price_change_percentage_7d_in_currency)}`}
                      >
                        {formatPercent(coin.price_change_percentage_7d_in_currency)}
                      </dd>
                    </div>
                  </dl>
                </Card>
              ))}
            </div>
          ) : null}
        </div>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <SectionLabel>Choose assets</SectionLabel>
            <span className="font-mono text-xs text-muted">
              {compare.ids.length}/{MAX_COMPARE}
            </span>
          </div>
          {markets.isPending ? (
            <div className="p-4">
              <BlockSkeleton className="h-64" />
            </div>
          ) : markets.isError ? (
            <ErrorState
              title="Could not load the asset list"
              message={errorMessage(markets.error)}
              onRetry={() => markets.refetch()}
            />
          ) : pickable.length === 0 ? (
            <EmptyState
              title="No matching assets"
              message="Clear the search in the header to see the full top 20."
            />
          ) : (
            <ul className="max-h-[28rem] divide-y divide-border overflow-y-auto text-sm">
              {pickable.map((coin) => {
                const isSelected = compare.isSelected(coin.id);
                const disabled = !isSelected && compare.isFull;
                return (
                  <li key={coin.id}>
                    <button
                      type="button"
                      onClick={() => compare.toggle(coin.id)}
                      disabled={disabled}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-foreground/[0.03]"} disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <CoinAvatar src={coin.image} name={coin.name} />
                      <span className="truncate font-medium">{coin.name}</span>
                      <span className="font-mono text-xs uppercase text-muted">{coin.symbol}</span>
                      <span className="ml-auto font-mono text-xs text-muted">
                        {isSelected ? "selected" : disabled ? "—" : "select"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}