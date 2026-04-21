import { createContext, useContext, useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────
//  ThemeContext
//  - Reads system preference on first visit
//  - Persists user choice to localStorage
//  - Applies  data-theme="dark" | "light"  on <html>
//  - Exports useTheme() hook for any component
// ─────────────────────────────────────────────────────────────

const ThemeContext = createContext(null);

const STORAGE_KEY = "cc-theme";

function getInitialTheme() {
    // 1. Respect explicit user choice stored in localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;

    // 2. Fall back to OS/browser preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";

    return "light";
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => getInitialTheme());

    // Apply theme to <html> so CSS variables cascade to everything
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // Optional: keep in sync if user changes OS preference while tab is open
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            // Only update if user hasn't made an explicit choice yet
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? "dark" : "light");
            }
        };
        mq.addEventListener("change", handleChange);
        return () => mq.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = () =>
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Clean hook — throws if used outside provider
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
    return ctx;
}