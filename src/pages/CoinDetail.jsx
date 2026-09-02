import { ArrowLeft } from "lucide-react";
import { CoinAvatar } from "@/components/CoinAvatar";
import { PriceChart } from "@/components/PriceChart";
import { StarButton } from "@/components/StarButton";
import { BlockSkeleton, Card, ErrorState, SectionLabel, errorMessage } from "@/components/States";
import { MAX_COMPARE, useCompare } from "@/hooks/useCompare";
import { useCoinDetail, useMarketChart } from "@/hooks/useMarketData";
import { useWatchlist } from "@/hooks/useWatchlist";
import { changeToneClass, formatCompactUsd, formatNumber, formatPercent, formatPrice, } from "@/utils/format";

export function CoinDetail({ coinId, onBack }) {
    const watchlist = useWatchlist();
    const compare = useCompare();
    const detail = useCoinDetail(coinId);
    const chart = useMarketChart(coinId);
    const coin = detail.data;
    const selectedForCompare = compare.isSelected(coinId);

    return (
        <div>
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 rounded-md font-mono text-xs text-muted transition-colors hover:text-foreground">
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Back to markets
            </button>

            {detail.isPending ? (
                <div className="mt-4 space-y-4">
                    <BlockSkeleton className="h-28" />
                    <BlockSkeleton className="h-72" />
                </div>
            ) : detail.isError || !coin ? (
                <Card className="mt-4">
                    <ErrorState
                        title="Could not load this asset"
                        message={errorMessage(detail.error)}
                        onRetry={() => detail.refetch()}
                    />
                </Card>
            ) : (
                <>
                    <section className="mt-4 flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <CoinAvatar src={coin.image} name={coin.name} size="lg" />
                            <div>
                                <h1 className="font-display text-4xl font-semibold italic leading-none tracking-tight">
                                    {coin.name}
                                </h1>
                                <p className="mt-1 font-mono text-xs uppercase text-muted">
                                    {coin.symbol}
                                    {coin.rank ? ` · rank #${coin.rank}` : ""}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => compare.toggle(coinId)}
                                disabled={!selectedForCompare && compare.isFull}
                                aria-pressed={selectedForCompare}
                                className="rounded-md border border-border px-3 py-2 font-mono text-xs transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40">
                                {selectedForCompare
                                    ? "In comparison"
                                    : compare.isFull
                                        ? `Comparison full (${MAX_COMPARE})`
                                        : "Add to compare"}
                            </button>
                            <StarButton
                                active={watchlist.isWatched(coinId)}
                                label={coin.name}
                                onToggle={() => watchlist.toggle(coinId)}
                            />
                        </div>
                    </section>

                    <section className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <p className="font-mono text-3xl tabular-nums">{formatPrice(coin.price)}</p>
                        <p className={`font-mono text-sm tabular-nums ${changeToneClass(coin.change24h)}`}>
                            {formatPercent(coin.change24h)} · 24h
                        </p>
                        <p className={`font-mono text-sm tabular-nums ${changeToneClass(coin.change7d)}`}>
                            {formatPercent(coin.change7d)} · 7d
                        </p>
                    </section>

                    <section className="mt-4 grid gap-4 lg:grid-cols-5">
                        <Card className="p-4 lg:col-span-3">
                            <SectionLabel>7-day price</SectionLabel>
                            <div className="mt-3">
                                {chart.isPending ? (
                                    <BlockSkeleton className="h-64" />
                                ) : chart.isError ? (
                                    <ErrorState
                                        title="Chart unavailable"
                                        message={errorMessage(chart.error)}
                                        onRetry={() => chart.refetch()}
                                    />
                                ) : (
                                    <PriceChart data={chart.data} label={coin.name} />
                                )}
                            </div>
                        </Card>

                        <Card className="p-4 lg:col-span-2">
                            <SectionLabel>Key figures</SectionLabel>
                            <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border">
                                <Figure label="Market cap" value={formatCompactUsd(coin.marketCap)} />
                                <Figure label="24h volume" value={formatCompactUsd(coin.volume24h)} />
                                <Figure label="24h high" value={formatPrice(coin.high24h)} />
                                <Figure label="24h low" value={formatPrice(coin.low24h)} />
                                <Figure label="All-time high" value={formatPrice(coin.ath)} />
                                <Figure label="All-time low" value={formatPrice(coin.atl)} />
                                <Figure label="Circulating" value={formatNumber(coin.circulatingSupply)} />
                                <Figure label="Total supply" value={formatNumber(coin.totalSupply)} />
                            </dl>

                            {coin.categories.length > 0 ? (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {coin.categories.map((category) => (
                                        <span
                                            key={category}
                                            className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted">
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            ) : null}

                            {coin.genesisDate || coin.homepage ? (
                                <p className="mt-4 font-mono text-[11px] text-muted">
                                    {coin.genesisDate ? `Genesis ${coin.genesisDate}` : null}
                                    {coin.genesisDate && coin.homepage ? " · " : null}
                                    {coin.homepage ? (
                                        <a href={coin.homepage} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2 hover:text-foreground"> Official site </a>
                                    ) : null}
                                </p>
                            ) : null}
                        </Card>
                    </section>

                    {coin.description ? (
                        <Card className="mt-4 p-4">
                            <SectionLabel>About {coin.name}</SectionLabel>
                            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                                {coin.description.slice(0, 520)}
                                {coin.description.length > 520 ? "…" : ""}
                            </p>
                        </Card>
                    ) : null}
                </>
            )}
        </div>
    );
}

function Figure({ label, value }) {
    return (
        <div className="bg-surface p-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</dt>
            <dd className="mt-1 font-mono text-sm tabular-nums">{value}</dd>
        </div>
    );
}