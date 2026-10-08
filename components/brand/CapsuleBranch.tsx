/**
 * Canonical NovaFabric branch diagram: one execution becomes one Run Capsule,
 * and two journeys branch from it.
 *   developer: Capture -> Replay -> Diff -> Debug   (what happened, what changed?)
 *   trust:     Seal -> Verify -> Audit              (can I preserve and verify it later?)
 * Brand source: novafabric-private strategy/brand/brand-core.md ("Core verb chains").
 *
 * Legible in grayscale and print: the two journeys differ by line style
 * (solid vs dashed) and by label, not by colour alone.
 */
const FONT = "var(--font-code), monospace";

function Node({ x, y, w = 92, label, strong = false }: { x: number; y: number; w?: number; label: string; strong?: boolean }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={34}
        rx={5}
        style={{
          fill: strong ? "var(--color-accent)" : "var(--color-surface)",
          stroke: strong ? "var(--color-accent)" : "var(--color-edge-2)",
          strokeWidth: 1.2,
        }}
      />
      <text
        x={x + w / 2}
        y={y + 21}
        textAnchor="middle"
        style={{ fontFamily: FONT, fontSize: 12.5, fill: strong ? "var(--color-on-accent)" : "var(--color-ink)" }}
      >
        {label}
      </text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, dashed = false }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      markerEnd="url(#nf-arrow)"
      style={{ stroke: "var(--color-muted)", strokeWidth: 1.4, strokeDasharray: dashed ? "5 4" : undefined }}
    />
  );
}

export default function CapsuleBranch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 780 300"
      role="img"
      aria-labelledby="nf-branch-title nf-branch-desc"
      style={{ width: "100%", height: "auto", maxWidth: "780px" }}
    >
      <title id="nf-branch-title">Execution to Run Capsule, then two journeys</title>
      <desc id="nf-branch-desc">
        An execution becomes a Run Capsule. From the capsule, the developer journey runs Replay, Diff, Debug; the trust
        journey runs Seal, Verify, Audit.
      </desc>
      <defs>
        <marker id="nf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" style={{ fill: "var(--color-muted)" }} />
        </marker>
      </defs>

      {/* execution -> capsule */}
      <Node x={8} y={133} w={98} label="Execution" />
      <Arrow x1={108} y1={150} x2={150} y2={150} />
      <Node x={152} y={125} w={132} label="Run Capsule" strong />
      <text x={218} y={176} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fill: "var(--color-faint)" }}>
        the artifact you keep
      </text>

      {/* branches */}
      <path d="M286 142 C 322 142, 322 70, 356 70" fill="none" markerEnd="url(#nf-arrow)" style={{ stroke: "var(--color-muted)", strokeWidth: 1.4 }} />
      <path d="M286 158 C 322 158, 322 230, 356 230" fill="none" markerEnd="url(#nf-arrow)" style={{ stroke: "var(--color-muted)", strokeWidth: 1.4, strokeDasharray: "5 4" }} />

      {/* developer journey */}
      <Node x={358} y={53} label="Replay" />
      <Arrow x1={452} y1={70} x2={486} y2={70} />
      <Node x={488} y={53} label="Diff" />
      <Arrow x1={582} y1={70} x2={616} y2={70} />
      <Node x={618} y={53} label="Debug" />
      <text x={358} y={30} style={{ fontFamily: FONT, fontSize: 10.5, letterSpacing: 1.2, fill: "var(--color-muted)" }}>
        DEVELOPER · what happened, what changed?
      </text>

      {/* trust journey */}
      <Node x={358} y={213} label="Seal" />
      <Arrow x1={452} y1={230} x2={486} y2={230} dashed />
      <Node x={488} y={213} label="Verify" />
      <Arrow x1={582} y1={230} x2={616} y2={230} dashed />
      <Node x={618} y={213} label="Audit" />
      <text x={358} y={274} style={{ fontFamily: FONT, fontSize: 10.5, letterSpacing: 1.2, fill: "var(--color-muted)" }}>
        TRUST · can I preserve and verify it later?
      </text>
    </svg>
  );
}
