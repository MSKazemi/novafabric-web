const PAPER = "NovaFabric: Tamper-Evident, Replayable Evidence for Autonomous AI Agent Runs";

/**
 * Homepage citation block. The paper is arXiv:2609.12582. The Zenodo DOI is a
 * software record (not the paper), so it is labelled as the software archive.
 */
export default function PaperCitation() {
  return (
    <section
      id="paper"
      style={{ backgroundColor: "var(--color-canvas)", padding: "56px 0", borderTop: "1px solid var(--color-edge)" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <p className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em", marginBottom: "14px" }}>
          paper/
        </p>
        <p style={{ fontSize: "17px", color: "var(--color-ink)", lineHeight: 1.5, maxWidth: "760px", marginBottom: "10px" }}>
          <a href="https://arxiv.org/abs/2609.12582" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "4px" }}>
            {PAPER}
          </a>
        </p>
        <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: 1.7 }}>
          Mohsen Seyedkazemi Ardebili · arXiv:2609.12582, September 2026 ·{" "}
          <a href="https://doi.org/10.48550/arXiv.2609.12582" style={{ color: "inherit" }}>doi:10.48550/arXiv.2609.12582</a>
          {" "}· software archive:{" "}
          <a href="https://doi.org/10.5281/zenodo.22997388" style={{ color: "inherit" }}>doi:10.5281/zenodo.22997388</a>
        </p>
      </div>
    </section>
  );
}
