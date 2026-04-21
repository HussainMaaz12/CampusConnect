import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

// ─────────────────────────────────────────────────────────────
//  ThemeToggle
//
//  Props:
//    size     "sm" | "md" (default "md")
//    showLabel  boolean (default true)
//
//  Usage:
//    <ThemeToggle />
//    <ThemeToggle size="sm" showLabel={false} />
// ─────────────────────────────────────────────────────────────

export default function ThemeToggle({ size = "md", showLabel = true }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className={`theme-toggle-wrap theme-toggle-wrap--${size}`}>
            {showLabel && (
                <span className="theme-toggle-label">
                    {isDark ? "Dark" : "Light"}
                </span>
            )}

            <button
                className={`theme-toggle ${isDark ? "theme-toggle--dark" : ""}`}
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={isDark}
                type="button"
            >
                {/* Track */}
                <span className="theme-toggle__track" />

                {/* Icons inside track */}
                <span className="theme-toggle__icons" aria-hidden="true">
                    <SunIcon />
                    <MoonIcon />
                </span>

                {/* Sliding thumb */}
                <span className="theme-toggle__thumb" aria-hidden="true">
                    <span className="theme-toggle__thumb-icon">
                        {isDark ? <MoonIcon /> : <SunIcon />}
                    </span>
                </span>
            </button>
        </div>
    );
}

// ── Inline SVG icons (no external dep needed) ────────────────
function SunIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
        >
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
    );
}