---
title: Traces vs execution evidence for AI agents
date: 2026-10-08
category: technical
tags: [capsules, observability, provenance, audit]
excerpt: A trace is a view of a run; a Run Capsule is an artifact you keep. What traces leave behind, and what sealing a capsule does and does not establish.
---

When an AI agent run goes wrong a week later, the question is rarely "was the service
up?" It is "what exactly did that run see and do, and can I look at it again now that
the world has changed?" Logs and traces answer the first kind of question well. They
were not built to answer the second.

> **A trace is a view of a run. A Run Capsule is an artifact you keep.**

### What logs and traces are good at

Observability tools such as Langfuse and LangSmith, or any OpenTelemetry backend, show
you what is happening across many runs: latency, cost, error rates, a timeline of spans.
That is the right tool for watching a system in production. NovaFabric does not replace
it, and it can sit next to it. See the [comparison](/docs/comparison/) and the
[NovaFabric vs Langfuse tutorial](/docs/tutorials/novafabric-vs-langfuse/).

What a trace backend usually is, though, is a record in a store somebody else operates,
with its own retention window and its own schema. When the window passes, the vendor
changes, or the model behind the API is updated, the run is gone or no longer
interpretable.

### What a Run Capsule keeps instead

A [Run Capsule](/docs/architecture/run-capsule/) is a plain directory on your machine.
It holds the model calls (the request messages and the response text), the tool calls,
the execution spans, the inputs and outputs, an environment snapshot, a replay policy
and lineage edges, plus a manifest that records a SHA-256 digest of each evidence file. You can
copy it, archive it, attach it to a ticket, or hand it to someone else. It needs no
server and no account.

Capture wraps your command without code changes, and runs a built-in secret scanner
(14 key and token rules in v0.104.0) over the capsule's event streams, manifest, `env.lock`
and the files under `inputs/` and `outputs/`. The scanner matches known formats; it does not
find every possible secret (PEM private keys, JWTs, passwords and connection strings are
among [the formats it misses](/docs/architecture/run-capsule/)), so review a capsule before
sharing it.

### Replay is a different job from tracing

Because the capsule keeps the recorded model responses, a run can be replayed from it.
There are [five replay modes](/docs/architecture/replay-modes/); `intervention` is
experimental. In mocked replay, NovaFabric serves the recorded replies to synchronous,
non-streaming OpenAI chat completions and Anthropic messages calls (v0.104.0), so those
calls reach no live model. Tools still run live.
This is not deterministic replay of an arbitrary agent, and it is not an offline re-run
of one. The replay page states exactly what each mode reuses and what it does not.

### What sealing adds, and what it does not

A capsule can be [sealed](/docs/architecture/sealing-and-verification/) with your own key
(opt-in, through a `novaseal.yaml` file) and verified later without a server. A valid
seal establishes one thing: the recorded capsule is unchanged since the holder of that
key signed it. Who the signer is depends on a trust anchor, which is an experimental
feature today. A seal does not establish that the record is complete, because capture
sees what it is wired to see. It does not establish that the record is true, because a
key holder can sign a false capsule.

That is a narrower claim than "proof of what the agent did", and it is the one the
software can honestly support. If you need the longer walk-through, the tutorial
[Verify a sealed run for an auditor, months later, offline](/docs/tutorials/prove-a-run-to-an-auditor/)
runs it end to end.

### Which one do you need?

- Watching production behaviour across many runs: use your observability stack.
- Keeping one important run so you can reopen, replay, compare and verify it later: a
  Run Capsule.
- Both: they are complementary.

The capsule format is documented but pre-1.0, so expect additive changes until the
freeze. To try it, start with [Getting Started](/docs/getting-started/).

---

*Updated 2026-10-09: the secret scanner's coverage and the calls mocked replay serves now
name exactly what v0.104.0 does.*
