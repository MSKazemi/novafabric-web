---
title: "What the NovaFabric paper measured, and what it got wrong"
date: 2026-10-27
category: technical
tags: [arxiv, evaluation, replay, tamper-evidence, provenance]
excerpt: The NovaFabric arXiv paper's results at the scope each was measured, the defects its evaluation found, and where the posted v1 has since been corrected.
---

<aside class="callout" role="note">
<p><strong>Status: preprint results, corrected where noted.</strong> This post follows <a href="https://arxiv.org/abs/2609.12582">arXiv:2609.12582</a>, a preprint, and the maturity of the system it evaluates is experimental. The posted version (v1) differs from this post in the places listed under <a href="#where-this-post-differs-from-arxiv-v1">Where this post differs from arXiv v1</a>. A revised version is in preparation. For an overview of the paper, read <a href="/blog/novafabric-on-arxiv-what-the-paper-covers/">what the paper covers</a> first.</p>
</aside>

The paper asks eight research questions about NovaFabric and reports each at the scope it was measured. This post lists the results, then the defects the evaluation turned up, because the defects are the more useful half.

Agent-level results come from ten release-decision scenarios on one CPU-only host with a single local model (`qwen3:8b`), so treat them as properties of that setup, not of agents in general.

## The results

| Question | What was measured | Result, at its scope |
|---|---|---|
| **RQ1 Replay** | Does mocked replay serve model responses from the capsule? | No live model call observed in 10 of 10 scenarios. No tool-using workload completed cleanly: 2 of 10 exited within 300 s, both non-zero, and 8 timed out. Tool responses were not substituted in the evaluated build |
| **RQ2 Sealing** | Are tampered capsules detected? | The trust-layer test suite rejected all 3 mutation classes tested. End to end through the shipped verifier, v0.101.0 rejected 3 of 8 capsule mutations and v0.106.1 rejects all 8 |
| **RQ3 Capture** | Does capture record the event surface, and at what cost? | Every model call (130) and every completed MCP tool call (430 of 430; 430 of 470 attempted) was recorded. Completeness against each scenario's declared evidence streams was 0.652 (95% CI ±0.064, ten scenarios). Median wall-clock overhead was +1.9% on this host |
| **RQ4 Linkage** | Does parent/child linkage work for distributed runs? | The linkage algorithm is unit-verified (31 of 31). End-to-end linkage through the capsule path was not recorded, and the paper says so |
| **RQ5 Lineage at scale** | How fast are blast-radius queries? | Depth-5 query, p99 45.5 ms over 10M provenance edges, 3.3 times faster than a columnar baseline on the same graph. 167.9 ms p99 over 100M edges (single client, 30 queries) |
| **RQ6 Diff** | Can structural diff localise an injected change? | 140 of 140 injected mutations localised (recall and precision 1.00, Wilson 95% CI lower bound 0.973), on a controlled corpus with one mutation per pair |
| **RQ7 Redaction** | Are planted credentials removed, and are decoys kept? | After a rule-pack repair, 14 of 14 planted credential types redacted and 9 of 9 decoys preserved, on a synthetic corpus |
| **RQ8 Fleet ingest** | What does capsule ingest do at 314 machines across ten regions? | Lossless (41,774 of 41,774 uploads stored) but capped at 61.6 req/s across a 9 times load span, with a 26.8 s p99 |

Two of those rows need a second look.

**The ingest ceiling is a worker-pool property.** Little's Law, a concurrency-1 control and a worker-count intervention attribute the cap to per-worker serialisation, not saturation. It bounds how fast capsules can arrive. It says nothing about the cost of capture or sealing.

**Overhead as a percentage is the wrong unit on this host.** Wall-clock time is dominated by model inference, and run-to-run variance there is larger than the effect (median +1.9%, mean +9.9%, 95% CI −2.7% to +22.5%). The paper reports the figure but does not rest anything on it. Companion measurement work on hosts where the cost is separable finds a fixed per-process cost, not a percentage of the workload.

## Three defects the evaluation found

The paper tabulates six defects across NovaFabric and its own evaluation corpus, with the status of each: four fixed, one that invalidated a measurement the author withdrew, and one open. Three of them carry the argument.

**Evidence that was silently not recorded.** Three whole evidence streams went unrecorded while capture appeared to succeed. It surfaced only because the evaluation measured completeness against the declared schema instead of asking whether the run finished. That defect is fixed. The 0.652 above is what remains: event categories the system does not yet capture.

**A redaction result that proved nothing.** An earlier draft reported perfect redaction recall. Rechecking against the scenario's own ground truth showed the two scenarios it cited plant no secret at all, and the one that does plants a token outside the scanner's detection surface. The figure was vacuous and the case that was exercised had failed in every run. The paper withdraws it and re-measures on a rebuilt corpus. That re-measurement exposed a second problem: three rules matched a bare token by length alone and destroyed 3 of the 9 decoys on every run (precision 0.824). Rule pack 0.5.0 destroys none.

**A server that reported success it had not achieved.** During the fleet run, the evidence server started against a database with no tables because a migration had failed. It logged one warning, kept running, and answered 41,774 uploads with HTTP 201 while writing no metadata. No capsule was lost: every one was stored and verifies. But the system's own account of what it had done was false for a whole plane. The fix is in the main branch and was unreleased when the paper was written.

The lesson the paper draws is that "it looks fine" is not a correctness criterion for an evidence system, or for its evaluation. A declared schema with a completeness metric, and a re-derivable ground truth for every planted artifact, turn silent omission into something you can test.

## What these results do not show

- **They do not show that agents behave correctly.** Agent correctness is out of scope.
- **They do not show complete capture.** Completeness is 0.652, bounded by categories not yet captured.
- **They do not show deterministic replay.** Mocked replay is offline with respect to models, not the network, and the evaluated build did not substitute tool responses. Since v0.105.0 recorded tool results are served on some supported surfaces (experimental), but RQ1 has not been re-measured on those releases.
- **They do not show independent verification of Evidence Bundles.** That path is specified, and no independent verifier has exercised it.
- **They do not show that a seal establishes truth.** A seal establishes that the capsule is unchanged since the key's holder signed it. A key custodian can sign a false capsule.
- **They do not generalise across models, hardware or workloads.** One model family, one workload pattern, mixed hardware tiers that the paper never mixes within a table.

## Where this post differs from arXiv v1

The posted v1 was checked against the code and the experiment records after it went out, and some statements did not hold. Where they differ, this post uses the corrected figure:

| Topic | arXiv v1 | This post |
|---|---|---|
| Replay completion | 2 of 10 workloads completed | No clean completion: 2 of 10 exited within 300 s, both non-zero |
| Tamper detection | 100% across 3 classes | 100% in the trust-layer suite; 3 of 8 end to end on v0.101.0, 8 of 8 on v0.106.1 |
| Capture overhead | median −1.8%, mean +3.2% | median +1.9%, mean +9.9%. v1 timed the captured arm from the capsule's own duration, which leaves out start-up and sealing |
| MCP capture | 100% of 430 | 430 of 430 completed, 430 of 470 attempted |
| Replay modes | A four-mode description | Five modes, and only mocked replay re-executes |
| Ingest service time | Three independent measurements, 130 ms | Two measurements; about 130 ms is implied by the 61.6 req/s ceiling, not measured |

The v1 description of the replay modes, signing keys and bundle verification also contained mechanism errors, which the revision corrects. They are recorded in the paper's change log.

## Read more

- The paper: [arxiv.org/abs/2609.12582](https://arxiv.org/abs/2609.12582) · cite as [doi:10.48550/arXiv.2609.12582](https://doi.org/10.48550/arXiv.2609.12582)
- What each replay mode does and does not reuse: [replay modes](/docs/architecture/replay-modes/)
- What a valid seal establishes, and what it does not: [sealing and verification](/docs/architecture/sealing-and-verification/)
- Other research threads: [novafabric.ai/research](/research/)
