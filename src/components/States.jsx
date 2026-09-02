import { AlertTriangle, RefreshCw } from "lucide-react";
import { isRateLimited } from "@/hooks/useMarketData";
export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface ${className}`}>{children}</div>
  );
}
export function SectionLabel({ children }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{children}</p>;
}

export function TableSkeleton({ rows = 8 }) {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3">
          <div className="cp-shimmer size-6 shrink-0 rounded-full" />
          <div className="cp-shimmer h-3 w-32 rounded" />
          <div className="cp-shimmer ml-auto h-3 w-16 rounded" />
          <div className="cp-shimmer h-3 w-12 rounded" />
        </div>
      ))}
    </div>
  );
}
export function BlockSkeleton({ className = "h-40" }) {
  return <div className={`cp-shimmer rounded-lg ${className}`} aria-hidden="true" />;
}
export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div role="alert" className="px-4 py-8 text-center">
      <AlertTriangle className="mx-auto size-5 text-loss" aria-hidden="true" />
      <p className="mt-3 font-display text-xl font-semibold italic">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 font-mono text-xs text-surface transition-opacity hover:opacity-90">
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Retry request
        </button>
      ) : null}
    </div>
  );
}
export function EmptyState({ title, message, action }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-display text-xl font-semibold italic">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function errorMessage(error) {
  if (isRateLimited(error)) {
    return "Rate limited by CoinGecko — retrying in a few seconds.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "An unexpected error occurred while loading data.";
}
