export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:px-6">
        <p>CryptoPulse · a reading room for market data</p>
        <p>
          Prices from{" "}
          <a
            href="https://www.coingecko.com/en/api"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2 transition-colors hover:text-foreground">
            CoinGecko
          </a>{" "}
          · not financial advice
        </p>
      </div>
    </footer>
  );
}
