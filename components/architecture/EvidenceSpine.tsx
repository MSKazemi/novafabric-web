// The real whole-system model (the NovaFabric architecture overview): NovaFabric's
// strategic core is one verb chain — Capture → Seal → Replay → Diff → Audit —
// that works self-contained on a single machine and scales out unchanged.
const STAGES: { verb: string; icon: string; line: string }[] = [
  { verb: "Capture", icon: "⚡", line: "Wrap any command. Record every model & tool call." },
  { verb: "Seal", icon: "🔐", line: "DSSE signature + RFC 3161 timestamp + Merkle proof." },
  { verb: "Replay", icon: "↺", line: "Re-run forensic, mocked, semantic, or exact." },
  { verb: "Diff", icon: "≃", line: "Compare runs; gate regressions in CI." },
  { verb: "Audit", icon: "⚖️", line: "Trace lineage, export sealed evidence bundles." },
];

export default function EvidenceSpine() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {STAGES.map((s, i) => (
          <div key={s.verb} className="relative">
            <div className="bg-surface border border-edge-2 rounded-lg p-5 h-full shadow-card transition-all duration-200 hover:shadow-card-md hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden>{s.icon}</span>
                <span
                  className="font-code text-[13px] font-semibold"
                  style={{ color: "var(--color-accent)" }}
                >
                  {s.verb}
                </span>
                <span className="ml-auto font-code text-[10px] text-faint">
                  0{i + 1}
                </span>
              </div>
              <p className="text-muted text-[13.5px] md:text-[12.5px] leading-relaxed">{s.line}</p>
            </div>
            {/* connector arrow (desktop) */}
            {i < STAGES.length - 1 && (
              <span
                className="hidden lg:block absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 font-code text-sm"
                style={{ color: "var(--color-accent)" }}
                aria-hidden
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Two tiers note */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-surface-2 border border-edge rounded-lg px-5 py-4">
          <p className="font-code text-[11px] tracking-widest uppercase mb-1" style={{ color: "var(--color-jade)" }}>
            Self-contained · works today
          </p>
          <p className="text-muted text-[15px] md:text-sm leading-relaxed">
            Every core capability runs on a single machine — no server, no
            network — storing everything on the local filesystem.
          </p>
        </div>
        <div className="flex-1 bg-surface-2 border border-edge rounded-lg px-5 py-4">
          <p className="font-code text-[11px] tracking-widest uppercase mb-1" style={{ color: "var(--hue-violet)" }}>
            Distributed-ready · experimental
          </p>
          <p className="text-muted text-[15px] md:text-sm leading-relaxed">
            The same capsule format scales out to clusters of thousands of nodes.
            A one-node run is simply the smallest case of a distributed run.
          </p>
        </div>
      </div>
    </div>
  );
}
