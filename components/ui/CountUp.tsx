"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a numeric value up from 0 when it first scrolls into view. Preserves
 * any non-numeric prefix/suffix (e.g. "425K", "220+", "Apache-2.0" → static).
 * Respects prefers-reduced-motion (renders the final value immediately).
 */
export default function CountUp({
  value,
  duration = 1100,
}: {
  value: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  const target = match ? parseInt(match[2].replace(/,/g, ""), 10) : null;
  const prefix = match?.[1] ?? "";
  const suffix = match?.[3] ?? "";

  const [display, setDisplay] = useState<string>(
    target === null ? value : `${prefix}0${suffix}`
  );

  useEffect(() => {
    if (target === null) return;
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let start = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const step = (t: number) => {
          if (!start) start = t;
          const p = Math.min(1, (t - start) / duration);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - p, 3);
          const n = Math.round(eased * target);
          setDisplay(`${prefix}${n.toLocaleString()}${suffix}`);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, prefix, suffix, value, duration]);

  return <span ref={ref}>{display}</span>;
}
