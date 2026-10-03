const STEPS = [
  { number: "01", description: "Install novafabric and capture a run" },
  { number: "02", description: "Push your capsule to a public GitHub repo" },
  { number: "03", description: "Open an issue with the [capsule] tag linking your repo" },
];

export default function SubmitCapsuleCTA() {
  return (
    <div className="bg-surface-2 border border-edge-2 rounded-md p-8">
      <h2 className="font-display text-2xl text-ink mb-2">Share your capsule</h2>
      <p className="text-muted text-[15px] md:text-sm mb-6">
        Running novafabric on an interesting project? We&apos;d love to feature it here.
      </p>

      <div className="flex flex-col gap-4 mb-8">
        {STEPS.map((step) => (
          <div key={step.number} className="flex items-start gap-4">
            <span className="font-code text-[13px] text-amber shrink-0 mt-0.5">{step.number}</span>
            <span className="text-muted text-[15px] md:text-sm leading-relaxed">{step.description}</span>
          </div>
        ))}
      </div>

      <a
        href="https://github.com/MSKazemi/novafabric/issues"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block font-code text-[12px] text-amber border border-amber px-4 py-2 rounded hover:text-amber-2 hover:border-amber-2 transition-colors"
      >
        open an issue ↗
      </a>
    </div>
  );
}
