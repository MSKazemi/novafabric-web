---
title: "v0.31: knowledge graph, governance exports, WORM conformance"
date: 2026-05-20
category: release
tags: [release, KuzuDB, governance, WORM]
excerpt: v0.31 ships the KuzuDB-backed knowledge graph, EU AI Act / GDPR governance exports, and the nova-worm-conformance test suite for object storage compliance.
---

v0.31 is the largest release since the initial capsule format stabilised. Three major
features ship together: the knowledge graph backend, governance compliance exports, and a
standalone WORM conformance test suite.

### Capsule knowledge graph (KuzuDB)

All capsule relationships — asset versions, run lineage, model call chains — are now
queryable via a KuzuDB-backed graph. The dashboard includes graph visualisation and Cypher
query panels. A 10M-edge benchmark confirms the backend handles realistic production-scale
capsule histories.

### Governance and compliance exports

Risk classification and audit profiles are now available for EU AI Act, NIST AI RMF, GDPR,
SOC 2, and NIS2. These are **evidence exports for compliance workflows — not legal
guarantees.** Regulatory fit requires independent review by someone qualified to give it.
Cost reporting and per-run audit trails ship alongside them.

### nova-worm-conformance

A standalone Python package that verifies object storage backends (S3, MinIO, Ceph, Azure
Blob) meet WORM requirements for SEC 17a-4, MiFID II, CFTC 1.31, and FINRA 4370. Ten
mandatory test cases covering immutability, retention locks, legal holds, and lifecycle
exemptions.

```bash
$ pip install "git+https://github.com/MSKazemi/novafabric#subdirectory=packages/nova_worm_conformance"
$ nova-worm-conformance run --backend s3 --bucket my-capsule-store

  ✓ 10/10 conformance tests passed
  report: worm-report-2026-05-20.json
```

---

*Correction, 2026-08-08: this post originally gave the install command as
`pip install nova-worm-conformance`. That package was never published to PyPI, so the
command could not work for anyone who tried it. The code is real and lives in the main
repository under `packages/nova_worm_conformance`; the command above installs it from
there. Apologies to anyone who hit the error — if the package is published standalone
later, the short form will come back.*
