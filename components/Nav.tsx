"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS: { label: string; href: string }[] = [
  { label: "product", href: "/novafabric" },
  { label: "docs", href: "/docs" },
  { label: "demo", href: "/demo" },
  { label: "blog", href: "/blog" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  // On inner pages always use frosted glass — transparent only on home hero
  const isHome = pathname === "/";
  const frosted = scrolled || !isHome;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: frosted ? "1px solid var(--color-edge)" : "1px solid transparent",
        backgroundColor: frosted ? "var(--color-nav-bg)" : "transparent",
        backdropFilter: frosted ? "blur(12px) saturate(1.4)" : "none",
        WebkitBackdropFilter: frosted ? "blur(12px) saturate(1.4)" : "none",
        transition: "background-color 0.3s, border-color 0.3s",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-code), monospace",
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--color-ink)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          nova
          <span style={{ color: "var(--color-amber)" }}>fabric</span>
          <span style={{ color: "var(--color-amber)", opacity: 0.5 }}>.</span>
        </Link>

        <div
          style={{ display: "flex", alignItems: "center", gap: "28px" }}
          className="desktop-nav"
        >
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontFamily: "var(--font-code), monospace",
                  fontSize: "12px",
                  color: active ? "var(--color-ink)" : "var(--color-muted)",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: "4px",
                  letterSpacing: "0.04em",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "var(--color-ink)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "var(--color-muted)";
                }}
              >
                {l.label}
              </Link>
            );
          })}

          <ThemeToggle />

          <button
            onClick={() => window.dispatchEvent(new CustomEvent("nova:palette-open"))}
            style={{
              fontFamily: "var(--font-code), monospace",
              fontSize: "11px",
              color: "var(--color-muted)",
              backgroundColor: "transparent",
              border: "1px solid var(--color-edge-2)",
              padding: "4px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              letterSpacing: "0.04em",
              transition: "color 0.2s, border-color 0.2s",
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
            aria-label="Open command palette"
          >
            ⌘K
          </button>

          <a
            href="https://github.com/MSKazemi/novafabric"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-code), monospace",
              fontSize: "12px",
              color: "var(--color-canvas)",
              backgroundColor: "var(--color-amber)",
              padding: "6px 14px",
              borderRadius: "3px",
              textDecoration: "none",
              letterSpacing: "0.04em",
              fontWeight: 500,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-amber-2)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-amber)")
            }
          >
            github ↗
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--color-ink)",
            cursor: "pointer",
            padding: "4px",
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <div style={{ width: "20px", height: "2px", backgroundColor: "currentColor", marginBottom: "5px" }} />
          <div style={{ width: "20px", height: "2px", backgroundColor: "currentColor", marginBottom: "5px" }} />
          <div style={{ width: "12px", height: "2px", backgroundColor: "currentColor" }} />
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "var(--color-canvas)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "24px",
              background: "none",
              border: "none",
              color: "var(--color-muted)",
              cursor: "pointer",
              fontFamily: "var(--font-code), monospace",
              fontSize: "20px",
            }}
            aria-label="Close menu"
          >
            ×
          </button>

          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "var(--font-code), monospace",
                  fontSize: "20px",
                  color: active ? "var(--color-ink)" : "var(--color-muted)",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: "4px",
                  letterSpacing: "0.04em",
                }}
              >
                {l.label}
              </Link>
            );
          })}

          <a
            href="https://github.com/MSKazemi/novafabric"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: "var(--font-code), monospace",
              fontSize: "20px",
              color: "var(--color-amber)",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            github ↗
          </a>

          <ThemeToggle compact />
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
