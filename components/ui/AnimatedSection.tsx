"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";
import React from "react";

gsap.registerPlugin(ScrollTrigger);

type Variant = "fadeUp" | "fadeIn" | "slideLeft";

const VARIANTS: Record<Variant, gsap.TweenVars> = {
  fadeUp:    { opacity: 0, y: 40 },
  fadeIn:    { opacity: 0 },
  slideLeft: { opacity: 0, x: -40 },
};

interface AnimatedSectionProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export default function AnimatedSection({
  children,
  variant = "fadeUp",
  delay = 0,
  className = "",
  as: Tag = "div",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    gsap.from(ref.current, {
      ...VARIANTS[variant],
      duration: 0.7,
      ease: "power2.out",
      delay,
      immediateRender: false,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 88%",
        toggleActions: "play none none none",
        once: true,
      },
    });
  }, { scope: ref });

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
