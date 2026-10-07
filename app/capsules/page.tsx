import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import { PageHero, SectionHeader } from "@/components/ui";
import CapsuleGallery from "@/components/capsules/CapsuleGallery";
import SubmitCapsuleCTA from "@/components/capsules/SubmitCapsuleCTA";
import { CAPSULES } from "@/lib/data/capsules";

export const metadata: Metadata = {
  title: "Capsules — NovaFabric",
  description:
    "Real-world novafabric capsules: community examples of AI-agent execution capture, replay, and comparison across agentic workflows.",
  alternates: { canonical: "https://novafabric.ai/capsules/" },
  openGraph: {
    title: "Capsules — NovaFabric",
    description:
      "Real-world novafabric capsules: community examples of AI-agent execution capture.",
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
        title="Capsules"
        subtitle="Real-world novafabric run capsules — community examples of capture, replay, and audit."
        tag="community"
      />
      <main className="page-max-w py-16">
        <SectionHeader number="01" title="Gallery" />
        <CapsuleGallery capsules={CAPSULES} />
        <SectionHeader number="02" title="Submit a Capsule" className="mt-20" />
        <SubmitCapsuleCTA />
      </main>
      <Footer />
    </>
  );
}
