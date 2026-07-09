import { createContext, useContext, useEffect, useState } from "react";









const ThemeContext = createContext(null);

const STORAGE_KEY = "cc-theme";

function getInitialTheme() {
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;

    
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";

    return "light";
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => getInitialTheme());

    
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            
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