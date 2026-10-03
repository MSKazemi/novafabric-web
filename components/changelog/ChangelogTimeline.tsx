"use client";

import type { Milestone } from "@/lib/types";
import AnimatedSection from "@/components/ui/AnimatedSection";
import VersionEntry from "./VersionEntry";

interface ChangelogTimelineProps {
  milestones: Milestone[];
}

export default function ChangelogTimeline({ milestones }: ChangelogTimelineProps) {
  // Find the last shipped milestone
  let latestShippedIndex = -1;
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (milestones[i].status === "shipped") {
      latestShippedIndex = i;
      break;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {milestones.map((milestone, index) => {
        const isLatest = index === latestShippedIndex;
        const delay = Math.min(0.05 * index, 0.3);

        return (
          <AnimatedSection key={milestone.version} variant="fadeUp" delay={delay}>
            <VersionEntry
              milestone={milestone}
              isLatest={isLatest}
              defaultOpen={isLatest}
            />
          </AnimatedSection>
        );
      })}
    </div>
  );
}
