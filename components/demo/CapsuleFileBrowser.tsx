"use client";

import { useState } from "react";

export interface CapsuleFile {
  name: string;
  note: string;
  content: string;
}

/**
 * Shows the real files of one captured run (the RUN_A fixture), exactly as they
 * sit on disk. The page reads them at build time; nothing is generated here.
 */
export default function CapsuleFileBrowser({ runId, files }: { runId: string; files: CapsuleFile[] }) {
  const [active, setActive] = useState(files[0]?.name ?? "");
  const file = files.find((f) => f.name === active) ?? files[0];
  if (!file) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
      <aside className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-3">
        <p className="px-2 py-1.5 mb-2 text-[11px] text-[var(--color-text-faint)] font-mono break-all">
          ~/.novafabric/capsules/{runId.slice(0, 10)}…/
        </p>
        <ul className="space-y-0.5" role="tablist" aria-label="Capsule files">
          {files.map((f) => (
            <li key={f.name}>
              <button
                type="button"
                role="tab"
                aria-selected={f.name === file.name}
                onClick={() => setActive(f.name)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm font-mono transition-colors ${
                  f.name === file.name
                    ? "bg-[var(--color-bg-sunken)] text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-sunken)] hover:text-[var(--color-text)]"
                }`}
              >
                {f.name}
                <span className="block text-[11px] text-[var(--color-text-faint)] font-sans">{f.note}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section
        role="tabpanel"
        aria-label={file.name}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-sunken)] overflow-hidden"
      >
        <header className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-raised)] flex items-center justify-between gap-3">
          <code className="font-mono text-sm text-[var(--color-text)]">{file.name}</code>
          <span className="text-[11px] text-[var(--color-text-faint)] font-mono">
            {new TextEncoder().encode(file.content).length.toLocaleString("en-US")} bytes
          </span>
        </header>
        <pre className="p-4 text-xs font-mono leading-relaxed text-[var(--color-text)] overflow-auto max-h-[480px] whitespace-pre">
          {file.content}
        </pre>
      </section>
    </div>
  );
}
