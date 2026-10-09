"use client";

import { useEffect, useRef, useState } from "react";

interface CodeBlockProps {
  code: string;
  lang?: string;
  className?: string;
}

export default function CodeBlock({ code, lang = "bash", className = "" }: CodeBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const { codeToHtml } = await import("shiki");
        const rendered = await codeToHtml(code, {
          lang,
          theme: "github-dark",
        });
        // Same comment-contrast fix as lib/markdown.ts (#6A737D is 3.05:1 here).
        if (!cancelled) setHtml(rendered.replace(/color:#6A737D/gi, "color:#959DA5"));
      },
      { rootMargin: "200px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [code, lang]);

  return (
    <div
      ref={ref}
      // Shiki renders with the github-dark theme, so this surface is always a
      // dark stage (matches the syntax palette) and lifts off the light canvas.
      data-theme="dark"
      className={`rounded-lg overflow-hidden border border-edge-2 text-[13px] leading-relaxed shadow-card-md ${className}`}
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {html ? (
        <div
          className="[&_pre]:!bg-transparent [&_pre]:p-4 [&_code]:font-code"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="p-4 font-code text-muted overflow-x-auto">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
