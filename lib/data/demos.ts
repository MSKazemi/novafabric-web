/**
 * The interactive demos under /demo/. Each one runs in the browser on fixture
 * files copied from the NovaFabric repository (lib/demo/fixtures.ts); none of
 * them talks to a server. Order matches the five primitives.
 */
export const DEMOS = [
  {
    href: "/demo/registry/",
    title: "Asset registry",
    blurb: "name@version identity for models, prompts, tools and datasets, with eval-gated promotion.",
  },
  {
    href: "/demo/capsule/",
    title: "Run Capsule",
    blurb: "The files one captured run leaves behind, validated in your browser against the shipped schema.",
  },
  {
    href: "/demo/replay/",
    title: "Replay & diff",
    blurb: "What each of the five replay modes does and does not do, and a structural diff of two runs.",
  },
  {
    href: "/demo/lineage/",
    title: "Lineage graph",
    blurb: "Provenance, blast radius and replay chain over a small graph of runs, assets and artifacts.",
  },
  {
    href: "/demo/evidence/",
    title: "Evidence Bundle",
    blurb: "A signed bundle manifest, verified with real Ed25519 in your browser. Flip a byte and it fails.",
  },
] as const;
