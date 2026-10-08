import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

// Retired route (issue #20, PR A): its content now lives at /primitives/.
export const metadata = redirectMetadata("/primitives/", "Moved: NovaFabric primitives");

export default function ConceptsRedirect() {
  return <RedirectStub to="/primitives/" label="Primitives" />;
}
