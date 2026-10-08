import CapsuleBranch from "@/components/brand/CapsuleBranch";
import CapsuleReceipt from "@/components/brand/CapsuleReceipt";

/**
 * Homepage section that introduces the Run Capsule in full on first mention
 * (brand rule: "capsule" alone is a crowded word) and shows the two journeys.
 * Every claim here is a durable brand statement or a capability the claim
 * matrix already allows; nothing says a default capture is signed or redacted.
 */
export default function RunCapsuleStory() {
  return (
    <section className="py-24 border-t border-edge">
      <div className="page-max-w">
        <p className="font-code text-[11px] text-faint tracking-widest uppercase mb-2">the artifact</p>
        <h2 className="font-display text-4xl md:text-5xl text-ink leading-[1.05] mb-4 max-w-3xl">
          A trace is a view of a run.
          <br />
          A Run Capsule is an artifact you keep.
        </h2>
        <p className="text-muted text-lg max-w-2xl leading-relaxed mb-12">
          A NovaFabric Run Capsule is a portable execution-evidence artifact you own. Capture a run once; replay it,
          compare it with another, and — if you seal it with your own key — verify later that it has not changed.
        </p>
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <CapsuleReceipt />
          <div className="flex-1 min-w-0 w-full">
            <CapsuleBranch />
          </div>
        </div>
      </div>
    </section>
  );
}
