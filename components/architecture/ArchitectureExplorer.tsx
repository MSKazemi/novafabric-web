"use client";

/**
 * ArchitectureExplorer — interactive, multi-level map of every NovaFabric subsystem.
 *
 * Three levels of progressive disclosure:
 *   1. Overview     — Capabilities (pillars) or Layers view. Wires hidden by default.
 *   2. Detail panel — click a node → slide-in drawer with summary, sub-components, CLI, links.
 *   3. Deep dive    — "Open full view" → modal with responsibilities, internal flow, source files.
 *
 * Hover/select a node to light up ONLY its connections (SVG curves). Themed to the site palette.
 */

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ───────────────────────── Domain palette (on #07070a canvas) ───────────────────────── */
type DomainKey =
  | "capture" | "data" | "analyze" | "trust"
  | "govern" | "storage" | "serve" | "runtime";

const DOMAINS: Record<DomainKey, { label: string; color: string }> = {
  capture: { label: "Capture", color: "#e8960c" },
  data:    { label: "Core Data", color: "#3fc86e" },
  analyze: { label: "Analyze", color: "#a87fff" },
  trust:   { label: "Trust", color: "#ff8c42" },
  govern:  { label: "Govern", color: "#e0b341" },
  storage: { label: "Storage", color: "#4a9eff" },
  serve:   { label: "Serve", color: "#d2a8ff" },
  runtime: { label: "Runtime", color: "#ff6b6b" },
};

/* ───────────────────────── Component model ───────────────────────── */
interface Comp {
  icon: string;
  domain: DomainKey;
  title: string;
  sub: string;
  ver: string;
  tag: string;
  connects: string[];
  summary: string;
  subs: [string, string][];
  cli: string[];
  io: { in: string; out: string };
  resp: string[];
  files: [string, string][];
}

const C: Record<string, Comp> = {
  /* ── Runtime / entry ── */
  adapters: {
    icon: "🧩", domain: "runtime", title: "Framework Adapters", sub: "8 drop-in wrappers", ver: "v0.16",
    tag: "One function call enables capture for any major AI framework. Fail-open — capture errors never reach user code.",
    connects: ["capture"],
    summary: "Drop-in wrappers for LangGraph, AutoGen, CrewAI, DSPy, OpenAI Agents SDK, Google ADK, AWS Bedrock AgentCore, and A2A. Each patches the framework's execution entry point so model and tool calls flow into capture with zero changes to user logic.",
    subs: [["LangGraph", "wrap(graph) — patches invoke/run"], ["AutoGen", "wrap_agent() — patches initiate_chat"], ["CrewAI", "wrap_crew() — patches kickoff"], ["DSPy", "wrap_program() — patches forward"], ["OpenAI Agents", "register() tracing processor"], ["Google ADK", "make_plugin() lifecycle hook"], ["Bedrock AgentCore", "wrap_client() agentic invoke"], ["A2A SDK", "make_interceptor() agent-to-agent"]],
    cli: ["from novafabric.adapters import langgraph", "graph = langgraph.wrap(graph)"],
    io: { in: "Native framework objects", out: "Events → CapsuleWriter" },
    resp: ["Patch the framework's execution entry point at runtime", "Translate framework-native calls into model-call / tool-call events", "Stay fail-open: log capture errors, never propagate to user code"],
    files: [["adapters/langgraph.py", "wrap()"], ["adapters/autogen.py", "wrap_agent()"], ["adapters/crewai.py", "wrap_crew()"], ["adapters/openai_agents.py", "register()"]],
  },
  runners: {
    icon: "🚀", domain: "runtime", title: "Multi-Target Runners", sub: "Local · Docker · K8s · HPC", ver: "v0.6",
    tag: "Decides where the captured subprocess executes. Same capture everywhere via a universal sitecustomize.py injection.",
    connects: ["capture"],
    summary: "Six execution backends behind one interface. The runner spawns the subprocess; a sitecustomize.py prepended to PYTHONPATH installs the wire hooks before user code runs, so capture is identical regardless of target.",
    subs: [["LocalRunner", "subprocess.Popen, kills process group on timeout"], ["DockerRunner", "docker run --rm, capsule dir mounted"], ["KubernetesRunner", "kubectl create job, ConfigMap + PVC"], ["SlurmRunner", "sbatch wrapper, #SBATCH headers, Prolog/Epilog"], ["PBSRunner", "qsub wrapper — OpenPBS / Torque"], ["LSFRunner", "bsub wrapper — IBM Platform LSF"]],
    cli: ["nova capture --runner docker python agent.py", "nova capture --runner slurm python train.py"],
    io: { in: "RunnerSpec (type, config, job)", out: "CaptureResult" },
    resp: ["Spawn the subprocess on the chosen target", "Inject sitecustomize.py for universal hook install", "Pass capsule dir + span id into the subprocess env"],
    files: [["runners/_registry.py", "runner lookup"], ["runners/_local.py", "LocalRunner"], ["runners/_slurm.py", "SlurmRunner"], ["runners/_sitecustomize.py", "injection"]],
  },
  /* ── Capture ── */
  capture: {
    icon: "⚡", domain: "capture", title: "Capture Orchestrator", sub: "nova capture", ver: "v0.2",
    tag: "The heart of capture. Wraps any subprocess and records the model calls, tool calls, and events it can see into a schema-valid Run Capsule.",
    connects: ["adapters", "runners", "capsule", "hooks", "secrets", "lineage"],
    summary: "CaptureOrchestrator.run() generates a ULID run_id, builds the capsule directory, snapshots the environment, installs wire hooks via sitecustomize, spawns the subprocess, streams events through CapsuleWriter, then scans for secrets, infers lineage, and finalizes the manifest.",
    subs: [["CaptureOrchestrator", "top-level run() flow"], ["CapsuleWriter", "thread-safe JSONL writer"], ["SecretScannerV0", "redacts 12 LLM key patterns"], ["EventRecorder", "File / Network / HumanApproval events"], ["capture_environment()", "OS, Python, package snapshot"], ["minimal_replay_policy()", "replay.yaml baseline"]],
    cli: ["nova capture python agent.py --tag exp-001", "nova capture --runner docker python agent.py"],
    io: { in: "Any subprocess command", out: "Run Capsule on disk" },
    resp: ["Generate ULID run_id and create the capsule directory", "Install wire hooks and spawn the subprocess via the chosen runner", "Stream model/tool/events into the CapsuleWriter (thread-safe JSONL)", "Scan & redact secrets, then finalize capsule.yaml + env.lock", "Emit OpenLineage START/COMPLETE events"],
    files: [["capture/orchestrator.py", "CaptureOrchestrator"], ["capture/capsule.py", "CapsuleWriter"], ["capture/secrets.py", "SecretScannerV0"], ["capture/event_recorder.py", "EventRecorder"]],
  },
  hooks: {
    icon: "🪝", domain: "capture", title: "Wire-Level Hooks", sub: "LLM & HTTP intercept", ver: "v0.2–0.6",
    tag: "Monkey-patches LLM SDKs and HTTP clients at import time to capture requests/responses with OTel GenAI semantics.",
    connects: ["capture", "capsule"],
    summary: "Installed inside the subprocess by sitecustomize before user code runs. Each hook intercepts a specific SDK call, records the request/response as an OTel GenAI-semconv event, and forwards it to the CapsuleWriter — without changing the SDK's behavior.",
    subs: [["_openai.py", "OpenAI Completions/Chat hook"], ["_anthropic.py", "Anthropic Messages hook"], ["_httpx.py", "httpx.Client.send"], ["_requests.py", "requests.Session.send"], ["_bedrock.py", "AWS Bedrock agentic invoke"], ["body_adapters/", "request/response serializers"]],
    cli: ["# automatic — installed by sitecustomize", "# no user action required"],
    io: { in: "SDK method calls", out: "OTel GenAI events" },
    resp: ["Intercept LLM/HTTP SDK methods transparently at import time", "Map calls to OTel GenAI semconv attributes", "Forward events to the CapsuleWriter without altering behavior"],
    files: [["capture/hooks/_openai.py", "OpenAI hook"], ["capture/hooks/_anthropic.py", "Anthropic hook"], ["capture/hooks/_bedrock.py", "Bedrock hook"]],
  },
  secrets: {
    icon: "🛡️", domain: "capture", title: "Secret Scanner", sub: "redaction + proof", ver: "v0.4",
    tag: "Redacts 12 LLM API-key patterns from all capsule artifacts and emits a redaction proof for compliance.",
    connects: ["capture", "trust", "compliance"],
    summary: "SecretScannerV0 runs after the subprocess exits, scanning every JSONL file for known LLM key shapes. Matches are replaced with redaction markers, and a redaction_proof is written so evidence exports can attest that no secrets leaked.",
    subs: [["SecretScannerV0", "12-pattern regex scanner"], ["redaction_proof", "attestation written to capsule"]],
    cli: ["# runs automatically at capture finalize", "nova validate <capsule>  # checks redaction"],
    io: { in: "Raw capsule JSONL", out: "Redacted JSONL + proof" },
    resp: ["Scan all capsule artifacts for 12 known LLM key patterns", "Replace matches with redaction markers", "Emit a redaction_proof for evidence export gating"],
    files: [["capture/secrets.py", "SecretScannerV0"]],
  },
  /* ── Core data ── */
  capsule: {
    icon: "📦", domain: "data", title: "Run Capsule", sub: "the unit of evidence", ver: "v0.2 schema",
    tag: "The portable, schema-valid, secret-scanned record of one execution. Everything downstream reads from it.",
    connects: ["capture", "replay", "diff", "lineage", "eval", "trust", "kg", "compliance"],
    summary: "A directory holding capsule.yaml (manifest), model-calls.jsonl & tool-calls.jsonl (OTel GenAI), events.jsonl, env.lock, lineage.jsonl, optional .seal/ (DSSE signature), and outputs/. It is the universal connector between every subsystem.",
    subs: [["capsule.yaml", "status, timestamps, counts, tags"], ["model-calls.jsonl", "one record per LLM call"], ["tool-calls.jsonl", "one record per tool call"], ["env.lock", "Python, OS, packages"], ["lineage.jsonl", "consumed/produced_by/replayed_from edges"], [".seal/", "DSSE envelope + RFC 3161 timestamp"], ["outputs/", "stdout, stderr, artifacts"]],
    cli: ["nova inspect <capsule>", "nova validate <capsule>", "nova capsule tree <capsule>"],
    io: { in: "Written by Capture", out: "Read by all analysis & trust" },
    resp: ["Hold a complete, replayable record of one execution", "Stay schema-valid (run-capsule v0.2) and forward-compatible", "Carry redaction proof + optional cryptographic seal"],
    files: [["capsule/schema.py", "CapsuleSchema"], ["capsule/validator.py", "validation"], ["schemas/run-capsule.schema.json", "normative spec"]],
  },
  envelope: {
    icon: "✉️", domain: "data", title: "Event Envelope v1", sub: "cluster wire format", ver: "v0.19 · exp",
    tag: "Forward-compatible event wire format for cluster-scale ingestion. JSON Schema + Avro + Proto.",
    connects: ["capsule", "evfabric"],
    summary: "A versioned envelope wrapping every event with run/trace/span ids, cluster_id, tenant_id, and a SHA-256 payload hash. additionalProperties:true keeps it forward-compatible. Pinned by envelope-v1.sha256 and validated against a 1000-event corpus.",
    subs: [["EventEnvelope model", "Pydantic + jsonschema"], ["AvroSerializer", "binary wire serialization"], ["envelope-v1.sha256", "version pin"]],
    cli: ["# Phase 1 cluster-scale schema", "nova validate-envelope <event.json>"],
    io: { in: "Capsule events", out: "NATS / Kafka / collector" },
    resp: ["Wrap events with run/trace/span/cluster/tenant identity", "Carry a payload hash for integrity", "Stay forward-compatible (additionalProperties)"],
    files: [["envelope/models.py", "EventEnvelope"], ["envelope/validator.py", "validate_event()"], ["schemas/event-envelope-v1/", "schema + proto + corpus"]],
  },
  /* ── Analyze ── */
  replay: {
    icon: "🔄", domain: "analyze", title: "Replay Engine", sub: "4 modes", ver: "v0.3",
    tag: "Replays or inspects a captured capsule in five modes — forensic, mocked, semantic, exact, and experimental intervention.",
    connects: ["capsule", "policy", "diff"],
    summary: "ReplayEngine loads the capsule, checks environment compatibility, evaluates per-tool policy, and runs one of five modes. 'mocked' re-executes the subprocess, serving recorded LLM responses from the capsule while tool calls run live; 'intervention' (experimental) re-runs a counterfactual; the others are non-executing analyses.",
    subs: [["ReplayEngine", "orchestrator"], ["ReplayFlags", "safety ladder: readonly → mutating → external"], ["PolicyEvaluator", "per-tool OPA decisions"], ["MockModelDispatcher", "serves LLM calls from cache"], ["EnvironmentResolver", "env compatibility check"]],
    cli: ["nova replay <capsule> --mode forensic", "nova replay <capsule> --mode mocked"],
    io: { in: "Run Capsule", out: "ReplayResult" },
    resp: ["Check env compatibility against env.lock", "Evaluate per-tool policy on the safety ladder", "Run forensic / semantic / exact analysis (no subprocess)", "In mocked mode, re-execute with LLM calls served from cache"],
    files: [["replay/_engine.py", "ReplayEngine"], ["replay/_flags.py", "ReplayFlags"], ["replay/_dispatcher.py", "MockModelDispatcher"]],
  },
  diff: {
    icon: "↔️", domain: "analyze", title: "Diff Engine", sub: "structural comparison", ver: "v0.3",
    tag: "Aligns and compares two capsules call-by-call to surface regressions. Text, JSON, or GitHub-annotation output.",
    connects: ["capsule", "replay"],
    summary: "DiffEngine aligns model calls by span_id (or count + prompt hash) and tool calls by name + arg hash, then diffs environment and output files. The DiffReport reports added/removed/changed counts — ideal for CI regression gates.",
    subs: [["DiffEngine", "alignment + comparison"], ["Call Aligner", "span_id / prompt-hash matching"], ["DiffReport", "structured result"], ["Formatters", "text / JSON / GitHub annotation"]],
    cli: ["nova diff <capsule-A> <capsule-B>", "nova diff A B --format github"],
    io: { in: "Two Run Capsules", out: "DiffReport" },
    resp: ["Align model & tool calls across two capsules", "Diff environment and output files by hash", "Emit CI-friendly reports (text/JSON/GitHub)"],
    files: [["diff/_engine.py", "DiffEngine"], ["diff/_align.py", "alignment"], ["diff/_format.py", "formatters"]],
  },
  lineage: {
    icon: "🔗", domain: "analyze", title: "Lineage Graph", sub: "provenance & blast-radius", ver: "v0.4 / v0.40",
    tag: "A directed graph of runs, assets, and artifacts. BFS in either direction answers provenance and impact queries.",
    connects: ["capsule", "storage", "evfabric"],
    summary: "LineageWriter infers consumed/produced_by/replayed_from edges at capture; LineageImporter indexes them. v1 uses SQLite BFS; v2a uses embedded KuzuDB (p99 = 45 ms at 10M edges). OpenLineage 2.0.2 events emit to HTTP or file.",
    subs: [["LineageWriter", "infer edges at capture time"], ["LineageImporter", "index capsule → graph"], ["LineageStore v1", "SQLite BFS, <1M edges"], ["LineageStore v2a", "KuzuDB, p99=45ms @10M"], ["OpenLineage emitter", "2.0.2 events, HTTP/file"]],
    cli: ["nova lineage import <capsule>", "nova lineage provenance <ref>", "nova lineage blast-radius <ref>"],
    io: { in: "lineage.jsonl", out: "Provenance / impact closures" },
    resp: ["Infer typed lineage edges during capture", "Index edges into SQLite (v1) or KuzuDB (v2a)", "Answer provenance (backward BFS) and blast-radius (forward BFS)", "Emit OpenLineage events to external catalogs"],
    files: [["lineage/_writer.py", "LineageWriter"], ["lineage/_store.py", "LineageStore v1"], ["lineage/backends/kuzu.py", "KuzuDB v2a"]],
  },
  eval: {
    icon: "🧪", domain: "analyze", title: "Eval Suites", sub: "GAIA · SWE · MMLU", ver: "v0.9",
    tag: "Standard, OCI-pinned benchmark suites with Rego-gated promotion on regression.",
    connects: ["capsule", "registry", "policy"],
    summary: "EvalRunner discovers entrypoints via the novafabric.evals group and runs GAIA, SWE-bench, AgentBench, MMLU, or the Smoke suite in OCI-pinned containers. Results land in SQLite and feed the promotion gate (eval_score ≥ 0.90).",
    subs: [["EvalRunner", "entrypoint discovery"], ["Suite adapter", "GAIA / SWE-bench / MMLU / Smoke"], ["EvalResult", "SQLite-stored scores"], ["OCI-pinned containers", "reproducible eval envs"]],
    cli: ["nova eval agent@1.0 --suite gaia", "nova eval agent@1.0 --suite smoke"],
    io: { in: "Asset + suite", out: "EvalResult (score)" },
    resp: ["Discover and run standard benchmark suites", "Execute in OCI-pinned containers for reproducibility", "Store scores and feed the Rego promotion gate"],
    files: [["eval/runner.py", "EvalRunner"], ["evals/suites/", "GAIA · SWE · MMLU"]],
  },
  kg: {
    icon: "🕸️", domain: "analyze", title: "Knowledge Graph", sub: "entity triples (KuzuDB)", ver: "v0.17",
    tag: "Aggregates agent–model–tool–endpoint relationships across all capsules into a queryable graph.",
    connects: ["capsule", "storage", "server"],
    summary: "A 5-stage ingestion pipeline extracts events, normalizes entity names (OTel semconv), resolves/merges entities, accumulates with a G-Counter CRDT, and flushes to KuzuDB. Serves topology, agent edges, audit anomalies, and a Tier-3 entity review queue.",
    subs: [["KGIngestionPipeline", "5-stage ingest"], ["EntityNormaliser", "OTel semconv canonicalisation"], ["KGStore", "KuzuDB node/edge tables"], ["G-Counter CRDT", "idempotent accumulation"], ["ReviewQueue", "Tier-3 entity resolution"]],
    cli: ["nova kg ingest", "nova kg query", "nova kg audit", "nova kg status"],
    io: { in: "Capsule events", out: "Entity graph + topology" },
    resp: ["Normalize and deduplicate entities across capsules", "Accumulate call counts idempotently (CRDT)", "Serve multi-layer topology and audit anomalies"],
    files: [["kg/pipeline.py", "KGIngestionPipeline"], ["kg/store.py", "KGStore"], ["kg/entity_normaliser.py", "EntityNormaliser"]],
  },
  /* ── Trust ── */
  trust: {
    icon: "🔐", domain: "trust", title: "Trust & Signing", sub: "NovaSeal · DSSE · RFC 3161", ver: "v0.4 / v0.29",
    tag: "Cryptographically signs, timestamps, and verifies capsules. DSSE envelopes, RFC 3161 TSA, Merkle log, Sigstore.",
    connects: ["capsule", "secrets", "promote", "storage"],
    summary: "KeyRing manages Ed25519 / ECDSA P-256 keys. nova seal builds a JCS-canonical DSSE envelope, requests an RFC 3161 timestamp (X.509 chain walk + CRL/OCSP), appends to a Merkle log, and optionally publishes to Sigstore Rekor. nova verify returns signature_ok / timestamp_ok / log_integrity_ok.",
    subs: [["KeyRing", "Ed25519 / ECDSA P-256 keypairs"], ["DSSE Envelope", "signed canonical payload"], ["RFC 3161 TSA", "timestamp + X.509 chain + CRL/OCSP"], ["NovaSeal batch signer", "KMS Ed25519, nonce store"], ["Merkle Log", "append-only hash chain"], ["Sigstore Rekor", "transparency log (optional)"]],
    cli: ["nova seal propose <capsule>", "nova verify <capsule>", "nova sigstore-publish <capsule>"],
    io: { in: "Run Capsule", out: "Signed Evidence Bundle" },
    resp: ["Build a JCS-canonical, ECDSA-signed DSSE envelope", "Obtain & verify an RFC 3161 timestamp (chain + revocation)", "Append to an append-only Merkle log", "Optionally anchor in the Sigstore Rekor transparency log", "Verify all three properties offline on demand"],
    files: [["trust/keyring.py", "KeyRing"], ["trust/_rfc3161.py", "RFC 3161 verify"], ["trust/novaseal/", "NovaSeal core"], ["evidence/merkle.py", "Merkle log"]],
  },
  /* ── Govern ── */
  promote: {
    icon: "✅", domain: "govern", title: "Promotion (Maker-Checker)", sub: "SoD, dual-approval", ver: "v0.8 / v0.14",
    tag: "Separation-of-Duties promotion. Proposer ≠ approver, enforced by signature fingerprints and a 5-check verifier.",
    connects: ["trust", "policy", "registry"],
    summary: "Two flows: ADR-0058 (asset lifecycle — Ed25519-signed proposals in SQLite) and ADR-0059 (capsule-level DSSE linked envelope — offline-verifiable bundle files). Both enforce that the approver differs from the proposer.",
    subs: [["BundleStore", "proposal / approval bundles"], ["SoD Verifier", "5-check separation of duties"], ["PolicyStore", "SQLite promote_policy table"], ["predicates", "sign/verify promote envelope"], ["Rekor client", "optional Sigstore submission"]],
    cli: ["nova promote propose agent@1.0 --identity ALICE", "nova seal approve <proposal-uuid>"],
    io: { in: "Asset / capsule + identities", out: "Approved promotion + audit" },
    resp: ["Sign proposals with a maker identity", "Verify approver ≠ proposer via key fingerprints", "Run the 5-check SoD verifier (key, digest, ordering)", "Stay offline-verifiable — bundle files, no DB required"],
    files: [["promote/predicates.py", "sign/verify envelope"], ["promote/verifier.py", "5-check SoD"], ["promote/bundle_store.py", "BundleStore"]],
  },
  policy: {
    icon: "⚖️", domain: "govern", title: "Policy Engine (OPA)", sub: "Rego decision gates", ver: "v0.8",
    tag: "Evaluates OPA/Rego policies at every promotion, replay, and export. Logs every decision to the audit log.",
    connects: ["promote", "replay", "eval", "compliance", "governance"],
    summary: "PolicyEngine builds a PolicyInput, runs `opa eval` in a subprocess (or NoopEngine if OPA is absent), and returns a PolicyDecision. Built-in policies gate promotion (score ≥ 0.90), maker-checker, mutating replay, and evidence export. Denials raise PolicyDeniedError and are audited.",
    subs: [["OpaEngine", "opa eval subprocess"], ["NoopEngine", "allow-all fallback + warning"], ["promote_gate.rego", "eval_score ≥ 0.90, unsafe_skips == 0"], ["maker_checker_gate.rego", "opt-in dual approval"], ["replay_mutating.rego", "admin role required"], ["evidence_export.rego", "redaction proof present"]],
    cli: ["nova policy check <input.json>", "nova policy load <bundle>"],
    io: { in: "PolicyInput", out: "PolicyDecision (allow/deny)" },
    resp: ["Evaluate Rego policies via OPA subprocess", "Fall back to allow-all NoopEngine when OPA is absent", "Raise PolicyDeniedError on denial with explain output", "Audit every decision (actor, resource, decision id)"],
    files: [["policy/_opa_engine.py", "OpaEngine"], ["policy/_noop_engine.py", "NoopEngine"], ["policies/novafabric/defaults/", "built-in Rego"]],
  },
  compliance: {
    icon: "📄", domain: "govern", title: "Compliance & Export", sub: "EU AI Act · NIS2 · GDPR", ver: "v0.15+",
    tag: "Turns capsules into regulatory evidence. PII detection, crypto-shredding, six audit profiles, signed exports.",
    connects: ["capsule", "secrets", "policy", "governance"],
    summary: "PIIDetectionGate (Presidio + regex) tags subjects; DEKStore enables GDPR Art.17 crypto-shredding. AuditEngine scores capsules against NIST AI RMF, EU AI Act, GDPR, SOC 2, ISO 42001, and Reproducibility. Exporters emit Annex IV, NIS2, RO-Crate, and PROV-JSON (JSON-LD + PDF).",
    subs: [["PIIDetectionGate", "Presidio + regex detectors"], ["DEKStore", "per-subject keys, crypto-shredding"], ["AnnexIVExporter", "EU AI Act 15-element"], ["NIS2Exporter", "incident report phases"], ["AuditEngine", "6 weighted compliance profiles"], ["EU AI Act Art.12", "10-year retention floor"]],
    cli: ["nova export-annex-iv <capsule>", "nova pii erase <subject-id>", "nova audit report <capsule>"],
    io: { in: "Run Capsule", out: "Signed compliance documents" },
    resp: ["Detect & encrypt PII for GDPR erasure (crypto-shredding)", "Score capsules against 6 weighted compliance profiles", "Export Annex IV / NIS2 / RO-Crate / PROV-JSON as JSON-LD + PDF"],
    files: [["compliance/pii/", "PIIDetectionGate"], ["compliance/export/annex_iv.py", "AnnexIVExporter"], ["compliance/audit/engine.py", "AuditEngine"]],
  },
  governance: {
    icon: "🏛️", domain: "govern", title: "Governance & Judge", sub: "risk tiers + LLM judges", ver: "v0.16",
    tag: "Classifies risk tier (EU AI Act / NIST / OMB) and runs multi-judge evaluation with inter-rater agreement.",
    connects: ["capsule", "policy"],
    summary: "RiskTierClassifier runs a 4-stage pipeline against EU AI Act, NIST AI RMF, and OMB M-24-10 vocabularies. JudgeFramework fans out embedding, numerical, and LLM judges (K=3 self-consistency), computes Fleiss/Cohen kappa, and converts judgments into Rego policy inputs.",
    subs: [["RiskTierClassifier", "4-stage risk pipeline"], ["Vocabularies", "EU AI Act · NIST · OMB M-24-10"], ["JudgeFramework", "fan-out orchestrator"], ["Embedding / Numerical / LLM judges", "three judge types"], ["Kappa", "Fleiss/Cohen inter-rater agreement"]],
    cli: ["nova classify <prompt-or-usecase>", "nova judge run <capsule>"],
    io: { in: "Capsule / use case", out: "Risk tier + judgment" },
    resp: ["Classify systems into EU AI Act risk tiers", "Run multi-judge evaluation with self-consistency voting", "Compute inter-rater agreement and feed Rego gates"],
    files: [["governance/classifier.py", "RiskTierClassifier"], ["judge/framework.py", "JudgeFramework"], ["judge/_kappa.py", "kappa"]],
  },
  registry: {
    icon: "📋", domain: "govern", title: "Asset Registry", sub: "agents · datasets · models", ver: "v0.1",
    tag: "Metadata and lifecycle for AI assets, with eval-gated promotion across stages.",
    connects: ["promote", "eval", "storage"],
    summary: "register_asset validates a YAML spec against typed Pydantic models (AgentAsset, DatasetAsset, ModelAsset…) and stores it in SQLite. Promotion transitions are eval-gated and policy-checked; a suggestion engine helps name assets.",
    subs: [["AssetService", "register / promote / get"], ["AssetSpec models", "BaseAssetSpec + typed subclasses"], ["SQLite store", "assets / eval_results / runs"], ["SuggestionEngine", "auto-suggest asset names"]],
    cli: ["nova register agent.yaml", "nova list assets", "nova promote direct agent@1.0 --to staging"],
    io: { in: "Asset spec YAML", out: "Registered asset + lifecycle" },
    resp: ["Validate asset specs against typed Pydantic models", "Store assets and eval results in SQLite", "Gate lifecycle transitions on eval score + policy"],
    files: [["registry/service.py", "AssetService"], ["spec/models.py", "AssetSpec models"], ["registry/store.py", "SQLite store"]],
  },
  /* ── Storage ── */
  storage: {
    icon: "💾", domain: "storage", title: "Storage Layer", sub: "polyglot persistence", ver: "v0.1 / v0.7",
    tag: "One protocol, many backends: SQLite locally, Postgres in server mode, S3/Azure/GCS WORM for compliance.",
    connects: ["capsule", "lineage", "kg", "registry", "trust", "server", "evfabric"],
    summary: "StorageBackend and MetadataStore protocols abstract the local↔server switch. SQLite (WAL) is the local default; Postgres 16 with RLS + PgBouncer backs server mode; WORM adapters (S3 Object Lock, Azure immutable, GCS Bucket Lock) hold sealed evidence; DuckDB and KuzuDB serve analytics and graphs.",
    subs: [["SQLite backend", "local default, WAL mode"], ["Postgres backend", "server-mode, RLS, JSONB"], ["MetadataStore", "query_runs / store_run / append_audit"], ["S3 / Azure / GCS WORM", "write-once compliance storage"], ["DuckDB", "in-process analytics, Parquet export"], ["Migration kit", "SQLite ↔ Postgres"]],
    cli: ["nova db migrate", "nova migrate-to-postgres"],
    io: { in: "All subsystem writes", out: "Durable, queryable state" },
    resp: ["Abstract local (SQLite) vs server (Postgres) behind one protocol", "Provide WORM-backed immutable evidence storage", "Serve graph (KuzuDB) and analytics (DuckDB) workloads", "Migrate cleanly between backends"],
    files: [["storage/_base.py", "StorageBackend protocol"], ["storage/_sqlite.py", "SQLite"], ["storage/_postgres.py", "Postgres"], ["storage/worm.py", "WORM adapters"]],
  },
  evfabric: {
    icon: "🔌", domain: "storage", title: "Evidence Fabric", sub: "3-tier event sink", ver: "v0.22",
    tag: "Three-tier event accumulation: DuckDB locally, NATS + ClickHouse at cluster scale.",
    connects: ["capsule", "storage", "lineage", "envelope"],
    summary: "Tier 1: a bounded asyncio queue feeds a DuckDB accumulator with Parquet export (fail-open). Tier 2: a NATS JetStream durable consumer feeds a ClickHouse OLAP sink and the KuzuDB lineage bulk-COPY path. Avro-serialized Event Envelope v1 is the wire format.",
    subs: [["DuckDBAccumulator", "Tier 1, in-process, Parquet"], ["EventQueueConsumer", "bounded asyncio queue (1000)"], ["NATSJetStreamConsumer", "Tier 2 durable, 24h retention"], ["ClickHouseAccumulator", "OLAP sink, AggregatingMergeTree"], ["AvroSerializer", "Event Envelope v1"]],
    cli: ["# background consumers in nova serve", "nova evidence-fabric status"],
    io: { in: "Capsule events", out: "DuckDB / ClickHouse / KuzuDB" },
    resp: ["Accumulate events locally in DuckDB (fail-open)", "Stream to ClickHouse and KuzuDB at cluster scale via NATS", "Serialize with Avro Event Envelope v1"],
    files: [["evidence_fabric/duckdb_accumulator.py", "Tier 1"], ["evidence_fabric/nats_consumer.py", "Tier 2"], ["evidence_fabric/clickhouse_accumulator.py", "OLAP sink"]],
  },
  /* ── Serve ── */
  server: {
    icon: "🌐", domain: "serve", title: "Server (REST API)", sub: "OIDC · RBAC · 40+ routes", ver: "v0.7",
    tag: "Multi-user FastAPI server. Every request flows auth → RBAC → route → backend.",
    connects: ["storage", "lineage", "kg", "policy", "compliance", "dashboard"],
    summary: "create_app() builds a FastAPI app with OIDC bearer / offline-token / device-grant auth, a reader<writer<admin RBAC layer (with last-admin lockout protection), and cursor-paginated routes for assets, capsules, runs, lineage, evidence, policy, compliance, and KG.",
    subs: [["FastAPI app", "create_app() factory"], ["Auth", "OIDC · offline tokens · device grant"], ["RBAC", "reader < writer < admin + lockout guard"], ["Route groups", "assets/capsules/runs/lineage/evidence/policy/compliance/kg"], ["Runs Cache", "cursor pagination (Scale-S1)"]],
    cli: ["nova server start", "nova server token issue --role writer"],
    io: { in: "HTTP requests", out: "JSON responses" },
    resp: ["Authenticate via OIDC, offline tokens, or device grant", "Enforce role-based access with last-admin lockout guard", "Route to MetadataStore, Lineage, KG, Policy, Compliance backends", "Paginate large result sets with cursors"],
    files: [["server/app.py", "create_app()"], ["server/auth.py", "verify_token"], ["server/rbac.py", "require_role"], ["server/routes/", "endpoint routers"]],
  },
  dashboard: {
    icon: "📊", domain: "serve", title: "Dashboard", sub: "web UI", ver: "v0.7+",
    tag: "Web UI for browsing capsules, lineage, evals, registry, and compliance — backed by a capsule watcher.",
    connects: ["server", "capsule", "topology"],
    summary: "A single-page app over a FastAPI backend. A CapsuleWatcher (polling or watchdog) keeps the capsule list live; pages cover overview stats, capsule detail, lineage graphs, asset registry, eval compare, replay viewer, evidence inspector, and a compliance tab.",
    subs: [["SPA", "Capsules · Lineage · Evals · Registry"], ["CapsuleWatcher", "Polling / Watchdog backend"], ["CapsuleLoader", "batch load from disk"], ["Audit viewer", "hash-chained log browser"]],
    cli: ["nova serve --experimental", "nova serve --topology"],
    io: { in: "Capsule directory + API", out: "Interactive web UI" },
    resp: ["Render capsule, lineage, eval, and compliance views", "Keep the capsule list live via a watcher backend", "Stream live topology updates to the browser"],
    files: [["serve/app.py", "dashboard app"], ["serve/capsule_watcher.py", "CapsuleWatcher"]],
  },
  topology: {
    icon: "🌌", domain: "serve", title: "Live Topology", sub: "TDP WebSocket stream", ver: "v0.32",
    tag: "Real-time agent call graph with Louvain clustering, streamed over a binary WebSocket protocol.",
    connects: ["dashboard", "kg", "evfabric"],
    summary: "DeltaBuffer (60 s ring buffer, pub-sub) feeds a binary TDP WebSocket; an in-memory DuckDB ClusterStore computes Louvain clusters; the browser renders a live, clustered call graph. ADS v1 Arrow IPC encodes the cluster payloads.",
    subs: [["DeltaBuffer", "60s ring buffer + pub-sub + TDP checkpoints"], ["ClusterStore", "DuckDB in-memory Louvain clusters"], ["ADS v1 encoder", "Arrow IPC encoding"], ["TDP WebSocket", "binary Arrow frames"], ["Sigma.js + Graphology", "client-side rendering"]],
    cli: ["nova serve --topology", "# GET /topology/clusters (Arrow IPC)", "# WS  /topology/stream (TDP)"],
    io: { in: "Live capsule events", out: "Streaming graph to browser" },
    resp: ["Buffer deltas in a 60 s ring with pub-sub", "Compute Louvain clusters in in-memory DuckDB", "Stream binary Arrow frames over a TDP WebSocket", "Render a live, clustered call graph"],
    files: [["serve/topology/delta_buffer.py", "DeltaBuffer"], ["serve/topology/cluster_store.py", "ClusterStore"], ["serve/topology/ads_encoder.py", "ADS v1"]],
  },
};

/* ───────────────────────── Layout groupings ───────────────────────── */
// Six subsystem domains — matches the NovaFabric architecture overview and the
// homepage capability band (Capture · Evidence · Analyze · Trust · Govern · Serve).
const PILLARS: { key: string; icon: string; title: string; sub: string; color: string; nodes: string[] }[] = [
  { key: "capture", icon: "⚡", title: "Capture", sub: "Wrap any subprocess. Record everything.", color: DOMAINS.capture.color, nodes: ["adapters", "runners", "capture", "hooks", "secrets"] },
  { key: "evidence", icon: "📦", title: "Evidence model", sub: "The portable, self-contained unit of record.", color: DOMAINS.data.color, nodes: ["capsule", "envelope", "evfabric"] },
  { key: "analyze", icon: "🔬", title: "Analyze", sub: "Replay, compare, trace, evaluate.", color: DOMAINS.analyze.color, nodes: ["replay", "diff", "lineage", "eval", "kg"] },
  { key: "trust", icon: "🔐", title: "Trust", sub: "Sign, timestamp, verify evidence.", color: DOMAINS.trust.color, nodes: ["trust"] },
  { key: "govern", icon: "⚖️", title: "Govern", sub: "Policy gates, approvals, compliance.", color: DOMAINS.govern.color, nodes: ["promote", "policy", "compliance", "governance", "registry"] },
  { key: "serve", icon: "🌐", title: "Serve", sub: "Multi-user API, dashboard, topology.", color: DOMAINS.serve.color, nodes: ["storage", "server", "dashboard", "topology"] },
];
const LAYERS: { name: string; nodes: string[]; color: string }[] = [
  { name: "Runtime", nodes: ["adapters", "runners"], color: DOMAINS.runtime.color },
  { name: "Capture", nodes: ["capture", "hooks", "secrets"], color: DOMAINS.capture.color },
  { name: "Core Data", nodes: ["capsule", "envelope"], color: DOMAINS.data.color },
  { name: "Analyze", nodes: ["replay", "diff", "lineage", "eval", "kg"], color: DOMAINS.analyze.color },
  { name: "Trust + Gov", nodes: ["trust", "promote", "policy", "compliance", "governance", "registry"], color: DOMAINS.govern.color },
  { name: "Storage", nodes: ["storage", "evfabric"], color: DOMAINS.storage.color },
  { name: "Serve", nodes: ["server", "dashboard", "topology"], color: DOMAINS.serve.color },
];

/* ───────────────────────── Node card ───────────────────────── */
function NodeCard({
  id, state, registerRef, onOpen, onHover,
}: {
  id: string;
  state: "active" | "linked" | "dim" | "none";
  registerRef: (id: string, el: HTMLButtonElement | null) => void;
  onOpen: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const c = C[id];
  const color = DOMAINS[c.domain].color;
  const isHi = state === "active" || state === "linked";
  return (
    <button
      ref={(el) => registerRef(id, el)}
      onClick={() => onOpen(id)}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className="group relative text-left rounded-md bg-surface-2 px-3 py-2.5 transition-all duration-200 cursor-pointer"
      style={{
        borderLeft: `3px solid ${color}`,
        border: `1px solid ${isHi ? color : "var(--color-edge-2)"}`,
        borderLeftWidth: 3,
        borderLeftColor: color,
        opacity: state === "dim" ? 0.28 : 1,
        filter: state === "dim" ? "saturate(0.4)" : "none",
        transform: state === "active" ? "translateY(-3px)" : "none",
        boxShadow: isHi ? `0 8px 26px -10px ${color}, 0 0 0 1px ${color}` : "none",
        minWidth: 150,
      }}
    >
      <span
        className="absolute top-2 right-2.5 font-code text-[9px] font-bold tracking-wide rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "var(--color-surface-3)", color: "var(--color-muted)" }}
      >
        {c.ver}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-[15px] leading-none">{c.icon}</span>
        <span className="font-display text-[13px] font-semibold leading-tight text-ink">{c.title}</span>
      </span>
      <span className="block font-code text-[10.5px] text-muted leading-snug mt-0.5">{c.sub}</span>
    </button>
  );
}

/* ───────────────────────── Main component ───────────────────────── */
export default function ArchitectureExplorer() {
  const [view, setView] = useState<"pillars" | "layers">("pillars");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deepId, setDeepId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [wires, setWires] = useState<{ d: string; color: string; key: string }[]>([]);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const registerRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  const highlightId = activeId ?? hoverId;

  /* visible nodes after search */
  const matches = useCallback(
    (id: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const c = C[id];
      return (c.title + " " + c.sub + " " + c.summary + " " + c.tag).toLowerCase().includes(q);
    },
    [query]
  );

  /* compute wires when highlight changes */
  useLayoutEffect(() => {
    if (!highlightId) { setWires([]); return; }
    const stage = stageRef.current;
    const from = nodeRefs.current.get(highlightId);
    if (!stage || !from) { setWires([]); return; }
    const s = stage.getBoundingClientRect();
    const center = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
    };
    const a = center(from);
    const color = DOMAINS[C[highlightId].domain].color;
    const next: { d: string; color: string; key: string }[] = [];
    for (const tid of C[highlightId].connects) {
      const t = nodeRefs.current.get(tid);
      if (!t) continue;
      const b = center(t);
      const midx = a.x + (b.x - a.x) * 0.5;
      next.push({ d: `M ${a.x} ${a.y} C ${midx} ${a.y}, ${midx} ${b.y}, ${b.x} ${b.y}`, color, key: `${highlightId}-${tid}` });
    }
    setWires(next);
  }, [highlightId, view, query]);

  /* node visual state */
  const nodeState = (id: string): "active" | "linked" | "dim" | "none" => {
    if (!highlightId) return "none";
    if (id === highlightId) return "active";
    if (C[highlightId].connects.includes(id)) return "linked";
    return "dim";
  };

  const openDrawer = (id: string) => setActiveId(id);
  const closeDrawer = () => { setActiveId(null); setHoverId(null); };
  const openDeep = (id: string) => { setDeepId(id); };
  const closeDeep = () => setDeepId(null);

  /* esc handling */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (deepId) setDeepId(null); else if (activeId) closeDrawer(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deepId, activeId]);

  const active = activeId ? C[activeId] : null;
  const deep = deepId ? C[deepId] : null;

  return (
    <div
      // The explorer's node palette + drawer chrome are tuned for a dark canvas,
      // so it renders as a self-contained dark "control room" panel that lifts
      // off the light page. Full-bleed dark stage with elevation.
      data-theme="dark"
      className="font-body rounded-xl border border-edge-2 shadow-card-lg"
      style={{ backgroundColor: "var(--color-canvas)", padding: "22px" }}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1 p-1 rounded-md bg-surface border border-edge-2">
          {(["pillars", "layers"] as const).map((v) => (
            <button
              key={v}
              onClick={() => { setView(v); setHoverId(null); }}
              className="px-3.5 py-1.5 rounded font-code text-[12px] font-semibold transition-colors"
              style={{
                background: view === v ? "var(--color-surface-3)" : "transparent",
                color: view === v ? "var(--color-ink)" : "var(--color-muted)",
              }}
            >
              {v === "pillars" ? "◳ capabilities" : "≡ layers"}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search components…"
          className="font-code text-[12px] rounded-md bg-surface border border-edge-2 px-3 py-2 text-ink outline-none focus:border-amber transition-colors"
          style={{ width: 200 }}
        />

        <div className="hidden md:flex flex-wrap items-center gap-3 ml-auto">
          {Object.values(DOMAINS).map((d) => (
            <span key={d.label} className="flex items-center gap-1.5 font-code text-[10.5px] text-muted">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
              {d.label}
            </span>
          ))}
        </div>
      </div>

      <p className="font-code text-[11px] text-faint mb-4">
        click a box for detail · hover to light up its connections · <span className="text-muted">esc</span> to close
      </p>

      {/* ── Stage ── */}
      <div ref={stageRef} className="relative">
        {/* wires */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1, overflow: "visible" }}>
          <AnimatePresence>
            {wires.map((w) => (
              <motion.path
                key={w.key}
                d={w.d}
                fill="none"
                stroke={w.color}
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            ))}
          </AnimatePresence>
        </svg>

        {/* PILLARS view */}
        {view === "pillars" && (
          <div className="relative grid grid-cols-2 lg:grid-cols-3 gap-4" style={{ zIndex: 2 }}>
            {PILLARS.map((p) => (
              <div key={p.key} className="flex flex-col gap-2.5">
                <div className="relative rounded-md border border-edge-2 bg-surface p-3.5 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: p.color }} />
                  <span className="text-[20px] block mb-1.5">{p.icon}</span>
                  <h4 className="font-display text-[15px] font-semibold" style={{ color: p.color }}>{p.title}</h4>
                  <p className="text-muted text-[11px] leading-snug mt-1">{p.sub}</p>
                </div>
                {p.nodes.filter(matches).map((id) => (
                  <NodeCard key={id} id={id} state={nodeState(id)} registerRef={registerRef} onOpen={openDrawer} onHover={setHoverId} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* LAYERS view */}
        {view === "layers" && (
          <div className="relative flex flex-col gap-1.5" style={{ zIndex: 2 }}>
            {LAYERS.map((L, i) => (
              <div key={L.name}>
                <div className="relative flex gap-3 items-stretch rounded-md border border-edge-2 bg-surface px-3.5 py-3">
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l" style={{ background: L.color }} />
                  <div
                    className="font-code text-[10px] font-bold uppercase tracking-widest flex items-center justify-center shrink-0 pl-1.5"
                    style={{ color: L.color, writingMode: "vertical-rl", transform: "rotate(180deg)", minWidth: 24 }}
                  >
                    {L.name}
                  </div>
                  <div className="flex flex-wrap gap-2.5 items-center flex-1">
                    {L.nodes.filter(matches).map((id) => (
                      <NodeCard key={id} id={id} state={nodeState(id)} registerRef={registerRef} onOpen={openDrawer} onHover={setHoverId} />
                    ))}
                  </div>
                </div>
                {i < LAYERS.length - 1 && (
                  <div className="text-center text-faint text-[11px] tracking-[3px] py-0.5 select-none">▼ ▼ ▼</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Drawer (Level 2) ── */}
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/55"
              style={{ zIndex: 110, backdropFilter: "blur(2px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            <motion.aside
              className="fixed top-0 right-0 h-screen w-full sm:w-[440px] max-w-[92vw] flex flex-col"
              style={{ zIndex: 120, background: "rgba(14,14,18,0.92)", backdropFilter: "blur(22px)", borderLeft: "1px solid var(--color-edge-2)" }}
              initial={{ x: "102%" }} animate={{ x: 0 }} exit={{ x: "102%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <DrawerHead c={active} onClose={closeDrawer} />
              <div className="px-6 py-5 overflow-y-auto flex-1">
                <DrawerBody c={active} onGo={openDrawer} />
              </div>
              <div className="px-6 py-4 border-t border-edge">
                <button
                  onClick={() => openDeep(activeId!)}
                  className="w-full py-3 rounded-md font-code text-[13px] font-bold text-canvas flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(100deg, var(--color-amber), var(--color-amber-2))" }}
                >
                  open full view <span>→</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Deep dive (Level 3) ── */}
      <AnimatePresence>
        {deep && (
          <motion.div
            className="fixed inset-0 overflow-y-auto"
            style={{ zIndex: 130, background: "var(--color-canvas)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <DeepView c={deep} onBack={closeDeep} onGo={(id) => setDeepId(id)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── Drawer sub-parts ───────────────────────── */
function DrawerHead({ c, onClose }: { c: Comp; onClose: () => void }) {
  const color = DOMAINS[c.domain].color;
  return (
    <div className="px-6 pt-6 pb-4 border-b border-edge relative">
      <div className="font-code text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color }}>
        {DOMAINS[c.domain].label}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[28px] leading-none">{c.icon}</span>
        <h3 className="font-display text-[21px] font-bold text-ink leading-tight">{c.title}</h3>
      </div>
      <p className="text-muted text-[15px] md:text-[13px] mt-2 leading-relaxed">{c.tag}</p>
      <div className="flex gap-1.5 mt-3 flex-wrap">
        <span className="font-code text-[10px] font-bold px-2 py-1 rounded border" style={{ color: "var(--color-jade)", borderColor: "var(--color-edge-2)" }}>{c.ver}</span>
        {(c.ver.includes("exp") || c.ver.includes("plan")) && (
          <span className="font-code text-[10px] font-bold px-2 py-1 rounded border" style={{ color: "var(--color-amber)", borderColor: "var(--color-edge-2)" }}>experimental</span>
        )}
      </div>
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-8 h-8 rounded-md flex items-center justify-center text-muted hover:text-ink transition-all"
        style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-edge-2)" }}
        aria-label="Close"
      >✕</button>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 font-code text-[10px] font-bold uppercase tracking-widest text-faint mb-2.5">
      {children}<span className="flex-1 h-px bg-edge" />
    </div>
  );
}

function DrawerBody({ c, onGo }: { c: Comp; onGo: (id: string) => void }) {
  return (
    <>
      <section className="mb-6">
        <Label>what it does</Label>
        <p className="text-[13.5px] text-ink leading-relaxed">{c.summary}</p>
      </section>

      <section className="mb-6">
        <Label>sub-components</Label>
        <div className="flex flex-col gap-1.5">
          {c.subs.map(([n, d]) => (
            <div key={n} className="rounded-md bg-surface-2 border border-edge px-3 py-2">
              <b className="text-[12.5px] text-ink font-semibold">{n}</b>
              <span className="block text-muted text-[11.5px] mt-0.5 leading-snug">{d}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <Label>data flow</Label>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
          <div className="rounded-md bg-surface-2 border border-edge p-2.5">
            <div className="font-code text-[9.5px] font-bold uppercase tracking-widest text-faint mb-1.5">input</div>
            <div className="text-[11.5px] text-muted leading-snug">{c.io.in}</div>
          </div>
          <div className="text-amber text-[18px]">→</div>
          <div className="rounded-md bg-surface-2 border border-edge p-2.5">
            <div className="font-code text-[9.5px] font-bold uppercase tracking-widest text-faint mb-1.5">output</div>
            <div className="text-[11.5px] text-muted leading-snug">{c.io.out}</div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <Label>cli / usage</Label>
        <div className="flex flex-col gap-1.5">
          {c.cli.map((x, i) => (
            <code key={i} className="font-code text-[11.5px] rounded-md px-3 py-2 overflow-x-auto whitespace-nowrap" style={{ background: "#05070b", border: "1px solid var(--color-edge)", color: "var(--color-jade)" }}>{x}</code>
          ))}
        </div>
      </section>

      <section>
        <Label>connected to</Label>
        <div className="flex flex-wrap gap-2">
          {c.connects.map((cid) => {
            const cc = C[cid];
            return (
              <button
                key={cid}
                onClick={() => onGo(cid)}
                className="flex items-center gap-1.5 font-code text-[11.5px] font-semibold px-2.5 py-1.5 rounded-md text-muted hover:text-ink transition-all hover:-translate-y-0.5"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-edge-2)" }}
              >
                <span className="w-2 h-2 rounded-sm" style={{ background: DOMAINS[cc.domain].color }} />
                {cc.icon} {cc.title}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

/* ───────────────────────── Deep view (Level 3) ───────────────────────── */
function DeepView({ c, onBack, onGo }: { c: Comp; onBack: () => void; onGo: (id: string) => void }) {
  const color = DOMAINS[c.domain].color;
  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-4 px-6 md:px-8 py-4 border-b border-edge" style={{ background: "rgba(7,7,10,0.92)", backdropFilter: "blur(12px)" }}>
        <button onClick={onBack} className="px-4 py-2 rounded-md font-code text-[13px] font-semibold text-ink hover:-translate-x-0.5 transition-transform" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-edge-2)" }}>← back</button>
        <div className="font-code text-[13px] text-muted">architecture <span className="text-faint">/</span> <b className="text-ink">{c.title}</b></div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 md:px-8 py-9 pb-24">
        {/* hero */}
        <div className="flex items-start gap-4 mb-2">
          <span className="text-[40px] leading-none">{c.icon}</span>
          <div>
            <h2 className="font-display text-[28px] font-bold text-ink leading-tight">{c.title}</h2>
            <p className="text-muted text-[14px] mt-1.5 max-w-[620px] leading-relaxed">{c.summary}</p>
            <div className="flex gap-1.5 mt-3.5 flex-wrap">
              <span className="font-code text-[10px] font-bold px-2 py-1 rounded border" style={{ color: "var(--color-jade)", borderColor: "var(--color-edge-2)" }}>{c.ver}</span>
              <span className="font-code text-[10px] font-bold px-2 py-1 rounded border" style={{ color, borderColor: color }}>{DOMAINS[c.domain].label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* responsibilities */}
          <div className="rounded-md border border-edge-2 bg-surface p-5">
            <h3 className="font-code text-[11px] font-bold uppercase tracking-widest text-muted mb-4">responsibilities</h3>
            {c.resp.map((r, i) => (
              <div key={i} className="flex gap-3 py-2.5 border-b border-edge last:border-0">
                <span className="w-6 h-6 rounded shrink-0 flex items-center justify-center font-code text-[12px] font-bold" style={{ background: "var(--color-surface-3)", color }}>{i + 1}</span>
                <p className="text-[13px] text-ink leading-relaxed">{r}</p>
              </div>
            ))}
          </div>

          {/* internal flow + files */}
          <div className="flex flex-col gap-6">
            <div className="rounded-md border border-edge-2 bg-surface p-5">
              <h3 className="font-code text-[11px] font-bold uppercase tracking-widest text-muted mb-4">internal components</h3>
              <div className="flex flex-col">
                {c.subs.map(([n, d], i) => (
                  <div key={n} className="flex gap-3 relative pb-4 last:pb-0">
                    {i < c.subs.length - 1 && <span className="absolute left-[13px] top-7 bottom-0 w-px bg-edge-2" />}
                    <span className="w-7 h-7 rounded-md shrink-0 z-10 flex items-center justify-center font-code text-[12px] font-bold text-canvas" style={{ background: color }}>{i + 1}</span>
                    <div>
                      <b className="text-[13px] font-semibold text-ink block">{n}</b>
                      <span className="text-[12px] text-muted leading-snug">{d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-edge-2 bg-surface p-5">
              <h3 className="font-code text-[11px] font-bold uppercase tracking-widest text-muted mb-4">key source files</h3>
              <div className="flex flex-col gap-1.5">
                {c.files.map(([f, note]) => (
                  <div key={f} className="flex justify-between gap-3 font-code text-[11.5px] rounded px-3 py-2" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-edge)" }}>
                    <b className="font-normal" style={{ color: "var(--color-jade)" }}>{f}</b>
                    <span className="text-faint text-[10.5px] text-right">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* connected */}
        <div className="mt-8">
          <h3 className="font-code text-[11px] font-bold uppercase tracking-widest text-muted mb-3.5">connected components</h3>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {c.connects.map((cid) => {
              const cc = C[cid];
              const ccolor = DOMAINS[cc.domain].color;
              return (
                <button
                  key={cid}
                  onClick={() => onGo(cid)}
                  className="text-left rounded-md border border-edge-2 bg-surface p-4 hover:-translate-y-0.5 transition-transform"
                  style={{ borderLeft: `3px solid ${ccolor}` }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[17px]">{cc.icon}</span>
                    <span className="font-display text-[14px] font-semibold text-ink">{cc.title}</span>
                  </div>
                  <p className="text-[11.5px] text-muted leading-snug">{cc.tag}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
