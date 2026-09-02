import { useMemo, useState } from "react";
import { CoinAvatar } from "@/components/CoinAvatar";
import { StarButton } from "@/components/StarButton";
import { EmptyState } from "@/components/States";
import { useCompare } from "@/hooks/useCompare";
import { useWatchlist } from "@/hooks/useWatchlist";
import { changeToneClass, formatCompactUsd, formatPercent, formatPrice } from "@/utils/format";
const SORTS = [
    { key: "rank", label: "Rank" },
    { key: "price", label: "Price" },
    { key: "market_cap", label: "Mkt Cap" },
    { key: "change_24h", label: "24h" },
    { key: "change_7d", label: "7d" },
];
const GRID = "grid grid-cols-[24px_minmax(0,1fr)_auto_32px] md:grid-cols-[28px_minmax(0,1fr)_104px_96px_80px_80px_36px_32px] items-center gap-2 md:gap-3";
function sortValue(coin, key) {
    switch (key) {
        case "price":
            return coin.current_price ?? -Infinity;
        case "market_cap":
            return coin.market_cap ?? -Infinity;
        case "change_24h":
            return coin.price_change_percentage_24h_in_currency ?? -Infinity;
        case "change_7d":
            return coin.price_change_percentage_7d_in_currency ?? -Infinity;
        default:
            return coin.market_cap_rank ?? Infinity;
    }
}
export function MarketTable({
    coins,
    onSelectCoin,
    emptyTitle = "No matching assets",
    emptyMessage = "Nothing in the top 20 matches that search. Try a different name or ticker.",
}) {
    const [sortKey, setSortKey] = useState("rank");
    const [direction, setDirection] = useState("asc");
    const watchlist = useWatchlist();
    const compare = useCompare();
    const sorted = useMemo(() => {
        const factor = direction === "asc" ? 1 : -1;
        return [...coins].sort((a, b) => (sortValue(a, sortKey) - sortValue(b, sortKey)) * factor);
    }, [coins, sortKey, direction]);
    function applySort(key) {
        if (key === sortKey) {
            setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            return;
        }
        setSortKey(key);
        setDirection(key === "rank" ? "asc" : "desc");
    }
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Sort</span>
                {SORTS.map((option) => {
                    const active = option.key === sortKey;
                    return (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => applySort(option.key)}
                            aria-pressed={active}
                            className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${active
                                ? "bg-foreground text-surface"
                                : "border border-border text-foreground hover:border-primary/40"
                                }`}>
                            {option.label}
                            {active ? <span aria-hidden="true">{direction === "asc" ? " ↑" : " ↓"}</span> : null}
                        </button>
                    );
                })}
                <span className="ml-auto font-mono text-xs text-muted">{sorted.length} shown</span>
            </div>

            {sorted.length === 0 ? (
                <EmptyState title={emptyTitle} message={emptyMessage} />
            ) : (
                <>
                    <div
                        className={`${GRID} border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted`}>
                        <span>#</span>
                        <span>Asset</span>
                        <span className="text-right">Price</span>
                        <span className="hidden text-right md:block">Mkt Cap</span>
                        <span className="hidden text-right md:block">24h</span>
                        <span className="hidden text-right md:block">7d</span>
                        <span className="hidden text-center md:block">Cmp</span>
                        <span className="sr-only">Watchlist</span>
                    </div>

                    <div className="divide-y divide-border text-sm">
                        {sorted.map((coin, index) => {
                            const selectedForCompare = compare.isSelected(coin.id);
                            return (
                                <div
                                    key={coin.id}
                                    className={`cp-row ${GRID} relative px-4 py-2.5 transition-colors hover:bg-foreground/[0.03]`}
                                    style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}>
                                    <span className="font-mono text-xs text-muted">{coin.market_cap_rank}</span>

                                    <button
                                        type="button"
                                        onClick={() => onSelectCoin(coin.id)}
                                        className="flex min-w-0 items-center gap-2 rounded-md text-left">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        <CoinAvatar src={coin.image} name={coin.name} />
                                        <span className="truncate font-medium">{coin.name}</span>
                                        <span className="font-mono text-xs uppercase text-muted">{coin.symbol}</span>
                                    </button>

                                    <div className="text-right">
                                        <p className="font-mono text-[13px] tabular-nums">
                                            {formatPrice(coin.current_price)}
                                        </p>
                                        <p
                                            className={`font-mono text-[11px] tabular-nums md:hidden ${changeToneClass(coin.price_change_percentage_24h_in_currency)}`}>
                                            {formatPercent(coin.price_change_percentage_24h_in_currency)}
                                        </p>
                                    </div>

                                    <p className="hidden text-right font-mono text-[13px] tabular-nums text-muted md:block">
                                        {formatCompactUsd(coin.market_cap)}
                                    </p>
                                    <p
                                        className={`hidden text-right font-mono text-[13px] tabular-nums md:block ${changeToneClass(coin.price_change_percentage_24h_in_currency)}`}>
                                        {formatPercent(coin.price_change_percentage_24h_in_currency)}
                                    </p>
                                    <p
                                        className={`hidden text-right font-mono text-[13px] tabular-nums md:block ${changeToneClass(coin.price_change_percentage_7d_in_currency)}`}>
                                        {formatPercent(coin.price_change_percentage_7d_in_currency)}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => compare.toggle(coin.id)}
                                        disabled={!selectedForCompare && compare.isFull}
                                        aria-pressed={selectedForCompare}
                                        aria-label={
                                            selectedForCompare
                                                ? `Remove ${coin.name} from comparison`
                                                : `Add ${coin.name} to comparison`
                                        }
                                        title={
                                            !selectedForCompare && compare.isFull
                                                ? "Comparison already holds two coins"
                                                : undefined
                                        }
                                        className={`relative z-10 hidden size-7 place-items-center justify-self-center rounded-md border font-mono text-xs transition-colors md:grid ${selectedForCompare
                                            ? "border-primary/40 bg-primary/10 text-primary"
                                            : "border-border text-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                            }`}>
                                        {selectedForCompare ? "✓" : "+"}
                                    </button>

                                    <div className="relative z-10 justify-self-end">
                                        <StarButton
                                            active={watchlist.isWatched(coin.id)}
                                            label={coin.name}
                                            onToggle={() => watchlist.toggle(coin.id)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}