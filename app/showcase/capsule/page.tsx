import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

// Retired route (issue #20, PR A): its content now lives at /demo/capsule/.
export const metadata = redirectMetadata("/demo/capsule/", "Moved: Run Capsule demo");

export default function ShowcaseCapsuleRedirect() {
  return <RedirectStub to="/demo/capsule/" label="the Run Capsule demo" />;
}
