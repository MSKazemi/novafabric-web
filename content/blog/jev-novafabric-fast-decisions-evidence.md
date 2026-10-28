---
title: "Jev + NovaFabric: Fast Decisions, Evidence That Lasts"
date: 2026-10-27
category: technical
tags: [jev, typesafe-ai, ai-agents, decision-provenance, audit]
excerpt: "An exploration, not an integration: could Jev's fast, typed judgments leave evidence you can inspect and check months later?"
image: /blog/jev-novafabric/hero.webp
imageAlt: "Dark illustration of a request flowing through a decision point into a glass Run Capsule, then an optional seal and a later review on a screen, labelled as a conceptual exploration and not a shipped integration."
imageCaption: "Conceptual illustration of the proposed flow, from an agent request to evidence reviewed later. An exploration, not a shipped integration. Sealing is opt-in, and replay covers supported surfaces."
ogImage: /blog/jev-novafabric/og.jpg
---

<aside class="callout" role="note">
<p><strong>Status: exploration.</strong> This article describes an architectural idea. It is not a shipped Jev integration, a benchmark result, a working prototype or a partnership with TypeSafe AI, and TypeSafe AI has not endorsed it. The Decision Witness is a proposal.</p>
</aside>

Imagine an AI agent working through an overnight data-processing job. At 02:17, it attempts to send a report to an unfamiliar external endpoint. The request succeeds. The workflow continues. The dashboard stays green.

Six weeks later, an investigator asks: **What did the agent know when it made that choice? Which rule applied? Was a person supposed to approve it? And can we inspect the same evidence now?**

The response code is not an answer.

This is a hypothetical example, but it captures a real design problem. AI agents increasingly make small decisions in rapid succession. Those decisions can have consequences long after their execution traces have disappeared.

> **An AI decision can take a moment. Its evidence may need to last for years.**

This is why we are exploring an interesting pairing: [Jev, the System One model from TypeSafe AI](https://typesafe.ai/blog/introducing-system-one-models-and-jev), and [NovaFabric](https://github.com/MSKazemi/novafabric), open-source replay and evidence infrastructure for AI agents.

## One system makes judgments. The other preserves evidence.

Most language models are optimized to generate text. That is useful for writing, coding, research, and planning. But many decisions inside software have a different shape: Is this action unusual? Which queue should receive this request? How strongly does this result satisfy a rubric?

Jev is designed for that narrower interface. You provide a state and typed questions; it returns structured answers rather than prose. Its documented primitives include **Choice** (select an option from a list), **Score** (rate the state on a rubric) and **Noul** (the probability that a statement is true). Several questions can go in one request and are evaluated in parallel and in isolation against the same state. See [TypeSafe's documentation](https://docs.typesafe.ai/introduction) for the exact contracts. TypeSafe describes Jev as available in early access.

That is potentially useful at an agent's decision boundaries: before a tool is invoked, when an answer is evaluated, or when one agent delegates work to another.

NovaFabric solves a different problem. Its [Run Capsule](/docs/concepts/) records the execution evidence capture can observe: supported model and tool calls, traces, environment information, and other run artifacts. A capsule is portable. You can inspect it, compare it with another run, use supported replay modes, and optionally seal it so later changes become detectable.

The distinction is important:

- **Jev could contribute a probabilistic assessment of an event.**
- **Policy code and human approval could determine what action is permitted.**
- **NovaFabric could retain what was assessed, what was decided, and what actually happened.**

A well-formed model output is not automatically a correct judgment. A valid cryptographic seal does not establish that an original record was true or complete. Keeping those boundaries explicit is the foundation of the design.

## Meet the Decision Witness

Our working idea is a **Decision Witness**: a small, versioned evidence record attached to a specific decision point in an agent run.

Instead of keeping only the final answer — "allow," "deny," or "review" — the record would preserve enough context to examine the decision later:

1. **The observed event:** the tool request, model call, or delegation under review.
2. **The assessment:** the question template, model identity, typed answer, probabilities, and relevant input digest.
3. **The rule:** the policy version and the actual authorization outcome.
4. **The oversight:** whether human approval was required, requested, or obtained.
5. **The link to evidence:** a reference to the Run Capsule or a separately signed follow-up attestation.

For example, a proposed record might look like this:

~~~json
{
  "schema_version": "decision-witness/0.1",
  "origin": "observed",
  "event_ref": "tool-call-42",
  "assessment": {
    "provider": "typesafe",
    "model": "pinned-jev-version",
    "question": "unexpected_external_transfer",
    "type": "noul",
    "noul": 0.91
  },
  "policy": {
    "id": "egress-policy-v3",
    "outcome": "review"
  },
  "human_approval": "pending",
  "evidence_ref": "sha256:..."
}
~~~

*Illustrative only. This is a proposed NovaFabric evidence shape, not an implemented schema, a real Jev response, or a measured risk score.*

The number alone proves nothing. The value is in being able to ask more precise questions later: Which model produced this probability? What did it evaluate? Which policy handled the result? Was that policy overridden? Did the requested action execute?

Crucially, we would distinguish **observed** decisions from **derived** assessments made after a run and **counterfactual** decisions produced in a simulation. A later assessment must never be presented as something the original agent knew at the time.

| Origin | When it is made | How it would be recorded | Presentable as what the agent knew? |
|---|---|---|---|
| **Observed** | At decision time, inside the run | With the run's evidence, before optional sealing | Yes, as recorded |
| **Derived** | After the run, over recorded evidence | As a separate, linked, signed attestation; never an edit to a sealed capsule | No. It is a later interpretation |
| **Counterfactual** | In a simulation with edited inputs or criteria | As a labelled simulation record | No. Never as an observed fact |

## A concrete example: the unfamiliar upload

Return to the agent that attempted an external upload. Figure 1 shows the proposed flow, and what is already part of NovaFabric versus what is not.

<figure class="fig-stack">
<picture>
<source media="(max-width: 640px)" srcset="/blog/jev-novafabric/architecture-mobile.svg" width="360" height="996">
<img src="/blog/jev-novafabric/architecture.svg" alt="Flowchart of the proposed architecture. An agent event is minimized and redacted, then optionally assessed by Jev, which produces an advisory signal. Deterministic policy and human approval follow, then a Decision Witness record, then the Run Capsule evidence record, which feeds replay, diff and verify. The minimization step, the Jev provider, the advisory signal and the Decision Witness are proposed and not implemented. The Jev signal cannot grant permission that a hard rule denies." width="720" height="606" loading="lazy" decoding="async">
</picture>
<figcaption><strong>Figure 1.</strong> Conceptual architecture. Solid boxes exist in NovaFabric today, with varying maturity (human review is experimental, and replay covers supported surfaces). Dashed boxes are proposed and not implemented. Nothing here is a shipped Jev integration.</figcaption>
</figure>

A possible future workflow would be:

**01 / Observe.** NovaFabric captures the tool request on a supported integration surface.

**02 / Assess.** An optional Jev adapter receives a deliberately minimized, approved description of the pending action. It might ask whether the action appears inconsistent with the assigned task, or classify the type of risk involved.

**03 / Apply policy.** A deterministic policy engine checks hard constraints: the destination allowlist, data classification, identity, scope of authority, and approval requirements. A Jev probability cannot grant permission that a hard rule denies.

**04 / Record.** The assessment, policy result, and any human decision are linked to an evidence record. If created during capture, the record could be included before optional sealing; if produced later, it would need a separate signed attestation rather than changing an already sealed capsule.

**05 / Revisit.** Weeks later, an engineer or auditor can inspect the recorded choice without requiring the original hosted model to return the same answer again.

That last point matters. **Playback of a recorded decision is not proof that a model would make the same decision today.** A new model evaluation is a new event, and it deserves its own provenance.

## Three places this could be useful

**1. Agent security and unusual tool use**

An agent invokes a tool that is allowed in general but unusual for its present task. Traditional policy rules can check permissions. NovaFabric's existing experimental security/provenance graph can flag structural anomalies. Jev could add a narrowly scoped semantic judgment to help prioritize review.

The goal would be better triage, not an autonomous assertion that a threat occurred.

**2. Evaluation and regression testing**

An agent produces an answer that looks plausible but may not satisfy the user's request. NovaFabric already has a judging framework in its Python library, replay, and structural diff. A Jev-backed judge could score a specific criterion or assess whether a claim appears supported by provided evidence. Different judges could be compared against human-labeled outcomes.

A useful system should show disagreements, not hide them behind a single confidence badge.

**3. Multi-agent delegation**

As agents distribute work across services, clusters, and organizations, a handoff can cross several trust boundaries. Which agent delegated the task? What authority was carried forward? Was the next tool action inside that authority?

Here, a structured model could help flag an unusual handoff. NovaFabric's lineage and decision evidence could preserve the surrounding execution history. Deterministic identity and authorization checks would remain in charge.

## What exists today — and what does not

NovaFabric already provides portable Run Capsules, capture for supported clients, structural comparison, scoped replay, and optional cryptographic sealing and offline verification. It also contains policy evaluation (OPA/Rego), a judging framework, human-oversight records and an experimental anomaly-detection capability; several of these are marked experimental.

A **Jev decision adapter, Decision Witness format, and Jev-aware mocked replay are not currently shipped NovaFabric features.** Nor do we have a benchmark showing that Jev improves NovaFabric's latency, detection accuracy, or cost. Those questions require tests, not adjectives.

Our preferred first experiment is therefore modest: run Jev in **shadow mode** over carefully selected, redacted evidence from past runs; compare it with existing rules and judges; and measure precision, recall, calibration, latency, false alarms, and cost. No agent action would be changed by that experiment.

Only after those results would we consider an opt-in real-time decision path.

Jev's own documentation lists limits that shape that experiment. It answers the question you wrote rather than the one you meant, it leans toward the first option in a `Choice`, its accuracy falls as the state fills with unrelated content, and it does not treat state as hostile by default, so injected content can change an answer. Those are reasons for narrow questions, minimized state and hard checks in code. See [TypeSafe's list of known limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13).

Privacy is also non-negotiable. Jev is a hosted service, so sending a model state to it crosses a data boundary. A future adapter would need explicit enablement, data minimization, approval of outbound fields, and clear retention policies. NovaFabric's local-first and air-gapped operation must continue to work without it.

## The next question for agent infrastructure

A few years ago, the central question was whether a model could produce a useful answer. Today, we ask whether agents can call tools, coordinate tasks, and complete workflows.

The next question is what remains when those workflows are over.

Can we inspect the evidence an agent actually had? Compare one decision with another? Tell an observed action from a later interpretation? Verify that an archived record has not been altered since it was signed?

Those questions do not disappear when models become faster. If anything, they become harder to ignore.

Jev suggests an interesting way to make bounded judgments available inside software. NovaFabric is built around keeping agent executions as evidence you own. The potential intersection is not simply a faster guardrail. It is a **decision history that can be inspected, compared, replayed where supported, and verified within explicit limits**.

> **Intelligence makes a decision possible. Evidence makes that decision examinable.**

This is a direction we intend to investigate carefully, starting with recorded decisions and measurable experiments.

If you are building agents that make consequential tool calls, we would like to know: **which decision in your system would you most want to revisit six months from now?**

Explore [NovaFabric on GitHub](https://github.com/MSKazemi/novafabric), start with the [getting-started guide](/docs/getting-started/), or follow the tutorial on [checking a recorded run months later](/docs/tutorials/prove-a-run-to-an-auditor/). To read about Jev itself, see [TypeSafe's Jev introduction](https://typesafe.ai/blog/introducing-system-one-models-and-jev) and [API documentation](https://docs.typesafe.ai/introduction/quickstart).
