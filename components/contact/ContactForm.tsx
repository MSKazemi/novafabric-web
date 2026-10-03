"use client";

import { useState } from "react";

// Web3Forms access key — get a free one at https://web3forms.com (enter hello@novafabric.ai).
// Public by design: it only allows submissions to the inbox tied to the key.
const WEB3FORMS_ACCESS_KEY = "e8a71d77-3aa9-4d11-bb5c-1d038246554a";

type FormState = "idle" | "sending" | "sent" | "error";

const inputBase: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-edge-2)",
  borderRadius: "4px",
  padding: "12px 14px",
  // 16px so iOS Safari does not auto-zoom the viewport when a field is focused.
  fontSize: "16px",
  color: "var(--color-ink)",
  fontFamily: "var(--font-body), sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelBase: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-code), monospace",
  fontSize: "11px",
  color: "var(--color-muted)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot — bots fill hidden fields; humans don't.
    if (data.botcheck) return;

    setState("sending");
    setError("");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: "New message from novafabric.ai",
          from_name: "NovaFabric Contact Form",
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setState("sent");
        form.reset();
      } else {
        setState("error");
        setError(json.message || "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setError("Network error. Please try again or email us directly.");
    }
  }

  if (state === "sent") {
    return (
      <div
        style={{
          border: "1px solid color-mix(in srgb, var(--color-jade) 30%, transparent)",
          backgroundColor: "var(--color-jade-glow)",
          borderRadius: "6px",
          padding: "32px",
          maxWidth: "560px",
        }}
      >
        <div
          className="font-code"
          style={{ fontSize: "13px", color: "var(--color-jade)", marginBottom: "8px" }}
        >
          ✓ message sent
        </div>
        <p style={{ fontSize: "15px", color: "var(--color-muted)", lineHeight: 1.7 }}>
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
        <button
          onClick={() => setState("idle")}
          className="font-code"
          style={{
            marginTop: "20px",
            background: "none",
            border: "1px solid var(--color-edge-2)",
            borderRadius: "3px",
            color: "var(--color-muted)",
            padding: "6px 12px",
            fontSize: "11px",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "560px" }}>
      {/* Honeypot */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px" }}
        aria-hidden="true"
      />

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="name" style={labelBase}>
          name
        </label>
        <input id="name" name="name" type="text" required maxLength={100} style={inputBase} />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="email" style={labelBase}>
          email
        </label>
        <input id="email" name="email" type="email" required maxLength={150} style={inputBase} />
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label htmlFor="message" style={labelBase}>
          message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={4000}
          style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={state === "sending"}
          className="font-code"
          style={{
            backgroundColor: "var(--color-amber)",
            color: "var(--color-canvas)",
            border: "none",
            borderRadius: "4px",
            padding: "11px 22px",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.04em",
            cursor: state === "sending" ? "default" : "pointer",
            opacity: state === "sending" ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {state === "sending" ? "sending…" : "send message"}
        </button>
        {state === "error" && (
          <span style={{ fontSize: "13px", color: "#e05a5a" }}>{error}</span>
        )}
      </div>
    </form>
  );
}
