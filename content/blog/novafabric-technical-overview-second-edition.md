---
title: "NovaFabric Technical Overview, second edition, is on arXiv"
date: 2026-10-28
category: lab-update
tags: [arxiv, architecture, replay, evidence, technical-report]
excerpt: A 75-page reference report on the current NovaFabric release: the architecture, each engine's contract, a maturity label on every capability, and its limits.
---

<aside class="callout" role="note">
<p><strong>Status: technical report, not a new study.</strong> <a href="https://arxiv.org/abs/2610.34594">arXiv:2610.34594</a> describes NovaFabric v0.107.0, which is experimental. It reports no new experiments. The measured evaluation is in the <a href="https://arxiv.org/abs/2609.12582">earlier system paper</a>, covered in <a href="/blog/novafabric-on-arxiv-what-the-paper-covers/">what that paper covers</a> and <a href="/blog/what-the-novafabric-paper-measured/">what it measured</a>.</p>
</aside>

The first paper asked whether NovaFabric's mechanisms work and measured them. This one answers a different question: **what exactly is the system today, and what does each part promise?** It is the second edition of the NovaFabric Technical Overview, 75 pages, by Mohsen Seyedkazemi Ardebili. It was submitted on 25 October 2026 (cs.DC, cross-listed cs.CR and cs.SE) and supersedes a June 2026 first edition written against v0.45.1.

## The idea in two formats

The report's design rests on two formats and borrows the rest from existing standards.

- The **Run Capsule** is a directory of flat files and the source of truth. Every database in the system is an index that can be rebuilt from capsules.
- The **Evidence Bundle** is the signed export you hand to an auditor.

Everything else follows OpenTelemetry GenAI, OpenLineage, W3C PROV, in-toto and DSSE, RFC 3161 and CycloneDX. A single-node run is treated as the smallest case of a distributed one. The schema carries a capsule hierarchy for Slurm arrays and Kubernetes jobs, but the report states that automatic parent finalization is library-only today.

The operating model is the same verb chain as before: **capture, seal, replay, diff, audit**.

## What is in it

| Chapters | What they cover |
|---|---|
| Problem, landscape | Why logs and traces answer poorly after the fact, four adjacent tool families and what each leaves open, and an executable differentiation table |
| Concepts, architecture | The five primitives, the Run Capsule layout, the Event Envelope, parent and child capsules, design invariants |
| Capture | Capture at the wire, why every capture layer fails open, why the workload is treated as untrusted input, capture levels, secret scanning, runners |
| Replay and diff | Replay as a stated contract per mode, the safety ladder for anything not served from the capsule, structural diff and its CI gate |
| Trust and evidence | The three proofs NovaSeal can attach, Merkle constructions, Evidence Bundles, retention and legal holds, two-person control |
| Lineage, governance | The provenance graph and its backends, policy gates, human oversight as evidence, compliance exporters |
| Surfaces, scale | The CLI, the dashboard and its authorization model, server mode, the Go collector, distributed runs, the reliability contract |
| Performance, maturity, roadmap | One catalogue of published numbers, a capability matrix, what is planned and what is not |
| Appendices | The CLI surface, what changed since edition 1, how the report was verified |

## Three rules the report follows

1. **Numbers are generated, not typed.** Every count except the number of private design records comes from a probe script run against the source at the v0.107.0 tag: 150 top-level commands, 84 Python subpackages and 16,721 test functions in 1,239 files.
2. **Every capability carries a maturity label:** works today, experimental, planned or future design. Where the prose and the code disagreed, the code won, and the report notes the disagreement.
3. **Every diagram is rendered and inspected**, from editable source with one shared theme.

## Contracts worth reading closely

**Replay is a contract, not a button.** Hosted models drift, so the report does not claim byte-exact replay of remote model calls. It lists five modes and says for each whether it re-executes anything:

| Mode | Re-executes? | What it guarantees |
|---|---|---|
| forensic | no | Read-only inspection of the record |
| semantic | no | Scores recorded responses by text similarity, not by meaning |
| exact | no | An eligibility report |
| mocked | yes | Re-runs the recorded command with model and MCP results served from the capsule |
| intervention | yes | Counterfactual replay (experimental) |

Mocked replay fails closed. A call with no recorded response, an unmatched tool call or an unconsumed recorded response ends the replay with exit code 1 and a divergence record, and unsupported SDK surfaces are refused instead of approximated. The report lists what a replay does not cover. Network connections are reported, not blocked, and substituting tool results beyond MCP is experimental. See the [replay modes](/docs/architecture/replay-modes/) page for the current reference.

**Intact is not trusted.** The trust chapter separates what a signature, a timestamp and a log entry each establish. A signature alone shows possession of a key. The verifier reports a signer identity-trust level and says whether a timestamp token is anchored to a time authority you supplied or only intact. A capsule can verify as unchanged and still not be trusted. Sealing stays opt-in. See [sealing and verification](/docs/architecture/sealing-and-verification/).

**A capsule is untrusted input.** Once the workload has exited, finalization treats its capsule as untrusted. A sweep removes every symbolic link, FIFO, socket and device at any depth without following it, and records each removal as tampering. Redaction and a residual rescan follow, then a digest of every evidence file goes into the manifest. The dashboard and HTTP API run the same verifier as the command line, and the dashboard's HTTP routes sit behind a deny-by-default authorization table.

## Where the report says it stops

The "honest limits" boxes are the point of the document. A few of them:

- It is **not** an orchestrator or scheduler, a training platform, an inference server, an LLM gateway, a hosted service or a real-time monitoring product.
- It produces evidence for compliance processes and never claims that an export is compliance. The regulatory exporters are experimental.
- Semantic replay compares text with a string-similarity measure. It does not judge meaning.
- Capture overhead has a fixed cost that does not shrink with workload size. The report explains how its two published capture numbers differ by an order of magnitude and both are correct, and each number carries a status: gated in CI, measured on stated hardware, or a target.
- The project is pre-1.0. Freezing the capsule format is the stated next step.

## Read it

- Report: [arxiv.org/abs/2610.34594](https://arxiv.org/abs/2610.34594)
- The system paper and its evaluation: [arxiv.org/abs/2609.12582](https://arxiv.org/abs/2609.12582)
- Source: [github.com/MSKazemi/novafabric](https://github.com/MSKazemi/novafabric)
- The current documentation: [novafabric.ai/docs](/docs/)
- More research: [novafabric.ai/research](/research/)
