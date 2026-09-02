import { Star } from "lucide-react";
/** Accessible watchlist toggle used in tables and on the detail page. */
export function StarButton({ active, label, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from watchlist` : `Add ${label} to watchlist`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      className={`grid size-8 place-items-center rounded-md border transition-colors ${active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-transparent text-muted hover:border-border hover:text-primary"
        }`}>
      <Star className="size-4" fill={active ? "currentColor" : "none"} strokeWidth={1.75} />
    </button>
  );
}
