import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

// Retired route (issue #20, PR A). The dashboard is a local tool (`nova serve --experimental`),
// shipped in the product, not a public page; this URL points at its documentation.
export const metadata = redirectMetadata("/docs/dashboard/", "The NovaFabric dashboard runs locally");

export default function DashboardRedirect() {
  return <RedirectStub to="/docs/dashboard/" label="the dashboard documentation" />;
}
