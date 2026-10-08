import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

// Retired route (issue #20, PR A): its content now lives at /demo/evidence/.
export const metadata = redirectMetadata("/demo/evidence/", "Moved: Evidence Bundle demo");

export default function ShowcaseEvidenceRedirect() {
  return <RedirectStub to="/demo/evidence/" label="the Evidence Bundle demo" />;
}
