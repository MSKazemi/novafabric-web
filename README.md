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
npm run build    # static export to ./out/, then the link and SEO checks below
```

`npm run build` ends with three checks on the exported site, and any one fails the build:

- `npm run check-links`: every internal link (`href`, including absolute links to this site) and every image or
  script source (`src`) resolves to an exported page or asset, and every `#fragment` names an element on the
  page it points to.
- `npm run check-seo`: every `sitemap.xml` URL is an indexable, self-canonical page whose `og:url` matches its
  canonical, with one title, one meta description of at most 160 characters, one `<h1>` and JSON-LD that
  parses. No other indexable page exists outside the sitemap. Each redirect stub points at a listed page in one
  hop, and `robots.txt` does not block the site. No page and no `llms.txt` uses wording the product's claim
  matrix marks unsafe (the `CLAIMS` list in `scripts/check-seo.mjs`, each entry naming its matrix row).
- `npm run check-cli-reference`: splitting `docs/cli-reference.md` into an index and command-area pages loses no
  heading, repeats no id on a page, reuses no slug, and forwards every pre-split anchor
  (`/docs/cli-reference/#…`) to the page that now holds it.

`npm test` runs fixture tests (`scripts/tests/`): tiny generated sites on which each check must fail for the
defect it exists for, and pass when nothing is broken. CI runs it after the build.

The documentation pages are rendered at build time from the `docs/` directory of
[MSKazemi/novafabric](https://github.com/MSKazemi/novafabric). `npm run build` fetches
them automatically; set `NOVAFABRIC_DOCS` to a local `docs/` directory to use your own checkout.
The docs' diagrams (`docs/assets/`) are copied to `public/docs/assets/` by the same step (generated, gitignored).
The capsule gallery (`/capsules/` and the home page) is read at build time from real capsule files: the
repository's `examples/capsules/` and the demo fixture in `lib/data/demo/fixtures/`.

## Pages

Every public page of novafabric.ai is a route in this repository:

- `/` home · `/novafabric/` product and CLI · `/install/` · `/primitives/` (with the replay modes) · `/architecture/`
- `/demo/` guided tour, plus in-browser demos at `/demo/capsule/`, `/demo/replay/`, `/demo/lineage/`, `/demo/registry/` and `/demo/evidence/`
- `/spec/` JSON Schemas · `/docs/**` documentation · `/blog/` · `/research/` · `/changelog/` · `/capsules/` · `/contact/`

Retired URLs (`/concepts/`, `/why/`, `/showcase/**`, `/dashboard/`) are redirect stubs. GitHub Pages cannot
send a 301, so each stub is an immediate meta refresh (which Google treats as a permanent redirect), plus a
`rel=canonical` and `og:url` that point at the page that replaced it (`components/RedirectStub.tsx`). Stubs
carry no `noindex` and are kept out of `sitemap.xml`.

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
