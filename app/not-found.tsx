import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — novafabric",
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-canvas)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dot grid */}
      <div
        className="dot-grid"
        style={{
          position: "absolute",
          inset: 0,
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      <div style={{ position: "relative", textAlign: "center", maxWidth: "480px" }}>
        {/* 404 code */}
        <div
          className="font-code"
          style={{
            fontSize: "clamp(80px, 15vw, 140px)",
            color: "var(--color-edge-2)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginBottom: "8px",
            userSelect: "none",
          }}
        >
          404
        </div>

        {/* Amber accent line */}
        <div
          style={{
            width: "48px",
            height: "2px",
            backgroundColor: "var(--color-amber)",
            margin: "0 auto 32px",
            opacity: 0.7,
          }}
        />

        <p
          className="font-code"
          style={{
            fontSize: "13px",
            color: "var(--color-muted)",
            lineHeight: "1.8",
            marginBottom: "8px",
            letterSpacing: "0.01em",
          }}
        >
          This capsule doesn&apos;t exist.
        </p>
        <p
          className="font-code"
          style={{
            fontSize: "13px",
            color: "var(--color-faint)",
            lineHeight: "1.8",
            marginBottom: "40px",
            letterSpacing: "0.01em",
          }}
        >
          The page was moved, deleted, or never captured.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-code), monospace",
              fontSize: "13px",
              color: "var(--color-canvas)",
              backgroundColor: "var(--color-amber)",
              padding: "10px 20px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            ← back to home
          </Link>
          <a
            href="https://github.com/MSKazemi/novafabric"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-code), monospace",
              fontSize: "13px",
              color: "var(--color-muted)",
              border: "1px solid var(--color-edge-2)",
              padding: "10px 20px",
              borderRadius: "4px",
              textDecoration: "none",
            }}
          >
            github ↗
          </a>
        </div>
      </div>
    </div>
  );
}
