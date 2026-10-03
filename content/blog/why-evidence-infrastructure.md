---
title: Why AI agents need evidence infrastructure
date: 2026-04-15
category: lab-update
tags: [capsules, reproducibility, audit]
excerpt: AI agents are making consequential decisions autonomously. When something goes wrong, you need to know exactly what happened — and prove it. That is the problem NovaFabric is built to solve.
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
self-contained directory that records everything about a single agent run: every model
call, every tool invocation, every environment variable, every input and output. It is
portable, open, and human-readable.

- Captured at runtime via SDK patching — no code changes required
- Signed with DSSE + RFC 3161 timestamps for tamper-evident audit
- Replayable: re-run any capsule with mocked LLM responses
- Diffable: compare two capsules to understand what changed between runs

The goal is not to make AI agents deterministic — that is not possible. The goal is to
make their behavior inspectable, comparable, and verifiable after the fact. Evidence
infrastructure for a world where agents act autonomously.
