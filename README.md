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

## Layout

```
app/          App Router pages
components/   UI, hero, command palette, scroll, and page-specific components
content/      Blog posts (Markdown)
lib/          Page data and shared types
public/       Static assets
scripts/      Build helpers
```

## License

All rights reserved. The code may be read for reference but not reused. See [LICENSE](LICENSE).
