import type { ResearchArea } from "../types";

export const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: "evidence-replay",
    title: "Evidence + replay layer",
    status: "experimental",
    description:
      "Local-first run capsules for capture, replay, diff, validation, and audit workflows. CLI capture, SDK decorator, API/MCP proxy, and OTel GenAI semconv all captured.",
    tags: ["capture", "replay", "diff", "audit"],
  },
  {
    id: "novaseal-trust",
    title: "NovaSeal trust layer",
    status: "experimental",
    description:
      "Tamper-evident DSSE/RFC 3161 sealing in local profile. Cryptographic SoD enforced. Enterprise HSM/X.509 PKI not claimed.",
    tags: ["signing", "DSSE", "RFC 3161"],
  },
  {
    id: "lineage",
    title: "Lineage and provenance",
    status: "experimental",
    description:
      "SQLite lineage is experimental (10M-edge KuzuDB benchmark done). KuzuDB backend is prototype. Lineage federation is experimental with legal review pending.",
    tags: ["lineage", "KuzuDB", "provenance"],
    secondaryStatus: "prototype",
  },
  {
    id: "server-dashboard",
    title: "Server + dashboard",
    status: "experimental",
    description:
      "Server mode (experimental) with OIDC/RBAC, a 13-tab dashboard, offline tokens and topology views. Production-scale operation is not claimed.",
    tags: ["server", "OIDC", "dashboard"],
  },
  {
    id: "capsule-kg",
    title: "Capsule knowledge graph",
    status: "experimental",
    description:
      "KuzuDB-backed KG for query, audit, and entity workflows. CLI and dashboard panels shipped v0.29–v0.31. Tier 2/3 features in progress.",
    tags: ["KG", "KuzuDB", "query"],
  },
  {
    id: "governance",
    title: "Governance + compliance exports",
    status: "experimental",
    description:
      "Risk classification, audit profiles (EU AI Act, NIST, GDPR, SOC2, NIS2), cost reporting, and evidence exports. Experimental workflows — not legal guarantees.",
    tags: ["governance", "EU AI Act", "GDPR"],
  },
];
