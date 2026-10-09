---
title: Find where two AI agent runs diverged
date: 2026-10-09
category: technical
tags: [replay, diff, debugging, capsules]
excerpt: Capture two runs of the same agent, pair their model calls with nova diff, read which reply changed, and fail CI on any structural change.
---

Your agent gave one answer yesterday and a different one today. Same code, same input
file, a different decision. Before you can fix anything you need to know where the two
runs parted ways. Did the prompt change, did the model reply change, or did something
after the model call change?

This tutorial is for engineers who run agents in Python and want to answer that from
two recorded runs instead of from memory. You will capture two runs as
[Run Capsules](/docs/architecture/run-capsule/), compare them with `nova diff`, read
which model call changed, and turn the same comparison into a CI gate. Every command
and output below was captured from the released `novafabric 0.104.0`. Long paths and
skipped lines are marked with `…`.

### What you need

- Python 3.12 or newer (the package declares `Requires-Python: >=3.12`)
- `pip install novafabric openai`
- The `examples/blackbox_demo/` directory from the public
  [MSKazemi/novafabric](https://github.com/MSKazemi/novafabric) repository, copied into an
  empty working directory. Run every command from that working directory.

No API key and no hosted model are involved. The example ships a small
OpenAI-compatible mock server on `127.0.0.1:9099`.

```text
$ nova --version
novafabric 0.104.0
```

### The scenario

`agent.py` reads a payment-service config, asks a model for one recommended change, and
writes the answer to `outputs/decision.json`. The mock server answers in one of two
ways, chosen by a request header the agent sends: a risky answer (disable rate limiting)
or a safe one (reduce `max_connections`). That gives you two runs whose behaviour
differs for a known reason, so you can check that the diff points at the right place.

### Step 1: start the mock model

```sh
python blackbox_demo/mock_llm_server.py &
export OPENAI_API_KEY=sk-demo-no-key-needed
export OPENAI_BASE_URL=http://127.0.0.1:9099
export NOVAFABRIC_SUGGEST=0
```

```text
mock_llm: listening on http://127.0.0.1:9099
```

### Step 2: capture the first run

`nova capture` wraps the command with no code changes. Model calls from Python workloads
are recorded automatically.

```text
$ nova capture -- python blackbox_demo/agent.py --mode bad
✓ Capsule written: 
…/.novafabric/capsules/01M4FBTQ7FVQEZBWQGFD2RVTW2  
(run_id=01M4FBTQ7FVQEZBWQGFD2RVTW2)

$ cat outputs/decision.json
{
  "mode": "bad",
  "action": "disable_rate_limiting",
  "reason": "Disabling rate limiting increases throughput for high-volume transactions.",
  "value": false
}
```

Keep the capsule path in a variable (your run IDs will differ):

```sh
BAD=$HOME/.novafabric/capsules/01M4FBTQ7FVQEZBWQGFD2RVTW2
```

### Step 3: capture the second run

```text
$ nova capture -- python blackbox_demo/agent.py --mode fixed
✓ Capsule written: 
…/.novafabric/capsules/01M4FBVEZDG7XVBYJBB9WD6Q8D  
(run_id=01M4FBVEZDG7XVBYJBB9WD6Q8D)

$ FIXED=$HOME/.novafabric/capsules/01M4FBVEZDG7XVBYJBB9WD6Q8D
$ cat outputs/decision.json
{
  "mode": "fixed",
  "action": "reduce_max_connections",
  "reason": "Reducing max_connections from 1000 to 500 prevents connection exhaustion under burst load.",
  "value": 500
}
```

### Step 4: diff the two runs

```text
$ nova diff "$BAD" "$FIXED"
Diff: 01M4FBTQ7FVQEZBWQGFD2RVTW2 → 01M4FBVEZDG7XVBYJBB9WD6Q8D
  changed=3  added=0  removed=0

Model calls:
  ~ call at span 5fef2505ba0bd78e
Outputs:
  ~ outputs/decision.json
  ~ outputs/stdout.txt
```

Three items changed (`~`): one model call and two output files. Nothing was added
or removed.

To see *what* about that call changed, ask for the machine-readable record:

```text
$ nova diff "$BAD" "$FIXED" --output-format json
{
  …
  "sections": {
    "environment": {
      "changes": []
    },
    "model_calls": {
      "aligned": 1,
      "changed": 1,
      "added": 0,
      "removed": 0,
      "pairs": [
        {
          "changed": true,
          "span_id": "5fef2505ba0bd78e",
          "model_call_id_a": "01M4FBTTHMQK2NQY8QW24K3RVA",
          "model_call_id_b": "01M4FBVHHVJ684V5DBXMZZR1GZ",
          "request_changed": false,
          "response_changed": true
        }
      ]
    },
  …
```

### How to read it

- **`aligned: 1`**: the diff paired the one model call in each run. The two captures are
  separate processes with different span IDs, and the pair is labelled with the first
  run's span.
- **`request_changed: false`, `response_changed: true`**: the agent sent the same request
  both times and got a different reply. The runs diverged at the model's answer, not in
  your prompt-building code.
- **`environment.changes: []`**: no recorded environment difference to chase.
- **`outputs`**: both files changed downstream of that reply. The outputs section lists
  them with before and after SHA-256 hashes, not a content diff.

The capsule stores the request messages and response text on your machine, so you can
read the two replies directly:

```text
$ for c in "$BAD" "$FIXED"; do python3 -c "import json,sys; r=json.loads(open(sys.argv[1]).readline()); print(r[\"parent_span_id\"], r[\"gen_ai.response.choices\"][0][\"message\"][\"content\"])" "$c/model-calls.jsonl"; done
5fef2505ba0bd78e {"action": "disable_rate_limiting", "reason": "Disabling rate limiting increases throughput for high-volume transactions.", "value": false}
6657ccce3dc4b000 {"action": "reduce_max_connections", "reason": "Reducing max_connections from 1000 to 500 prevents connection exhaustion under burst load.", "value": 500}
```

In this demo the mock picks its answer from a header, which is why the messages match.
A model or provider change that alters a reply while your code and inputs stay the same
would produce the same shape: request unchanged, response changed.

### Step 5: use it as a CI gate

`--assert-no-regressions` makes `nova diff` exit 1 when it finds **any** structural
change between the two runs, including added or removed calls:

```text
$ nova diff "$BAD" "$FIXED" --assert-no-regressions; echo exit=$?
Diff: 01M4FBTQ7FVQEZBWQGFD2RVTW2 → 01M4FBVEZDG7XVBYJBB9WD6Q8D
  changed=3  added=0  removed=0
…
exit=1

$ nova diff "$BAD" "$BAD" --assert-no-regressions; echo exit=$?
Diff: 01M4FBTQ7FVQEZBWQGFD2RVTW2 → 01M4FBTQ7FVQEZBWQGFD2RVTW2
  changed=0  added=0  removed=0

No differences found.
exit=0
```

On GitHub Actions, `--output-format github-annotation` prints one annotation per change:

```text
$ nova diff "$BAD" "$FIXED" --output-format github-annotation
::error title=NovaFabric Diff::Model call changed at span 5fef2505ba0bd78e
::error title=NovaFabric Diff::Output changed: outputs/decision.json
::error title=NovaFabric Diff::Output changed: outputs/stdout.txt
```

Read the gate for what it is: it answers "did anything change?", not "did it get
worse?". A safer answer fails it just as a riskier one does, as it did here.

### Optional: replay the first run with no live model call

[Mocked replay](/docs/architecture/replay-modes/) re-runs the command and serves the
model replies recorded in the capsule. With the mock server stopped and `outputs/`
deleted:

```text
$ curl -s -m 2 http://127.0.0.1:9099/ || echo "mock server: not reachable"
mock server: not reachable

$ nova replay "$BAD" --mode mocked
✓ Replay written: 
…/.novafabric/replays/01M4FC015GVZXHG4PEWNM291FC  
(replay_id=01M4FC015GVZXHG4PEWNM291FC  mode=mocked)

$ cat outputs/decision.json
{
  "mode": "bad",
  "action": "disable_rate_limiting",
  …
}
```

The replay record reports `model_calls_mocked: 1` and `status: success`. The agent
itself ran live and wrote the file again; only the model reply came from the capsule.

### What this does not do

- **It does not judge the change.** The diff is structural: it tells you which call and
  which files differ, not whether the new behaviour is better.
- **Any difference counts.** Against a live model, two runs of the same prompt can return
  different text, and the gate fails on that too.
- **Mocked replay covers recorded synchronous OpenAI and Anthropic chat replies.** Tools
  still run live during replay.
- **Automatic model-call capture is for Python workloads.** Other clients go through
  `nova api-proxy`.
- **Sealing is opt-in** and was not used here. The capsule format is pre-1.0.

### Next

- [Replay modes](/docs/architecture/replay-modes/): all five modes and what each runs
- [`nova replay` and `nova diff` reference](/docs/cli-reference/replay-and-diff/)
- [What a Run Capsule contains](/docs/architecture/run-capsule/)
- [Install NovaFabric](/install/)
