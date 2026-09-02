import { useState } from "react";
import "./App.css";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Markets } from "@/pages/Markets";
import { CoinDetail } from "@/pages/CoinDetail";
import { Compare } from "@/pages/Compare";
import { Watchlist } from "@/pages/Watchlist";

function App() {
  const [currentPage, setCurrentPage] = useState("markets");
  const [selectedCoinId, setSelectedCoinId] = useState(null);

  function goToDetail(coinId) {
    setSelectedCoinId(coinId);
    setCurrentPage("detail");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {currentPage === "markets" && (
          <Markets onSelectCoin={goToDetail} onNavigate={setCurrentPage} />
        )}
        {currentPage === "watchlist" && (
          <Watchlist onSelectCoin={goToDetail} onNavigate={setCurrentPage} />
        )}
        {currentPage === "compare" && <Compare onSelectCoin={goToDetail} />}
        {currentPage === "detail" && (
          <CoinDetail coinId={selectedCoinId} onBack={() => setCurrentPage("markets")} />
        )}
      </main>
      <AppFooter />
    </div>
  );
}

export default App;