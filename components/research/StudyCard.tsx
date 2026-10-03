import type { ResearchArea } from "@/lib/types";
import StatusChip from "@/components/ui/StatusChip";

interface StudyCardProps {
  area: ResearchArea;
}

export default function StudyCard({ area }: StudyCardProps) {
  return (
    <div className="bg-surface border border-edge-2 rounded-md p-6 hover:border-faint transition-colors">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={area.status} />
        {area.secondaryStatus && <StatusChip status={area.secondaryStatus} />}
      </div>

      {/* Title */}
      <h3 className="font-display text-xl text-ink mt-3 mb-2">{area.title}</h3>

      {/* Description */}
      <p className="text-muted text-[15px] md:text-sm leading-relaxed mb-4">{area.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {area.tags.map((tag) => (
          <span
            key={tag}
            className="font-code text-[11px] text-faint border border-edge px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
