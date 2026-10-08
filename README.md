# novafabric.ai

Source code of the website for **NovaFabric** — open-source, self-hosted replay and
evidence infrastructure for AI agents and agentic systems. NovaFabric captures agent
executions as portable Run Capsules for replay, diff, lineage, provenance, and audit.

- Website: [novafabric.ai](https://novafabric.ai)
- NovaFabric software and documentation: [MSKazemi/novafabric](https://github.com/MSKazemi/novafabric)
- Author: [Mohsen Seyedkazemi Ardebili](https://github.com/MSKazemi)

## Stack

- [Next.js 16](https://nextjs.org) (App Router, static export) and [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com) and TypeScript
- [GSAP](https://gsap.com), [Lenis](https://lenis.darkroom.engineering) and [Framer Motion](https://www.framer.com/motion/) for motion
- [Three.js](https://threejs.org) via [@react-three/fiber](https://r3f.docs.pmnd.rs) for the particle hero
- [Shiki](https://shiki.style) for syntax highlighting and [cmdk](https://cmdk.paco.me) for the command palette

## Getting started

```bash
npm ci
npm run dev      # http://localhost:3000
npm run build    # static export to ./out/
```

The documentation pages are rendered at build time from the `docs/` directory of
[MSKazemi/novafabric](https://github.com/MSKazemi/novafabric). `npm run build` fetches
them automatically; set `NOVAFABRIC_DOCS` to a local `docs/` directory to use your own checkout.

## Pages

Every public page of novafabric.ai is a route in this repository:

- `/` home · `/novafabric/` product and CLI · `/install/` · `/primitives/` (with the replay modes) · `/architecture/`
- `/demo/` guided tour, plus in-browser demos at `/demo/capsule/`, `/demo/replay/`, `/demo/lineage/`, `/demo/registry/` and `/demo/evidence/`
- `/spec/` JSON Schemas · `/docs/**` documentation · `/blog/` · `/research/` · `/changelog/` · `/capsules/` · `/contact/`

Retired URLs (`/concepts/`, `/why/`, `/showcase/**`, `/dashboard/`) are redirect stubs: GitHub Pages cannot
send a 301, so each stub is a `noindex` page with an immediate meta refresh and a `rel=canonical` pointing at
the page that replaced it (`components/RedirectStub.tsx`). Stubs are kept out of `sitemap.xml`.

## Demo fixtures

The interactive demos under `/demo/` run in the browser on copies of the NovaFabric repository's showcase
fixtures (`lib/data/demo/fixtures/`, from `web/src/data/fixtures/` at the release named in
`lib/demo/fixtures.ts`) and on the packaged `run-capsule.schema.json` (`lib/data/demo/`). They are not fetched
at runtime. Refresh them from the matching release tag when the formats change.

## Layout

```
app/          App Router pages
components/   UI, hero, command palette, scroll, and page-specific components
content/      Blog posts (Markdown)
lib/          Page data, shared types and demo fixtures
public/       Static assets
scripts/      Build helpers
```

## License

All rights reserved. The code may be read for reference but not reused. See [LICENSE](LICENSE).
