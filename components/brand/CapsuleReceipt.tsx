/**
 * Run Capsule evidence card — the NovaFabric "execution receipt" motif.
 * Brand source: novafabric-private strategy/brand/visual-identity.md (Signature devices).
 *
 * Rules the brand sets for this card:
 *  - JetBrains Mono (the "evidence/data" type role), one field per line.
 *  - `status` shows VERIFIED only for an example that was really sealed and
 *    verified. The default is an honest, illustrative "UNSEALED · SEALABLE".
 *  - Colour comes only from the site's tokens, so the card follows whichever
 *    palette the site settles on. State is never carried by colour alone: the
 *    status word is always printed.
 */
export type CapsuleReceiptProps = {
  run?: string;
  time?: string;
  model?: string;
  tools?: string;
  hash?: string;
  status?: "UNSEALED · SEALABLE" | "SEALED" | "VERIFIED";
  illustrative?: boolean;
};

const ROWS = ["RUN", "TIME", "MODEL", "TOOLS", "HASH"] as const;

export default function CapsuleReceipt({
  run = "01HXAY7M5JZ8R7K4P9DPBYK2WX",
  time = "2026-10-08T09:14:02Z",
  model = "gpt-4o-mini · 6 calls captured",
  tools = "3 tool calls captured",
  hash = "sha256:4f8a1c2e…9b07",
  status = "UNSEALED · SEALABLE",
  illustrative = true,
}: CapsuleReceiptProps) {
  const values: Record<(typeof ROWS)[number], string> = { RUN: run, TIME: time, MODEL: model, TOOLS: tools, HASH: hash };
  const statusColour =
    status === "VERIFIED" ? "var(--color-jade)" : status === "SEALED" ? "var(--color-accent)" : "var(--color-muted)";

  return (
    <figure
      className="font-code"
      style={{
        margin: 0,
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-edge-2)",
        borderLeft: "3px solid var(--color-accent)",
        borderRadius: "6px",
        padding: "20px 22px",
        fontSize: "12.5px",
        lineHeight: 1.9,
        maxWidth: "460px",
        width: "100%",
      }}
    >
      <figcaption
        style={{ color: "var(--color-faint)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}
      >
        NovaFabric Run Capsule{illustrative ? " · illustrative" : ""}
      </figcaption>
      <dl style={{ margin: 0 }}>
        {ROWS.map((k) => (
          <div key={k} style={{ display: "flex", gap: "18px", alignItems: "baseline" }}>
            <dt style={{ color: "var(--color-faint)", width: "52px", flexShrink: 0 }}>{k}</dt>
            <dd style={{ margin: 0, color: "var(--color-ink)", overflowWrap: "anywhere" }}>{values[k]}</dd>
          </div>
        ))}
        <div style={{ display: "flex", gap: "18px", alignItems: "baseline" }}>
          <dt style={{ color: "var(--color-faint)", width: "52px", flexShrink: 0 }}>STATUS</dt>
          <dd style={{ margin: 0, color: statusColour, fontWeight: 600 }}>{status}</dd>
        </div>
      </dl>
      <div
        style={{
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px dashed var(--color-edge-2)",
          color: "var(--color-muted)",
          letterSpacing: "0.12em",
          fontSize: "11px",
        }}
      >
        REPLAY · DIFF · VERIFY
      </div>
    </figure>
  );
}
