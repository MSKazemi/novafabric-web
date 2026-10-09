import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import { PageHero, SectionHeader } from "@/components/ui";
import CapsuleGallery from "@/components/capsules/CapsuleGallery";
import SubmitCapsuleCTA from "@/components/capsules/SubmitCapsuleCTA";
import { CAPSULES } from "@/lib/data/capsules";

export const metadata: Metadata = {
  title: "Example Run Capsules for AI agent runs — NovaFabric",
  description:
    "Example Run Capsules from the NovaFabric repository: the files one AI agent run writes, its model and tool calls, and where each example comes from.",
  alternates: { canonical: "https://novafabric.ai/capsules/" },
  openGraph: {
    title: "Example Run Capsules for AI agent runs — NovaFabric",
    description:
      "Example Run Capsules from the NovaFabric repository: the files one AI agent run writes, and where each example comes from.",
    url: "https://novafabric.ai/capsules/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

export default function CapsulesPage() {
  return (
    <>
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Capsules", path: "/capsules/" }]} />
      <PageHero
        section="capsules"
        title="Example Run Capsules"
        subtitle="Run Capsules from the NovaFabric repository: what one run writes, read from the capsule files themselves, and where each example comes from."
        tag="examples"
      />
      <main className="page-max-w py-16">
        <SectionHeader number="01" title="Gallery" />
        <p className="text-muted text-[15px] md:text-sm leading-relaxed mb-8 max-w-2xl">
          Every file name and count below is read from the capsule at build time.{" "}
          <Link href="/docs/architecture/run-capsule/" className="text-amber hover:text-amber-2 transition-colors">
            What is a Run Capsule?
          </Link>{" "}
          explains each file, and the{" "}
          <Link href="/demo/capsule/" className="text-amber hover:text-amber-2 transition-colors">
            Run Capsule demo
          </Link>{" "}
          opens the fixture in your browser.
        </p>
        <CapsuleGallery capsules={CAPSULES} />
        <SectionHeader number="02" title="Submit a Capsule" className="mt-20" />
        <SubmitCapsuleCTA />
      </main>
      <Footer />
    </>
  );
}
