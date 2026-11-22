---
title: "Evidence an AI-agent audit can read: where NovaFabric fits next to AIUC-1, ISO/IEC 42001 and the EU AI Act"
date: 2026-11-21
category: technical
tags: [compliance, evidence, audit, eu-ai-act, capsules]
excerpt: What AIUC-1, ISO/IEC 42001 and the EU AI Act ask for in agent logs, and how NovaFabric's per-run records and bring-your-own control catalogs fit next to them.
---

Frameworks for AI systems are converging on one practical demand: **show what the system actually did.**
The EU AI Act requires high-risk AI systems to technically allow the automatic recording of events. ISO/IEC 42001 audits look for
documented information and monitoring records from an AI management system. AIUC-1, a standard written for
AI agents, asks for logs of AI system activity and of tool calls, and lists tamper-evident, independently
verifiable logs as supplemental evidence. None of the three prescribes a particular tool for producing that
record for an individual agent run.

That is the narrow job NovaFabric does. It is an open-source (Apache-2.0) recorder for AI-agent runs. It
does not certify anything, and it does not replace a framework, an auditor or a GRC platform. It produces
the per-run records those people ask to see.

> NovaFabric is not affiliated with, endorsed by, or certified by the publishers of these frameworks. A mapping shows which recorded evidence exists; it does not certify that a control is met.

---

## What the frameworks ask for, in short

**EU AI Act (Regulation (EU) 2024/1689).** Article 12(1): *"High-risk AI systems shall technically allow for
the automatic recording of events (logs) over the lifetime of the system."* Article 19(1) asks providers, and
Article 26(6) asks deployers, to keep those automatically generated logs, to the extent the logs are under
their control, for a period appropriate to the system's intended purpose and of at least six months, unless
other Union or national law says otherwise. Under Article 113, as amended by Regulation (EU) 2026/1744, these
high-risk obligations apply from 2 December 2027 for Annex III systems and from 2 August 2028 for Annex I systems.
Logging is also the subject of a draft harmonised standard, CEN-CENELEC's prEN 18229-3, *Artificial Intelligence –
AI system requirements – Part 3: Logging*, listed as under approval in November 2026. Once a harmonised standard is
cited in the Official Journal, conforming to it gives a presumption of conformity with the requirements it covers
(Article 40(1)).

**ISO/IEC 42001:2023** is a management-system standard for organisations that develop, provide or use AI
systems. ISO itself does not certify anyone; external certification bodies do. The standard is
copyrighted, so we do not reproduce it here; in our own words, an auditor will look for the information the
management system keeps and for evidence that operation is monitored.

**AIUC-1** is a standard for AI agents published by the Artificial Intelligence Underwriting Company (AIUC),
with certification audits run by accredited third-party auditors. Its text is also proprietary. Two of its
requirements are directly about records of an agent's behaviour: **E015** (in our words: keep logs of what the
AI system does) and **D003** (in our words: keep the agent from making tool calls it should not, with a record
of the calls it did make among the evidence). Under E015, logs that are tamper-evident and independently
verifiable are listed as *supplemental* evidence rather than core evidence: they strengthen an audit, but not
every audit requires them. D003 does not ask for it.

The frameworks differ in scope and in who audits them. What they share is the need for an honest record of
each run.

---

## What NovaFabric records today

- **A Run Capsule per run.** `nova capture -- <your command>` wraps an agent run and writes a directory of
  plain files: the model calls made through supported Python SDKs (`model-calls.jsonl`) and, when tools are
  called through MCP or a supported framework adapter, the tool calls (`tool-calls.jsonl`).
- **A seal, if you turn it on (experimental).** Sealing is opt-in: with a signing key configured, the capsule
  is sealed at the end of capture, and `nova verify` checks the seal against the files later. A change to a
  sealed file makes the check fail.
- **A portable Evidence Bundle (works today).** `nova export-evidence` packs a capsule into a signed ZIP that a third party
  can check with standard tools (SHA-256 and an Ed25519 signature), without installing NovaFabric or reaching
  your infrastructure.

With a local signing key, none of this needs a NovaFabric server or a network connection (your agent's own
model calls are another matter).

---

## Mapping those records to your framework

Because ISO/IEC 42001, the AICPA criteria behind SOC 2 and AIUC-1 are copyrighted, **you bring the catalog**: a small YAML file with the control IDs from your licensed copy
and a description of each control in your own words. NovaFabric checks each capsule against it.

```yaml
id: my-catalog
name: My control catalog
framework: (the framework you hold a licence for)
version: "1"
controls:
  - id: <control ID from your licensed copy>
    title: Agent activity is logged          # your words, not the publisher's
    description: Each run keeps a record of its model calls.
    evidence_requirements:
      - evidence_type: model_calls
        description: model-calls.jsonl is present and non-empty
```

```bash
nova audit map --profile ./my-catalog.yaml --capsule <capsule-id>
```

The report lists each control as covered, partial, missing or not captured by this version. On NovaFabric's main
branch, which becomes the next release, the command also exits 1 when any control is missing, so it can gate a CI
job, and a misspelt evidence type, or a control with nothing to check, is refused when the file loads.

The full walkthrough, with a fictional framework you can run end to end, is in the tutorial
[Map NovaFabric evidence to your own control framework](https://novafabric.ai/docs/tutorials/map-evidence-to-your-control-framework/).

---

## What this does not do

- **It does not decide that a control is met.** It shows which records exist for a run. Whether they satisfy a
  control is a judgement for you and your auditor.
- **It only sees what was captured.** Controls about people, processes and policy documents have no capsule
  evidence, and belong outside the catalog.
- **Presence is not completeness.** A `model_calls` requirement is met by one recorded call; it does not prove
  that every call was recorded.
- **Some evidence is not captured yet.** Tool-permission decisions are not recorded by `nova capture` today, so
  controls that need them are reported as not captured by this version, rather than as met or as missing.
- **Capsules store prompts and responses by default.** If your controls restrict where that content may live,
  plan for it before you capture production runs.

---

## Try it

```bash
pip install "novafabric @ git+https://github.com/MSKazemi/novafabric@main"
```

The catalog checks above are on the main branch and ship in the next release; after that, `pip install novafabric`
is enough. Then follow the tutorial linked above. NovaFabric is open source under Apache-2.0:
[github.com/MSKazemi/novafabric](https://github.com/MSKazemi/novafabric).

*AIUC-1, ISO/IEC 42001, SOC 2 and the EU AI Act are referred to only to describe what they cover. All
trademarks belong to their owners.*
