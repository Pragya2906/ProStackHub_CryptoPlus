import { useState } from "react";
import "./App.css";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

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
        {currentPage === "markets" && <p>Markets page goes here</p>}
        {currentPage === "watchlist" && <p>Watchlist page goes here</p>}
        {currentPage === "compare" && <p>Compare page goes here</p>}
        {currentPage === "detail" && <p>Detail page for {selectedCoinId}</p>}
      </main>
      <AppFooter />
    </div>
  );
}

export default App;