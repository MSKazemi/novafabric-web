import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

// Retired route (issue #20, PR A): its content now lives at /novafabric/#why.
export const metadata = redirectMetadata("/novafabric/#why", "Moved: why replayable AI agent runs matter");

export default function WhyRedirect() {
  return <RedirectStub to="/novafabric/#why" label="Why replayable runs" />;
}
