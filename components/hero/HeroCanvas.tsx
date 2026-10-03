"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import ParticleField from "./ParticleField";

interface HeroCanvasProps {
  className?: string;
}

export default function HeroCanvas({ className }: HeroCanvasProps) {
  const [degraded, setDegraded] = useState(false);

  // Server-side or environments without WebGL: render nothing
  if (typeof window === "undefined" || !window.WebGLRenderingContext) {
    return null;
  }

  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        dpr={[1, 2]}
      >
        <AdaptiveDpr pixelated />
        <PerformanceMonitor onDecline={() => setDegraded(true)}>
          <ParticleField degraded={degraded} />
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
