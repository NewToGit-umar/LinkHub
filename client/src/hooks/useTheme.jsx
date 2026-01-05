import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const ACCENT_DEFAULT = "emerald";
const ACCENTS = [
  { id: "emerald", label: "Emerald", from: "#0f172a", to: "#10b981" },
  { id: "ocean", label: "Ocean", from: "#0b1a2a", to: "#38bdf8" },
  { id: "sunset", label: "Sunset", from: "#1f0a2a", to: "#f97316" },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("linkhub_theme");
    return saved || "dark";
  });

  const [accent, setAccent] = useState(() => {
    const saved = localStorage.getItem("linkhub_accent");
    return saved || ACCENT_DEFAULT;
  });

  useEffect(() => {
    localStorage.setItem("linkhub_theme", theme);
    localStorage.setItem("linkhub_accent", accent);

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.accent = accent;
    root.classList.toggle("dark", theme === "dark");
  }, [theme, accent]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const value = {
    theme,
    accent,
    setTheme,
    setAccent,
    toggleTheme,
    isDark: theme === "dark",
    accents: ACCENTS,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
