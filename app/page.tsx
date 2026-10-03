import type { Metadata } from "next";
import Nav from "@/components/Nav";
import CinematicHero from "@/components/home/CinematicHero";
import ScrollStory from "@/components/home/ScrollStory";
import CapabilitySystem from "@/components/home/CapabilitySystem";
import LabOverview from "@/components/home/LabOverview";
import ResearchActivity from "@/components/ResearchActivity";
import CapsuleShowcase from "@/components/CapsuleShowcase";
import Packages from "@/components/Packages";
import About from "@/components/About";
import Footer from "@/components/Footer";
import { RESEARCH_AREAS } from "@/lib/data/research";
import { CAPSULES } from "@/lib/data/capsules";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  // This overrides the layout title, so it is the one search engines show for
  // the homepage — keep it aligned with the README's positioning, not with the
  // older "monitoring & observability" framing the README explicitly disclaims.
  title: "NovaFabric Lab — replay and prove what an AI agent run actually did",
  description:
    "Capture, replay, and audit AI agents and agentic applications. NovaFabric records every model call and tool invocation as a portable, tamper-evident capsule you own — local-first evidence, lineage, and audit trails for past executions, not live dashboards.",
  alternates: { canonical: "https://novafabric.ai/" },
};

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <CinematicHero />
        <ScrollStory />
        <AnimatedSection variant="fadeUp">
          <CapabilitySystem />
        </AnimatedSection>
        <LabOverview />
        <AnimatedSection variant="fadeUp">
          <ResearchActivity activities={RESEARCH_AREAS} showAll={false} />
        </AnimatedSection>
        <AnimatedSection variant="fadeUp">
          <CapsuleShowcase capsules={CAPSULES} />
        </AnimatedSection>
        <AnimatedSection variant="fadeUp">
          <Packages />
        </AnimatedSection>
        <AnimatedSection variant="fadeUp">
          <About />
        </AnimatedSection>
      </main>
      <Footer />
    </>
  );
}
