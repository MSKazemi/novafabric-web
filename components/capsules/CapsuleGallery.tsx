"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CapsuleEntry } from "@/lib/types";
import CapsuleCard from "./CapsuleCard";

interface CapsuleGalleryProps {
  capsules: CapsuleEntry[];
}

export default function CapsuleGallery({ capsules }: CapsuleGalleryProps) {
  const [activeTag, setActiveTag] = useState("all");

  const allTags = ["all", ...Array.from(new Set(capsules.flatMap((c) => c.tags)))];
  const filtered =
    activeTag === "all" ? capsules : capsules.filter((c) => c.tags.includes(activeTag));

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allTags.map((tag) => {
          const isActive = tag === activeTag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={[
                "font-code text-[11px] px-3 py-1 rounded transition-colors",
                isActive
                  ? "bg-amber text-canvas"
                  : "border border-edge-2 text-muted hover:text-ink",
              ].join(" ")}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Card grid with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTag}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((capsule) => (
            <motion.div
              key={capsule.project}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CapsuleCard capsule={capsule} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
