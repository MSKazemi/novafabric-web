import Link from "next/link";

const LAB_PAGES = [
  {
    label: "novafabric",
    href: "/novafabric",
    desc: "Run capsules, replay, lineage, audit.",
    icon: "◆",
  },
  {
    label: "research",
    href: "/research",
    desc: "Open problems and upcoming publications.",
    icon: "⬡",
  },
  {
    label: "primitives",
    href: "/primitives",
    desc: "Five composable building blocks.",
    icon: "⊞",
  },
  {
    label: "architecture",
    href: "/architecture",
    desc: "Five-layer evidence infrastructure.",
    icon: "≡",
  },
  {
    label: "changelog",
    href: "/changelog",
    desc: "Every version from v0.1 to current.",
    icon: "⊙",
  },
  {
    label: "capsules",
    href: "/capsules",
    desc: "Community capsule gallery.",
    icon: "⬡",
  },
];

export default function LabOverview() {
  return (
    <section className="py-24 border-t border-edge">
      <div className="page-max-w">
        <p className="font-code text-[11px] text-faint tracking-widest uppercase mb-2">
          Enter the lab
        </p>
        <h2 className="font-display text-4xl text-ink mb-12">Six ways in.</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAB_PAGES.map((page) => (
            <Link key={page.href} href={page.href}>
              <div className="bg-surface border border-edge-2 rounded-md p-6 hover:border-faint hover:bg-surface-2 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-amber text-xl">{page.icon}</span>
                  <span className="font-code text-[13px] text-ink">
                    {page.label}
                  </span>
                  <span className="ml-auto font-code text-[11px] text-faint group-hover:text-muted transition-colors">
                    →
                  </span>
                </div>
                <p className="text-muted text-[15px] md:text-sm leading-relaxed">{page.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
