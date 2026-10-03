"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  degraded?: boolean;
}

// Particles read as a faint amber constellation. On a light canvas they need a
// deeper hue + higher opacity to stay visible; dark keeps the original glow.
function useParticleTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const read = () =>
      setDark(document.documentElement.getAttribute("data-theme") !== "light");
    read();
    window.addEventListener("nova:theme-change", read as EventListener);
    return () => window.removeEventListener("nova:theme-change", read as EventListener);
  }, []);
  return dark
    ? { point: "#818cf8", pointOpacity: 0.75, line: "#818cf8", lineOpacity: 0.16 }
    : { point: "#4f46e5", pointOpacity: 0.5, line: "#4f46e5", lineOpacity: 0.1 };
}

export default function ParticleField({ degraded = false }: ParticleFieldProps) {
  const count = degraded ? 200 : 800;
  const theme = useParticleTheme();

  const pointsBufferRef = useRef<THREE.BufferAttribute>(null);
  const linesBufferRef = useRef<THREE.BufferAttribute>(null);
  const elapsedRef = useRef(0);

  // Generate initial particle positions
  const { positions, linePositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 6; // x in [-3, 3]
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6; // y in [-3, 3]
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2; // z in [-1, 1]
    }

    // Compute edge line segments from first 200 points (performance budget)
    const lineCount = Math.min(count, 200);
    const lineVerts: number[] = [];
    for (let a = 0; a < lineCount; a++) {
      const ax = positions[a * 3 + 0];
      const ay = positions[a * 3 + 1];
      const az = positions[a * 3 + 2];
      for (let b = a + 1; b < lineCount; b++) {
        const bx = positions[b * 3 + 0];
        const by = positions[b * 3 + 1];
        const bz = positions[b * 3 + 2];
        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 0.8) {
          lineVerts.push(ax, ay, az, bx, by, bz);
        }
      }
    }
    const linePositions = new Float32Array(lineVerts);

    return { positions, linePositions };
  }, [count]);

  useFrame((_, delta) => {
    const buf = pointsBufferRef.current;
    if (!buf) return;

    elapsedRef.current += delta;
    const arr = buf.array as Float32Array;
    const t = elapsedRef.current;

    for (let i = 0; i < count; i++) {
      const xi = i * 3 + 0;
      const yi = i * 3 + 1;

      // Gentle sine-wave drift
      arr[xi] += Math.sin(t * 0.3 + i * 0.1) * delta * 0.05;
      arr[yi] += Math.sin(t * 0.3 + i * 0.1 + 1.57) * delta * 0.05;

      // Boundary repel at ±3 on x/y
      const x = arr[xi];
      const y = arr[yi];
      if (Math.abs(x) > 2.8) {
        arr[xi] -= Math.sign(x) * (Math.abs(x) - 2.8) * delta * 0.5;
      }
      if (Math.abs(y) > 2.8) {
        arr[yi] -= Math.sign(y) * (Math.abs(y) - 2.8) * delta * 0.5;
      }
    }

    buf.needsUpdate = true;
  });

  return (
    <>
      {/* Particle dots */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            ref={pointsBufferRef}
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={theme.point}
          size={0.012}
          sizeAttenuation={true}
          transparent={true}
          opacity={theme.pointOpacity}
        />
      </points>

      {/* Edge lines (only rendered when not degraded and we have edges) */}
      {!degraded && linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              ref={linesBufferRef}
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={theme.line}
            transparent={true}
            opacity={theme.lineOpacity}
          />
        </lineSegments>
      )}
    </>
  );
}
