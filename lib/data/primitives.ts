import type { Primitive } from "../types";

export const PRIMITIVES: Primitive[] = [
  {
    id: "01",
    name: "Asset Registry",
    tagline: "Catalog. Version. Promote.",
    description:
      "Local SQLite registry for models, datasets, and agents. Eval-gated promotion workflow ensures only validated assets reach production. Track lineage from training run to deployment.",
    command: "nova register assets/my-agent.yaml",
    icon: "▦",
    shipped: true,
    relatedPrimitives: [],
  },
  {
    id: "02",
    name: "Run Capsule",
    tagline: "Capture the run. Keep the artifact.",
    description:
      "Wrap any command into a portable, schema-valid Run Capsule you own: the environment, OTel spans, and the model calls and tool exchanges capture can see. Wrapping needs no code changes; model calls are captured automatically for Python workloads, with nova api-proxy for other clients.",
    command: "nova capture python train.py",
    icon: "◎",
    shipped: true,
    relatedPrimitives: ["03", "05"],
  },
  {
    id: "03",
    name: "Replay Engine",
    tagline: "Five modes, each with a stated guarantee.",
    description:
      "Forensic mode is read-only inspection. Mocked mode re-runs the command and serves the recorded model replies from the capsule; tool calls run live. Semantic and exact do not re-run: they score the recorded responses and report whether a byte-exact re-run is possible. Intervention is experimental. --dry-run reports what would execute without running it.",
    command: "nova replay <run-id> --mode forensic",
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
    command: "nova lineage blast-radius my-dataset@v2 --depth 4",
    icon: "⟶",
    shipped: true,
    relatedPrimitives: ["02"],
  },
  {
    id: "05",
    name: "Evidence Bundle",
    tagline: "Export. Sign. Verify offline.",
    description:
      "A signed, self-contained export of a run's evidence — in-toto DSSE attestations signed with your local Ed25519 key, an opt-in RFC 3161 timestamp, and the secret-scan record. Opt-in capsule sealing (NovaSeal) belongs to this primitive rather than being a sixth one. Designed to support SEC 17a-4, MiFID II, and CFTC 1.31 evidence workflows; verifiable with only sha256sum and an ed25519 verifier — no runtime required.",
    command: "nova export-evidence ~/.novafabric/capsules/<run-id>/ -o evidence.zip",
    icon: "⊚",
    shipped: true,
    relatedPrimitives: ["02", "03"],
  },
];
