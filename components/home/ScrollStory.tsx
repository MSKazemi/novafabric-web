"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  {
    number: "01",
    headline: "Your agent ran for 3 hours.",
    subtext: "It failed at step 47. You have no idea why.",
    accent: "var(--color-muted)",
  },
  {
    number: "02",
    headline: "nova capture wraps any command.",
    subtext:
      "Every tool call, model interaction, and environment state — recorded.",
    code: "$ nova capture python agent.py",
    accent: "var(--color-amber)",
  },
  {
    number: "03",
    headline: "The capsule holds everything.",
    subtext: "Portable. Replayable. Sealable with your own key.",
    items: [
      "trace.jsonl  ✓  1,203 spans",
      "model-calls.jsonl  ✓  6 LLM calls",
      "dsse seal  ✓  (sealing on)",
    ],
    accent: "var(--color-jade)",
  },
  {
    number: "04",
    headline: "Replay. Validate. Audit.",
    subtext: "Reopen a past run. Verify the sealed record. Evidence, not trust.",
    code: "$ nova replay 4f8a1c2e --mode forensic",
    accent: "var(--color-amber)",
  },
] as const;

export default function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      tl.fromTo(
        ".chapter-0",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.2 }
      )
        .to(".chapter-0", { opacity: 1, duration: 0.3 })
        .to(".chapter-0", { opacity: 0, y: -30, duration: 0.2 })
        .fromTo(
          ".chapter-1",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.2 },
          "-=0.1"
        )
        .to(".chapter-1", { opacity: 1, duration: 0.3 })
        .to(".chapter-1", { opacity: 0, y: -30, duration: 0.2 })
        .fromTo(
          ".chapter-2",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.2 },
          "-=0.1"
        )
        .to(".chapter-2", { opacity: 1, duration: 0.3 })
        .to(".chapter-2", { opacity: 0, y: -30, duration: 0.2 })
        .fromTo(
          ".chapter-3",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.2 },
          "-=0.1"
        )
        .to(".chapter-3", { opacity: 1, duration: 0.3 });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} style={{ position: "relative", height: "300vh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {CHAPTERS.map((chapter, i) => (
            <div
              key={chapter.number}
              className={`chapter-${i}`}
              style={{
                position: "absolute",
                opacity: 0,
                textAlign: "center",
                maxWidth: "42rem",
                padding: "0 1.5rem",
              }}
            >
              {/* Chapter number */}
              <p
                className="font-code text-[11px] tracking-[0.2em] uppercase mb-4"
                style={{ color: chapter.accent }}
              >
                {chapter.number}
              </p>

              {/* Headline */}
              <h2 className="font-display text-4xl md:text-6xl text-ink mb-4">
                {chapter.headline}
              </h2>

              {/* Subtext */}
              <p className="text-muted text-lg mb-6">{chapter.subtext}</p>

              {/* Code pill */}
              {"code" in chapter && chapter.code && (
                <span className="inline-block font-code text-sm bg-surface border border-edge-2 rounded px-4 py-2 text-amber">
                  {chapter.code}
                </span>
              )}

              {/* Items list */}
              {"items" in chapter && chapter.items && (
                <ul className="font-code text-[13px] space-y-1 text-left inline-block">
                  {chapter.items.map((item) => {
                    const hasCheck = item.includes("✓");
                    return (
                      <li
                        key={item}
                        style={{
                          color: hasCheck
                            ? "var(--color-amber)"
                            : "var(--color-muted)",
                        }}
                      >
                        {item}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
