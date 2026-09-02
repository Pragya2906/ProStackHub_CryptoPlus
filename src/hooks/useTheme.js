import { useCallback, useEffect, useState } from "react";
import { createStore, useStore } from "@/utils/store";
/** `null` means "no saved preference" — the system setting wins in that case. */
const themeStore = createStore(null, "cryptopulse:theme");
export function useTheme() {
  const stored = useStore(themeStore);
  const [systemTheme, setSystemTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemTheme(media.matches ? "dark" : "light");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const theme = stored ?? systemTheme;
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  const toggle = useCallback(() => {
    themeStore.set(theme === "dark" ? "light" : "dark");
  }, [theme]);
  return { theme, toggle, mounted };
}
