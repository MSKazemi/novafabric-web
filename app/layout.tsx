import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import GSAPProvider from "@/components/providers/GSAPProvider";
import LenisProvider from "@/components/providers/LenisProvider";
import { CommandPalette } from "@/components/command";
import ScrollProgress from "@/components/scroll/ScrollProgress";
import KonamiHandler from "@/components/easter/KonamiHandler";
import JsonLd from "@/components/JsonLd";
import Analytics from "@/components/Analytics";
import { VERSION } from "@/lib/version";

const displayFont = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const codeFont = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://novafabric.ai"),
  // Positioning note — keep this aligned with the repository README.
  //
  // This site previously called NovaFabric "monitoring, observability …
  // infrastructure", while the README states plainly that it is *not* the right
  // tool for real-time monitoring and alerting. Two contradictory answers on the
  // two surfaces a visitor checks first is worse than either one alone, and for
  // a project whose pitch is verifiable provenance it is the wrong thing to be
  // sloppy about. The wording below is the README's own summary.
  //
  // The keyword list is unchanged: those are the terms people search when they
  // have this problem, and capturing that demand is fine. Claiming to be a
  // monitoring product is not.
  title: "NovaFabric Lab — replay and prove what an AI agent did",
  description:
    "NovaFabric captures any AI-agent or HPC run as a portable, secret-redacted, signed evidence capsule you own, then replays, diffs, and proves it — self-hosted, no accounts, no telemetry. Built for reproducibility and audit evidence rather than live dashboards; it is not a real-time monitoring and alerting tool.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "https://novafabric.ai/" },
  openGraph: {
    title: "NovaFabric Lab — replay and prove what an AI agent did",
    description:
      "Capture any AI-agent or HPC run as a portable signed evidence capsule you own, then replay, diff and prove it. Self-hosted, laptop to cluster. For reproducibility and audit, not live dashboards.",
    type: "website",
    url: "https://novafabric.ai/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630, alt: "NovaFabric Lab — replay and prove what an AI agent did" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://novafabric.ai/og.png"],
  },
  verification: { google: "google2a87e4dc9c54dc74" },
  category: "technology",
  // TODO: Add Bing Webmaster Tools verification
  // Step — Bing Webmaster Tools: https://www.bing.com/webmasters
  //   Add site → novafabric.ai → XML tag → copy the content value → paste below
  // other: { "msvalidate.01": "PASTE_BING_VERIFICATION_CODE_HERE" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#07070a" },
  ],
  colorScheme: "light dark",
};

// Entity graph. Every node carries a stable @id and cross-references the others
// by @id rather than re-declaring a bare stub — a duplicated stub is parsed as a
// second, under-specified entity and reported invalid.
const ORG_ID = "https://novafabric.ai/#organization";
const SOFTWARE_ID = "https://novafabric.ai/#software";
const AUTHOR_ID = "https://orcid.org/0000-0002-1166-6559";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "NovaFabric Lab",
  alternateName: ["NovaFabric", "NovaFabric Lab"],
  // The product's own served docs lead with this line. It is the most
  // distinctive phrase the project owns and, unlike "evidence fabric", it
  // collides with nothing else in search.
  slogan: "The time machine for AI systems",
  url: "https://novafabric.ai",
  logo: "https://novafabric.ai/favicon.svg",
  description:
    "Open-source research lab building local-first evidence infrastructure for AI agents and agentic applications: capture, replay, lineage, and audit of past executions.",
  // Disambiguation: "fabric" is a crowded namespace (data-platform and
  // networking products share the word). Search Console shows novafabric.ai
  // surfacing for other people's products — "open fabric ai", "neuralfabric",
  // "modelscope agentfabric" — so state plainly what this is not.
  disambiguatingDescription:
    "An independent open-source research project for recording, replaying and auditing AI-agent executions. Unrelated to data-analytics or network-fabric products that share the word \"fabric\".",
  founder: { "@id": AUTHOR_ID },
  sameAs: [
    "https://github.com/novafabric",
    "https://github.com/MSKazemi/novafabric",
    "https://pypi.org/project/novafabric/",
    "https://www.wikidata.org/wiki/Q140800195",
  ],
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": AUTHOR_ID,
  name: "Mohsen Seyedkazemi Ardebili",
  url: "https://mskazemi.com/",
  identifier: {
    "@type": "PropertyValue",
    propertyID: "ORCID",
    value: "0000-0002-1166-6559",
  },
  sameAs: [
    "https://orcid.org/0000-0002-1166-6559",
    "https://github.com/MSKazemi",
    "https://www.linkedin.com/in/mskazemi/",
  ],
};

// The site previously declared only Organization + WebSite, so the thing the
// site is actually about — the software — had no entity of its own.
// applicationCategory + offers satisfy Google's "two or more properties"
// requirement for SoftwareApplication without asserting an unverified OS list.
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": SOFTWARE_ID,
  name: "NovaFabric",
  applicationCategory: "DeveloperApplication",
  applicationSubCategory:
    "AI-agent execution capture, replay and audit",
  // Wording tracks the two sources of truth — this site and the docs the
  // running service serves itself ("Capture, replay, and audit any AI run.
  // Self-hosted … laptop to cluster"). Deliberately not the CLAIMS.md phrasing:
  // that file predates the current release, and its "evidence fabric" wording
  // feeds the very name-collision this schema is trying to resolve.
  description:
    "NovaFabric captures, replays and audits any AI-agent or HPC run as a portable, signed evidence capsule you own. Self-hosted and open source, from laptop to cluster. Core pipeline: Capture — Seal — Replay — Diff — Audit.",
  url: "https://novafabric.ai/novafabric/",
  downloadUrl: "https://pypi.org/project/novafabric/",
  codeRepository: "https://github.com/MSKazemi/novafabric",
  softwareVersion: VERSION,
  citation: {
    "@type": "ScholarlyArticle",
    headline: "NovaFabric: Tamper-Evident, Replayable Evidence for Autonomous AI Agent Runs",
    url: "https://arxiv.org/abs/2609.12582",
    datePublished: "2026-09-11",
  },
  runtimePlatform: "Python 3.12+",
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@id": AUTHOR_ID },
  publisher: { "@id": ORG_ID },
  sameAs: [
    "https://github.com/MSKazemi/novafabric",
    "https://pypi.org/project/novafabric/",
    "https://www.wikidata.org/wiki/Q140800195",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://novafabric.ai/#website",
  name: "NovaFabric Lab",
  url: "https://novafabric.ai",
  description:
    "Local-first capture, replay, lineage, and audit for AI-agent and agentic application executions.",
  publisher: { "@id": ORG_ID },
  about: { "@id": SOFTWARE_ID },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${codeFont.variable} ${bodyFont.variable}`}
    >
      <head>
        {/* No-FOUC theme init — runs before paint. Light is the default; a
            stored choice (nova-theme) wins. Mirrors ThemeToggle's contract. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nova-theme');document.documentElement.setAttribute('data-theme',(t==='dark'||t==='light')?t:'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body>
        <JsonLd data={organizationSchema} />
        <JsonLd data={personSchema} />
        <JsonLd data={softwareApplicationSchema} />
        <JsonLd data={websiteSchema} />
        <Analytics />
        <GSAPProvider>
          <LenisProvider>
            <ScrollProgress />
            <KonamiHandler />
            <CommandPalette />
            {children}
          </LenisProvider>
        </GSAPProvider>
      </body>
    </html>
  );
}
