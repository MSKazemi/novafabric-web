"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { INSTALL_COMMAND, REQUIRES_PYTHON, VERSION_TAG } from "@/lib/version";
import CopyButton from "@/components/CopyButton";

const HeroCanvas = dynamic(() => import("@/components/hero/HeroCanvas"), { ssr: false });

// Only mount the Three.js hero on larger, motion-friendly viewports. Phones and
// reduced-motion users keep the lightweight dot-grid/glow backdrop and never
// download the ~865 KB 3D bundle — big mobile perf / Core Web Vitals win.
function useHeavyHeroAllowed() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const okSize = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(okSize.matches && !reducedMotion.matches);
    update();
    okSize.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      okSize.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);
  return allowed;
}

export default function CinematicHero() {
  const heavyHeroAllowed = useHeavyHeroAllowed();

  // Intro reveal is CSS-driven (see .hero-reveal in globals.css) so the LCP
  // headline paints on the first frame instead of waiting for JS to hydrate.

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        paddingTop: "80px",
      }}
    >
      {/* Layer 0 — R3F particle canvas (desktop + motion-friendly only) */}
      {heavyHeroAllowed && <HeroCanvas />}

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "400px",
          background: "radial-gradient(ellipse, color-mix(in srgb, var(--color-accent) 9%, transparent) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Layer 1 — dot grid */}
      <div
        className="dot-grid"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          opacity: 0.4,
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      {/* Layer 2 — hero content */}
      <div
        className="page-max-w"
        style={{ position: "relative", zIndex: 10 }}
      >
        <div className="py-12 lg:py-14 relative z-10 flex flex-col lg:flex-row gap-16 items-center">
          {/* Left column — text */}
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <span
              className="font-code text-[11px] text-amber border border-amber/20 bg-amber-glow px-3 py-1 rounded inline-flex items-center gap-2 mb-6 hero-reveal hero-reveal-1"
            >
              ◆ novafabric {VERSION_TAG} · experimental
            </span>

            {/* Headline: plain words a developer would search for; the
                time-machine line stays as the sub-headline. */}
            <h1
              className="font-display text-5xl md:text-6xl text-ink leading-[1.02] mb-3 hero-rise"
            >
              Replay and audit <em>AI agent</em> runs.
            </h1>
            <p className="font-display italic text-2xl text-muted mb-5 hero-reveal hero-reveal-2">
              The time machine for AI systems.
            </p>

            {/* Body */}
            <p
              className="text-muted text-base max-w-md leading-relaxed mb-5 hero-reveal hero-reveal-3"
            >
              Replay and evidence infrastructure for AI agents. Capture executions as
              portable Run Capsules you own — then replay, compare, trace, and verify
              them. Self-hosted and local-first. <em>Evidence you can replay.</em>
            </p>

            {/* Install: the real commands from the README quickstart */}
            <div
              data-theme="dark"
              className="font-code text-[12.5px] leading-relaxed bg-surface border border-edge-2 rounded-lg px-4 py-3 mb-6 max-w-md hero-reveal hero-reveal-4"
            >
              <div className="flex items-center justify-between gap-3">
                <code>
                  <span className="text-amber">$ </span>
                  <span className="text-ink">{INSTALL_COMMAND}</span>
                </code>
                <CopyButton text={INSTALL_COMMAND} />
              </div>
              <div className="mt-2 text-muted">
                <div><span className="text-amber">$ </span>nova capture python my_agent.py</div>
                <div><span className="text-amber">$ </span>nova replay &lt;capsule&gt; --mode forensic</div>
                <div><span className="text-amber">$ </span>nova diff &lt;capsule-a&gt; &lt;capsule-b&gt;</div>
                <div><span className="text-amber">$ </span>nova verify &lt;capsule&gt;  <span className="text-faint"># once sealed</span></div>
              </div>
              <p className="mt-2 text-faint text-[11px]">Python {REQUIRES_PYTHON} · Apache-2.0</p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 hero-reveal hero-reveal-4">
              <Link
                href="/docs/getting-started/"
                className="font-code text-[13px] bg-amber text-canvas px-5 py-2.5 rounded hover:bg-amber-2 transition-colors"
              >
                get started →
              </Link>
              <Link
                href="/novafabric/"
                className="font-code text-[13px] border border-edge-2 text-muted px-5 py-2.5 rounded hover:text-ink hover:border-faint transition-colors"
              >
                explore novafabric
              </Link>
              <a
                href="https://github.com/MSKazemi/novafabric"
                target="_blank"
                rel="noopener noreferrer"
                className="font-code text-[13px] border border-edge-2 text-muted px-5 py-2.5 rounded hover:text-ink hover:border-faint transition-colors"
              >
                github ↗
              </a>
            </div>
          </div>

          {/* Right column — terminal demo */}
          <div className="hero-reveal hero-reveal-3 flex-1 min-w-0 flex justify-center lg:justify-end">
            <div
              data-theme="dark"
              className="font-code text-[13px] leading-relaxed bg-surface border border-edge-2 rounded-lg overflow-hidden w-full max-w-lg"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              {/* Traffic light bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-edge bg-surface-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-faint text-[11px]">nova — bash · illustrative, sealing configured</span>
              </div>
              {/* Terminal body */}
              <div className="p-5 space-y-1">
                <div>
                  <span className="text-amber">$ </span>
                  <span className="text-ink">nova capture python agent.py</span>
                </div>
                <div className="text-faint">‥</div>
                <div>
                  <span className="text-muted">  capsule   ─ </span>
                  <span className="text-amber">4f8a1c2e</span>
                </div>
                <div>
                  <span className="text-muted">  trace.jsonl        </span>
                  <span className="text-jade">✓</span>
                  <span className="text-muted">   1,203 spans</span>
                </div>
                <div>
                  <span className="text-muted">  model-calls.jsonl  </span>
                  <span className="text-jade">✓</span>
                  <span className="text-muted">   6 LLM calls</span>
                </div>
                <div>
                  <span className="text-muted">  seal (your key)    </span>
                  <span className="text-jade">✓</span>
                  <span className="text-muted">   ed25519</span>
                </div>
                <div className="pt-2 text-jade text-[12px]">capsule sealed ◆</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
