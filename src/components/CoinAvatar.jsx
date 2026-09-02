const SIZES = {
  sm: "size-6 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
};

export function CoinAvatar({ src, name, size = "sm" }) {
  return (
    <span
      className={`grid ${SIZES[size]} shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 font-mono uppercase text-primary`}
      aria-hidden="true">
      {src ? (
        <img src={src} alt="" loading="lazy" className="size-full object-contain" />
      ) : (
        name.slice(0, 2)
      )}
    </span>
  );
}
