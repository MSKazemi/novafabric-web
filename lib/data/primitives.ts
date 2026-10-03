import type { Primitive } from "../types";

export const PRIMITIVES: Primitive[] = [
  {
    id: "01",
    name: "Asset Registry",
    tagline: "Catalog. Version. Promote.",
    description:
      "Local SQLite registry for models, datasets, and agents. Eval-gated promotion workflow ensures only validated assets reach production. Track lineage from training run to deployment.",
    command: "nova register ./model.pkl --name gpt-finetune-v3",
    icon: "▦",
    shipped: true,
    relatedPrimitives: [],
  },
  {
    id: "02",
    name: "Run Capsule",
    tagline: "Capture every execution.",
    description:
      "Wrap any command or SDK call into a portable, validated evidence bundle. Captures environment, OTel spans, model calls, tool exchanges — without modifying your code.",
    command: "nova capture python train.py",
    icon: "◎",
    shipped: true,
    relatedPrimitives: ["03", "05"],
  },
  {
    id: "03",
    name: "Replay Engine",
    tagline: "Forensic. Mocked. Dry-run.",
    description:
      "Re-execute any capsule with full fidelity. Forensic mode is read-only. Mocked mode intercepts LLM calls with recorded responses. Dry-run validates without side effects.",
    command: "nova replay runs/9cf2a31b --mode forensic",
    icon: "↺",
    shipped: true,
    relatedPrimitives: ["02", "05"],
  },
  {
    id: "04",
    name: "Lineage Graph",
    tagline: "Provenance at scale.",
    description:
      "Build and query provenance across runs — provenance, blast-radius, and replay-chain queries, emitting OpenLineage + W3C PROV. SQLite by default; a KuzuDB backend is benchmarked to 10M edges for cluster-scale analysis.",
    command: "nova lineage blast-radius --from dataset-v2 --depth 4",
    icon: "⟶",
    shipped: true,
    relatedPrimitives: ["02"],
  },
  {
    id: "05",
    name: "Evidence Bundle",
    tagline: "Export. Sign. Verify offline.",
    description:
      "A signed, self-contained export of a run's evidence — in-toto DSSE attestations, RFC 3161 timestamps, and a redaction proof. Sealing (NovaSeal) is part of the bundle, not a separate primitive. Designed to support SEC 17a-4, MiFID II, and CFTC 1.31 evidence workflows; verifiable with only sha256sum and an ed25519 verifier — no runtime required.",
    command: "nova export-evidence runs/9cf2a31b",
    icon: "⊚",
    shipped: true,
    relatedPrimitives: ["02", "03"],
  },
];
