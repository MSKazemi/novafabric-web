---
title: "NovaFabric on arXiv: what the paper covers"
date: 2026-09-11
category: lab-update
tags: [arxiv, research, evidence, replay, provenance]
excerpt: The NovaFabric system paper is on arXiv as a preprint: the question it asks, what the system does, what its eight research questions test, and its limits.
---

<aside class="callout" role="note">
<p><strong>Status: preprint.</strong> <em>NovaFabric: Tamper-Evident, Replayable Evidence for Autonomous AI Agent Runs</em> is an arXiv preprint, not a peer-reviewed publication. The implementation it describes is experimental.</p>
</aside>

The paper is [arXiv:2609.12582](https://arxiv.org/abs/2609.12582), by Mohsen Seyedkazemi Ardebili. It is the design, threat model and evaluation of NovaFabric in one place. This post is a map of what is inside, so you can decide which parts are worth your time.

## The question

When an autonomous AI agent does something consequential, **what can be proven about what it did?**

Agent-observability tools already capture detailed traces. The paper's argument is that a trace is a different kind of object from evidence. It sits in a database where a record can be altered without anyone noticing, it carries no recipe for re-running the run it describes, and it says nothing about whether a secret captured along the way was removed. Rules such as the EU AI Act's logging duty, ISO/IEC 42001 and the NIST AI Risk Management Framework assume records that an independent party can check. The paper calls evidence with the properties it needs *audit-grade*, and says plainly that the term is its own and denotes no certification.

## The system in one paragraph

NovaFabric works as a pipeline: **capture, seal, replay, diff, audit**. Capture wraps an agent run, without changes to the agent's code, and writes a [Run Capsule](/docs/architecture/run-capsule/): a portable directory over a fifteen-entity schema. A capsule can be sealed with a DSSE signature, optionally an RFC 3161 timestamp, an append-only Merkle log entry and a redaction attestation, and verified later without a server. Sealing is opt-in. A [replay protocol](/docs/architecture/replay-modes/) gives each mode its own stated guarantee, and only mocked replay actually re-executes anything. A PROV-aligned provenance graph links capsules across runs, and an Evidence Bundle packages one for a third party to verify with standard tools. The paper says outright that the bundle path is specified and has not yet been exercised by an independent verifier.

The contribution is integration, not new cryptography. OpenTelemetry, DSSE and in-toto, and W3C PROV are composed into one deployable substrate at the granularity of an agent session. The two mechanisms the paper believes are new are the replayable whole-session capsule and a redaction attestation for agent records.

## What is in the paper

| Part | What it covers |
|---|---|
| Introduction | Why agent runs are hard to prove: they span model weights, prompts, tools, context and environment, and no single layer exonerates the others |
| Related work | Agent tracing and observability, how "replay" is used elsewhere, provenance and lineage, tamper-evident logging and supply-chain attestation, ML reproducibility and AI governance, and the gap none of them closes |
| Architecture | The capsule schema, sealing and its trust model, the replay protocol, the evidence graph, the Evidence Bundle, and the design invariants |
| Evaluation | Eight research questions, each reported at the scope it was measured |
| Discussion | What the guarantee means and does not mean, a proposed maturity model, limitations |

## The eight research questions

The evaluation asks one question per mechanism, and reports each at the scope where it was measured rather than as a headline number.

1. **Replay.** Does mocked replay serve every model response from the capsule?
2. **Sealing.** Are tampered capsules detected?
3. **Capture.** Does capture record the observable event surface, and what does it cost?
4. **Lineage linkage.** Does the parent/child model link a distributed run correctly?
5. **Lineage at scale.** How fast are provenance queries over graphs of 10 million and 100 million edges?
6. **Diff.** Can structural diff localise an injected behavioural change?
7. **Redaction.** Does redaction find and remove planted credentials without destroying look-alike decoys?
8. **Evidence plane at fleet scale.** What throughput and tail latency does capsule ingest reach across a 314-machine, ten-region deployment?

## What the paper does not claim

The scope paragraphs are a large part of the paper:

- **Observable behaviour only.** It records what crosses the boundary between agent and system: model calls, tool calls, file, network and approval effects. It does not capture the model's internal reasoning.
- **Detection, not prevention.** Verification is relative to a stated trusted computing base. A holder of the signing key can sign a false capsule, and no downstream check detects it.
- **No compliance guarantee.** The system produces evidence that may support a compliance determination. The determination stays with qualified people.
- **Narrow scale.** Of the cluster-scale pipeline, only the capsule-ingest tier is measured.
- **Experimental implementation.** The maturity of each component is labelled in the paper.

The paper also reports the defects its own evaluation found in NovaFabric and in the evaluation corpus, each with a status, including one that invalidated a measurement the author then withdrew.

It closes with a proposal rather than a result: **NOVA-EL**, a four-level maturity model for execution evidence, from a structured capsule at L1 to a sealed, logged and offline-verifiable one at L4. The paper presents it as a design contribution to refine with the community, not as an adopted standard.

## Read it, cite it

- Paper: [arxiv.org/abs/2609.12582](https://arxiv.org/abs/2609.12582)
- Cite: [doi:10.48550/arXiv.2609.12582](https://doi.org/10.48550/arXiv.2609.12582)
- Software archive: [doi:10.5281/zenodo.22997388](https://doi.org/10.5281/zenodo.22997388)
- Source and issues: [github.com/MSKazemi/novafabric](https://github.com/MSKazemi/novafabric)
- The wider research agenda: [novafabric.ai/research](/research/)

*Added to this blog on 28 October 2026. The date above is the paper's arXiv posting date, 11 September 2026.*
