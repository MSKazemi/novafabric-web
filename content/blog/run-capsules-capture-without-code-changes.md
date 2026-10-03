---
title: "Run capsules: capture without code changes"
date: 2026-05-01
category: technical
tags: [capsules, python, SDK, capture]
excerpt: The NovaFabric Python SDK patches LLM API call sites and HTTP transports at import time. Here is how it works and what gets captured.
---

One of the hardest constraints in building NovaFabric was the requirement to capture
AI-agent executions without requiring developers to change their code. Adding decorators
or wrapping every LLM call manually is friction that prevents adoption. Instead, the SDK
intercepts at the transport layer.

### How capture works

When you run a Python process with NovaFabric, the SDK patches the HTTP clients used by
popular AI frameworks (OpenAI, Anthropic, LangChain, LlamaIndex) before any application
code runs. Every outgoing request to a model provider is intercepted, recorded, and
written to the capsule directory.

```bash
$ nova capture python agent.py

  capsule   ─ 01HXAY7M5JZ8R7K4P9DPBYK2WX
  trace.jsonl          ✓   324 spans
  model-calls.jsonl    ✓   8 LLM calls
  tool-calls.jsonl     ✓   12 tool invocations
  env.lock             ✓   environment snapshot
  redaction-proof.json ✓   secret scan proof
  dsse signature       ✓
```

### What gets captured

- Every model call: prompt, response, token counts, latency, model version
- Tool invocations: name, input, output, duration
- OpenTelemetry spans via the GenAI semantic conventions
- Environment snapshot, with secrets redacted and a proof that redaction ran
- Process metadata: Python version, installed packages, working directory

One clarification worth making, because it surprises people who expect a tracing tool:
**full prompt and response capture is opt-in, not the default.** Prompts routinely contain
personal or confidential data, and the safe default is not to collect them. The capsule
records that a call happened, to which model, with what token counts and latency,
regardless.

The resulting capsule is a plain directory of JSON and JSONL files. No proprietary format,
no vendor lock-in. A capsule written today will be readable by any text editor in a
decade.

---

*Updated 2026-08-08: the example output originally showed `env.json` and a truncated
hex-style capsule id. Capsules are ULID-named and the environment snapshot is `env.lock`;
the sample now matches what `nova capture` actually writes. The opt-in note on prompt
capture was added for the same reason.*
