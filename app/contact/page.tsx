import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import { PageHero, SectionHeader } from "@/components/ui";
import ContactForm from "@/components/contact/ContactForm";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Contact — NovaFabric Lab",
  description:
    "Get in touch with NovaFabric Lab — questions, feedback, collaboration, or contributions to the open-source AI-agent monitoring and evidence project.",
  alternates: { canonical: "https://novafabric.ai/contact/" },
  openGraph: {
    title: "Contact — NovaFabric Lab",
    description:
      "Questions, feedback, or collaboration on NovaFabric — local-first monitoring and evidence infrastructure for AI agents.",
    url: "https://novafabric.ai/contact/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — NovaFabric Lab",
  url: "https://novafabric.ai/contact",
  description:
    "Contact NovaFabric Lab for questions, feedback, collaboration, or contributions.",
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactSchema} />
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Contact", path: "/contact/" }]} />

      <PageHero
        section="contact"
        title="Contact"
        subtitle="Questions, feedback, collaboration, or a capsule to share — send a note and we'll get back to you."
      />

      <main className="page-max-w py-16">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Form */}
          <div>
            <SectionHeader number="01" title="Send a message" />
            <ContactForm />
          </div>

          {/* Other ways */}
          <div>
            <SectionHeader number="02" title="Other ways to reach us" />
            <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "420px" }}>
              <ContactRow
                label="email"
                value="hello@novafabric.ai"
                href="mailto:hello@novafabric.ai"
              />
              <ContactRow
                label="github"
                value="github.com/MSKazemi/novafabric"
                href="https://github.com/MSKazemi/novafabric"
                external
              />
              <ContactRow
                label="contribute"
                value="Open an issue or PR"
                href="https://github.com/MSKazemi/novafabric/blob/main/CONTRIBUTING.md"
                external
              />
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-faint)",
                  lineHeight: 1.7,
                  marginTop: "4px",
                }}
              >
                NovaFabric is an experimental, open-source research project. For
                technical issues, GitHub is the fastest path; for everything else,
                the form works well.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function ContactRow({
  label,
  value,
  href,
  external,
}: {
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <div>
      <div
        className="font-code"
        style={{
          fontSize: "10px",
          color: "var(--color-faint)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="font-code"
        style={{
          fontSize: "14px",
          color: "var(--color-amber)",
          textDecoration: "none",
        }}
      >
        {value}
        {external ? " ↗" : ""}
      </a>
    </div>
  );
}
