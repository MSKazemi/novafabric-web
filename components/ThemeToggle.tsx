"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Light-first theme toggle. The initial `data-theme` is set before paint by the
 * inline script in app/layout.tsx (no FOUC); this component only reads/writes it
 * after mount. Choice persists in localStorage under `nova-theme`.
 */
export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Resolve the authoritative theme on mount. The pre-paint script in
    // layout.tsx normally sets data-theme before this runs; but if it didn't
    // (dev hydration edge cases, stripped inline script), fall back to the
    // stored preference and re-apply it so the attribute and UI stay in sync.
    let stored: Theme | null = null;
    try {
      const s = localStorage.getItem("nova-theme");
      if (s === "dark" || s === "light") stored = s;
    } catch {
      /* ignore */
    }
    const attr = document.documentElement.getAttribute("data-theme");
    const resolved: Theme =
      stored ?? (attr === "dark" || attr === "light" ? attr : "light");
    if (attr !== resolved) {
      document.documentElement.setAttribute("data-theme", resolved);
    }
    setTheme(resolved);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("nova-theme", next);
    } catch {
      /* ignore */
    }
    setTheme(next);
    window.dispatchEvent(new CustomEvent("nova:theme-change", { detail: next }));
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: compact ? "40px" : "30px",
        height: compact ? "40px" : "30px",
        backgroundColor: "transparent",
        border: "1px solid var(--color-edge-2)",
        borderRadius: "6px",
        cursor: "pointer",
        color: "var(--color-muted)",
        transition: "color 0.2s, border-color 0.2s, background-color 0.2s",
        // avoid a mismatched icon flash before we know the real theme
        opacity: mounted ? 1 : 0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.color = "var(--color-ink)";
        el.style.borderColor = "var(--color-faint)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.color = "var(--color-muted)";
        el.style.borderColor = "var(--color-edge-2)";
      }}
    >
      {isDark ? (
        // sun — click to go light
        <svg width={compact ? 18 : 15} height={compact ? 18 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // moon — click to go dark
        <svg width={compact ? 18 : 15} height={compact ? 18 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
