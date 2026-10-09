---
title: Why AI agents need evidence infrastructure
date: 2026-04-15
category: lab-update
tags: [capsules, reproducibility, audit]
excerpt: When an AI agent run goes wrong you need to know what happened, and to keep the evidence. That is the problem NovaFabric is built to solve.
---

Reproducibility is a solved problem in traditional software. You commit code, pin
dependencies, run the same inputs, get the same outputs. With AI agents, none of that
holds. Model weights change, API behavior drifts, tool calls are non-deterministic. A run
that worked on Tuesday may fail on Wednesday with no explanation.

This matters more as agents take on more consequential work: running scientific
benchmarks, making financial decisions, operating in regulated environments. At that
point, "it worked on my machine" is not an acceptable answer.

### The capsule abstraction

NovaFabric introduces the run capsule as the atomic unit of evidence. A capsule is a
self-contained directory that records a single agent run: the model calls and tool
invocations capture can see, the environment, the inputs and the outputs. It is
portable, open, and human-readable.

- Captured at runtime by patching supported Python clients — no code changes required
- Sealable with DSSE signatures (RFC 3161 timestamps optional) for tamper-evident audit
- Replayable: re-run a capsule against the recorded responses of supported OpenAI and Anthropic calls (tool calls run live)
- Diffable: compare two capsules to understand what changed between runs

The goal is not to make AI agents deterministic — that is not possible. The goal is to
make their behavior inspectable, comparable, and verifiable after the fact. Evidence
infrastructure for a world where agents act autonomously.

*Updated 2026-10-08: the excerpt, the capture scope, sealing (opt-in) and the replay description were corrected to match the current product. Updated 2026-10-09: capture and mocked replay are scoped to the supported clients.*
