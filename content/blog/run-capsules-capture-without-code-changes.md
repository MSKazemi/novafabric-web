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
code runs. Requests made through the supported clients are intercepted, recorded, and
written to the capsule directory; other clients can be captured through `nova api-proxy`.

```bash
$ nova capture python agent.py

  capsule   ─ 01HXAY7M5JZ8R7K4P9DPBYK2WX
  trace.jsonl          ✓   324 spans
  model-calls.jsonl    ✓   8 LLM calls
  tool-calls.jsonl     ✓   12 tool invocations
  env.lock             ✓   environment snapshot
  redaction-proof.json ✓   secret-scan record
  seal                 –   (only when a signing key is configured)
```

### What gets captured

- The model calls capture can see: prompt, response, token counts, latency, model version
- Tool invocations: name, input, output, duration
- OpenTelemetry spans via the GenAI semantic conventions
- Environment snapshot, secret-scanned, with a record that the scan ran
- Process metadata: Python version, installed packages, working directory

One clarification worth making, because it matters for privacy: **by default, a capsule
stores the request messages and the response text of each captured model call, in
`model-calls.jsonl` on your machine.** That is what lets replay serve the recorded
responses back. Prompts routinely contain personal or confidential data, so treat a
capsule as sensitive: keep it where you would keep the prompts themselves. Built-in
secret scanning looks for known key and token patterns; it does not remove personal data.

The resulting capsule is a plain directory of JSON and JSONL files. No proprietary format,
no vendor lock-in. A capsule written today will be readable by any text editor in a
decade.

---

*Updated 2026-08-08: the example output originally showed `env.json` and a truncated
hex-style capsule id. Capsules are ULID-named and the environment snapshot is `env.lock`;
the sample now matches what `nova capture` actually writes. A correction on 2026-10-08: an earlier version of this post said full prompt and response
capture is opt-in. It is not — the default capsule stores them (see above) — and the
"secrets redacted" wording is now "secret-scanned". Updated 2026-10-09: capture is scoped to
the supported clients, and the sample no longer shows a seal check mark on a default capture.*
