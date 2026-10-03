"use client";

/**
 * Validates a real capsule fixture against the real JSON Schema, in the reader's
 * browser.
 *
 * Both files are copies of what ships in the NovaFabric repository:
 * `schemas/run-capsule.schema.json` and a capture fixture. Nothing here is a
 * mock-up of a validator — Ajv compiles the actual 2020-12 schema and reports
 * what it finds.
 *
 * The "break it" control is the point of the whole component. A green check that
 * a page could have hard-coded proves nothing, and for a project whose pitch is
 * verifiable evidence, an unfalsifiable demo would be exactly the wrong thing to
 * ship. Removing a required field has to actually turn it red.
 */

import { useEffect, useMemo, useState } from "react";
import capsuleFixture from "@/lib/data/demo/capsule.json";
import schema from "@/lib/data/demo/run-capsule.schema.json";

type Tamper = "none" | "drop-required" | "wrong-type" | "bad-status";

const TAMPERS: { id: Tamper; label: string; blurb: string }[] = [
  { id: "none", label: "Untouched", blurb: "The fixture exactly as captured." },
  { id: "drop-required", label: "Delete run_id", blurb: "Remove a required field." },
  { id: "wrong-type", label: "duration_ms → string", blurb: "Break a field's type." },
  { id: "bad-status", label: 'status → "probably fine"', blurb: "Use a value outside the enum." },
];

interface Result {
  valid: boolean;
  errors: string[];
  ms: number;
}

function applyTamper(base: Record<string, unknown>, tamper: Tamper) {
  const doc = structuredClone(base);
  if (tamper === "drop-required") delete doc.run_id;
  if (tamper === "wrong-type") doc.duration_ms = "4127";
  if (tamper === "bad-status") doc.status = "probably fine";
  return doc;
}

export default function CapsuleValidator() {
  const [tamper, setTamper] = useState<Tamper>("none");
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);

  const doc = useMemo(
    () => applyTamper(capsuleFixture as unknown as Record<string, unknown>, tamper),
    [tamper],
  );

  // Re-validating whenever the document changes keeps the verdict and the JSON
  // on screen from ever disagreeing, which a manual "validate" button alone
  // cannot guarantee.
  useEffect(() => {
    let cancelled = false;
    setRunning(true);

    (async () => {
      // Ajv is ~120 kB. Loading it on demand keeps it off every other page.
      const [{ default: Ajv2020 }, { default: addFormats }] = await Promise.all([
        import("ajv/dist/2020"),
        import("ajv-formats"),
      ]);

      const started = performance.now();
      const ajv = new Ajv2020({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      const valid = validate(doc) as boolean;
      const ms = performance.now() - started;

      const errors = (validate.errors ?? []).map((e) => {
        const where = e.instancePath || "(root)";
        return `${where} ${e.message ?? "is invalid"}`;
      });

      if (!cancelled) {
        setResult({ valid, errors: errors.slice(0, 6), ms });
        setRunning(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doc]);

  const ok = result?.valid === true;

  return (
    <div
      style={{
        border: "1px solid var(--color-edge)",
        borderRadius: "10px",
        overflow: "hidden",
        background: "var(--color-surface)",
      }}
    >
      {/* Controls */}
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid var(--color-edge)",
          background: "var(--color-surface-2)",
        }}
      >
        <p className="font-code" style={{ fontSize: "11px", color: "var(--color-faint)", marginBottom: "10px" }}>
          TRY TO BREAK IT
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {TAMPERS.map((t) => {
            const active = tamper === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTamper(t.id)}
                title={t.blurb}
                className="font-code"
                style={{
                  fontSize: "11px",
                  padding: "6px 11px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  border: `1px solid ${active ? "var(--color-accent)" : "var(--color-edge-2)"}`,
                  background: active ? "var(--color-accent)" : "transparent",
                  color: active ? "var(--color-on-accent)" : "var(--color-muted)",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verdict */}
      <div
        aria-live="polite"
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid var(--color-edge)",
          background: running
            ? "transparent"
            : ok
              ? "color-mix(in srgb, var(--color-jade) 10%, transparent)"
              : "color-mix(in srgb, #d1495b 12%, transparent)",
        }}
      >
        <span style={{ fontSize: "16px" }} aria-hidden="true">
          {running ? "…" : ok ? "✓" : "✕"}
        </span>
        <span
          className="font-code"
          style={{
            fontSize: "12px",
            color: running ? "var(--color-muted)" : ok ? "var(--color-jade)" : "#d1495b",
          }}
        >
          {running
            ? "compiling run-capsule.schema.json…"
            : ok
              ? `valid against run-capsule.schema.json (${result?.ms.toFixed(1)} ms)`
              : `invalid — ${result?.errors.length} error${result?.errors.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* Errors */}
      {!running && !ok && result && (
        <ul
          style={{
            margin: 0,
            padding: "12px 18px",
            listStyle: "none",
            borderBottom: "1px solid var(--color-edge)",
          }}
        >
          {result.errors.map((e, i) => (
            <li
              key={i}
              className="font-code"
              style={{ fontSize: "11.5px", color: "var(--color-muted)", lineHeight: 1.9 }}
            >
              <span style={{ color: "#d1495b" }}>→</span> {e}
            </li>
          ))}
        </ul>
      )}

      {/* The document under test */}
      <pre
        style={{
          margin: 0,
          padding: "16px 18px",
          maxHeight: "320px",
          overflow: "auto",
          fontSize: "11.5px",
          lineHeight: 1.65,
          color: "var(--color-muted)",
          fontFamily: "var(--font-code), ui-monospace, monospace",
        }}
      >
        {JSON.stringify(doc, null, 2)}
      </pre>
    </div>
  );
}
