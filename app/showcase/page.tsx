import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

// Retired route (issue #20, PR A): its content now lives at /demo/.
export const metadata = redirectMetadata("/demo/", "Moved: NovaFabric demo");

export default function ShowcaseRedirect() {
  return <RedirectStub to="/demo/" label="the demo" />;
}
