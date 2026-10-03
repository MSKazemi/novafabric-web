import type { CapsuleEntry } from "../types";

export const CAPSULES: CapsuleEntry[] = [
  {
    project: "novafabric eval suite",
    useCase:
      "Capturing the novafabric test pipeline itself — every pytest run produces a signed capsule with model calls, tool exchanges, and a redaction proof.",
    snippet: [
      "$ nova capture python -m pytest tests/integration/",
      "",
      "  capsule   ─ e5a7c013",
      "  trace.jsonl        ✓   1,203 spans",
      "  model-calls.jsonl  ✓   6 LLM calls",
      "  dsse signature     ✓",
    ],
    repo: "https://github.com/MSKazemi/novafabric",
    tags: ["pytest", "integration", "self-hosted"],
  },
  {
    project: "agent experiment · lineage at scale",
    useCase:
      "A research agent that queries KuzuDB lineage graphs and generates provenance reports. Capsules let us replay any failed query with mocked LLM responses.",
    snippet: [
      "$ nova capture python lineage_agent.py --depth 4",
      "",
      "  capsule   ─ 7b3d9e11",
      "  trace.jsonl        ✓   4,847 spans",
      "  model-calls.jsonl  ✓   23 LLM calls",
      "  mcp-exchanges/     ✓   14 tool calls",
    ],
    repo: "https://github.com/MSKazemi/novafabric",
    tags: ["KuzuDB", "lineage", "agent"],
  },
  {
    project: "HPC job orchestration",
    useCase:
      "SLURM prolog/epilog hooks wrapped with nova capture. Every job submission produces a capsule; failed jobs are replayed in forensic mode without re-running on the cluster.",
    snippet: [
      "$ nova capture sbatch --wrap 'python train.py'",
      "",
      "  capsule   ─ c2f0a88d",
      "  environment.json   ✓   SLURM env vars",
      "  trace.jsonl        ✓   892 spans",
      "  replay.yaml        ✓   forensic mode",
    ],
    repo: "https://github.com/MSKazemi/novafabric",
    tags: ["SLURM", "HPC", "forensic"],
  },
];
