import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

// Retired route (issue #20, PR A): its content now lives at /demo/replay/.
export const metadata = redirectMetadata("/demo/replay/", "Moved: replay and diff demo");

export default function ShowcaseReplayRedirect() {
  return <RedirectStub to="/demo/replay/" label="the replay and diff demo" />;
}
