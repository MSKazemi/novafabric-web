/**
 * Publishes the single `docs/cli-reference.md` as an index plus one page per
 * command area.
 *
 * The source is one hand-written file (~67,000 words, 49 sections) and stays one
 * file: the product repository's tests check it covers every command, and other
 * docs link into it by anchor. Rendered as one page it was a 2.3 MB document
 * that matched searches for strings that merely occur somewhere inside it.
 * Split here, each command area gets
 * its own URL, title and description; anchors are rewritten to the page that now
 * holds them (see `linkSplitReference` in lib/docs.ts).
 *
 * Sections are grouped by topic rather than one page per `##`: a dozen sections
 * are under 300 words and would be thin pages on their own. A section that no
 * group claims (a new one added upstream) gets a page of its own, so nothing is
 * ever dropped from the site.
 */
import { headingId } from "./markdown";

export const CLI_REFERENCE_FILE = "cli-reference.md";
export const CLI_REFERENCE_SLUG = "cli-reference";
export const CLI_REFERENCE_TITLE = "CLI reference";

interface Group {
  slug: string;
  title: string;
  description: string;
  /** Matched against each `##` heading of the source. */
  sections: RegExp;
  /** Optional markdown shown under the page heading: where the concept is explained. */
  context?: string;
}

// Order here is the order on the index page. Descriptions state only what the
// matched sections themselves document.
const GROUPS: Group[] = [
  {
    slug: "capture",
    title: "nova capture, setup and adapter commands",
    description:
      "Reference for nova init and nova capture: wrap a command without code changes, API and MCP proxies, framework adapters, the warm daemon, distributed runs.",
    sections: /^(Setup|Capture commands|Collector buffer operations|Warm capture daemon|Phase 3|Memory commands|Framework Adapters)\b/,
  },
  {
    slug: "replay-and-diff",
    title: "nova replay, diff and diagnose commands",
    description:
      "Reference for nova replay and its modes, nova diff between two run capsules, and nova diagnose, which attributes a failed run to its most likely step.",
    sections: /^(Replay commands|Diagnose commands)\b/,
    // The command reference and the concept page link to each other: flags here,
    // what each mode reuses and runs live there.
    context:
      "What each of the five modes reuses from the capsule, and what still runs live, is explained in [Replay modes for AI agent runs](/docs/architecture/replay-modes/).",
  },
  {
    slug: "query-search-drift",
    title: "Offline query, search and drift commands",
    description:
      "Reference for offline analysis over local run capsules: nova query, view and trend metrics, full-text nova search, and drift and replay-equivalence checks.",
    sections: /^(Offline metrics query|Capsule content search|Offline drift)\b/,
  },
  {
    slug: "lineage",
    title: "Lineage and execution-graph commands",
    description:
      "Reference for nova lineage (provenance, blast radius, replay chain), nova graph agent, lineage-store migration and metadata database recovery.",
    sections: /^(Lineage commands|Agent execution graph|Lineage store operations|Metadata DB recovery)\b/,
  },
  {
    slug: "trust",
    title: "Trust, secret-scan and assurance commands",
    description:
      "Reference for trust-layer commands: nova scan-secrets, nova assure, nova redact, annotations and scores, and read-only trust and assurance views.",
    sections: /^(Trust layer commands|Trust visualization)\b/,
  },
  {
    slug: "registry",
    title: "Registry, prompt and promotion commands",
    description:
      "Reference for the asset registry: nova register, promote and rollback, prompt versions, deployment labels and two-person maker-checker sealing.",
    sections: /^(Registry commands|NovaSeal linked-envelope|Asset lifecycle commands|Prompt versioning|Deployment label)\b/,
  },
  {
    slug: "compliance",
    title: "Compliance and audit export commands",
    description:
      "Reference for evidence exports (EU AI Act Annex IV, NIS2, NIST AI RMF, sector reports), nova audit, nova classify and examiner archives.",
    sections: /^(Compliance evidence|Sector and transparency|Compliance commands|Compliance audit commands|Examiner exporter|Governance commands)\b/,
  },
  {
    slug: "incidents-and-events",
    title: "Incident forensics, DSAR and event commands",
    description:
      "Reference for nova forensics timeline, nova dsar for subject-rights requests, and opt-in lifecycle events and webhooks with nova events.",
    sections: /^(Incident forensics|Lifecycle events)\b/,
  },
  {
    slug: "policy-and-retention",
    title: "Policy, approval and retention commands",
    description:
      "Reference for nova policy (Rego tests and decision explanations), approvals and legal holds, and the audited retention scheduler, nova retention.",
    sections: /^(Policy and governance|Retention scheduler)\b/,
  },
  {
    slug: "server-and-operations",
    title: "Server, storage and backup commands",
    description:
      "Reference for nova doctor, capsule ingest and migrations, signed backups with verified restore, support bundles, and audit-log export for SIEM tools.",
    sections: /^(Storage and server commands|Backup, restore|Audit-log SIEM)\b/,
  },
  {
    slug: "dashboard",
    title: "Dashboard commands",
    description:
      "Reference for nova dashboard (widgets and dashboards as portable JSON files) and nova serve --experimental, the experimental local web dashboard.",
    sections: /^(nova dashboard$|Local dashboard)\b/,
  },
  {
    slug: "cluster-and-hpc",
    title: "Collector binaries and HPC runners",
    description:
      "Reference for the Go collector tier (novafabric-collector, verifier and HPC hub, built from source), Slurm integration, and the PBS and LSF runners.",
    sections: /^(Collector binaries|HPC runner commands)\b/,
  },
  {
    slug: "evidence-fabric",
    title: "Evidence Fabric: schema, cost and storage commands",
    description:
      "Reference for Evidence Fabric v1.0 commands: nova schema, cost estimates and attribution, pricing tables, storage inspection and capture-level policy.",
    sections: /^Evidence Fabric\b/,
  },
  {
    slug: "knowledge-graph",
    title: "nova kg: the capsule knowledge graph",
    description:
      "Reference for nova kg, the capsule knowledge graph over local run capsules: initialising, ingesting, building provenance and running detections.",
    sections: /^nova kg\b/,
  },
  {
    slug: "mcp",
    title: "MCP supply-chain risk scanner (nova mcp)",
    description:
      "Reference for nova mcp: OWASP LLM Top 10 supply-chain checks for MCP server manifests, risk reports, server cards and conformance checks.",
    sections: /^MCP supply-chain/,
  },
  {
    slug: "accountability-and-energy",
    title: "Accountability spine and energy commands",
    description:
      "Reference for the experimental accountability spine: LlamaIndex, Pydantic AI and Haystack adapters, and the nova energy probe, attest and verify commands.",
    sections: /^Accountability Spine\b/,
  },
  {
    slug: "environment-variables",
    title: "Environment variables",
    description:
      "The environment variables NovaFabric reads, with defaults: home and capsule paths, object storage, the distributed-run contract and capture settings.",
    sections: /^Environment variables\b/,
  },
];

/** Sections about the reference as a whole stay on the index page. */
const INDEX_SECTIONS = /^(What you will learn|Command index|Summary and next steps)\b/;

interface Section {
  title: string;
  /** The section's markdown, its `##` heading line included. */
  markdown: string;
}

export interface ReferencePart {
  slug: string;
  title: string;
  description?: string;
  raw: string;
}

/** Splits on `##` headings, ignoring anything inside fenced code blocks. */
function splitSections(raw: string): { intro: string; sections: Section[] } {
  const intro: string[] = [];
  const sections: { title: string; lines: string[] }[] = [];
  let fence: string | null = null;
  for (const line of raw.split("\n")) {
    const marker = line.match(/^\s*(```|~~~)/)?.[1];
    if (marker) fence = fence === null ? marker : fence === marker ? null : fence;
    if (fence === null && !marker && line.startsWith("## ")) {
      sections.push({ title: line.slice(3).trim(), lines: [line] });
    } else if (sections.length) {
      sections[sections.length - 1].lines.push(line);
    } else {
      intro.push(line);
    }
  }
  return {
    intro: intro.join("\n").trim(),
    sections: sections.map((s) => ({ title: s.title, markdown: s.lines.join("\n").trim() })),
  };
}

export function splitCliReference(raw: string): { index: string; parts: ReferencePart[] } {
  const { intro, sections } = splitSections(raw);
  const indexSections: Section[] = [];
  const grouped = new Map<string, { group: Omit<Group, "sections">; sections: Section[] }>();

  for (const section of sections) {
    if (INDEX_SECTIONS.test(section.title)) {
      indexSections.push(section);
      continue;
    }
    const group: Omit<Group, "sections"> =
      GROUPS.find((g) => g.sections.test(section.title)) ?? {
        // Unclaimed section: its own page, titled without the "(v0.x, ADR-…)" tail.
        slug: headingId(section.title.replace(/\s*\([^)]*\)\s*$/, "")),
        title: section.title.replace(/\s*\([^)]*\)\s*$/, ""),
        description: "",
      };
    const entry = grouped.get(group.slug) ?? { group, sections: [] };
    entry.sections.push(section);
    grouped.set(group.slug, entry);
  }

  const order = (slug: string) => {
    const i = GROUPS.findIndex((g) => g.slug === slug);
    return i === -1 ? GROUPS.length : i;
  };
  const parts: ReferencePart[] = [...grouped.values()]
    .sort((a, b) => order(a.group.slug) - order(b.group.slug))
    .map(({ group, sections: own }) => ({
      slug: group.slug,
      title: group.title,
      description: group.description || undefined,
      raw: [
        `# ${group.title}`,
        `Part of the [NovaFabric CLI reference](/docs/${CLI_REFERENCE_SLUG}/). Both \`nova\` and \`novafabric\` run the same binary.`,
        ...(group.context ? [group.context] : []),
        ...own.map((s) => s.markdown),
      ].join("\n\n"),
    }));

  const list = parts
    .map((p) => `- [${p.title}](/docs/${CLI_REFERENCE_SLUG}/${p.slug}/)${p.description ? ` — ${p.description}` : ""}`)
    .join("\n");

  const index = [intro, `## Reference pages\n\n${list}`, ...indexSections.map((s) => s.markdown)].join("\n\n");
  return { index, parts };
}
