import Script from "next/script";

/**
 * Privacy-friendly, cookieless web analytics — no consent banner required.
 *
 * Disabled by default so no external script loads until you opt in. To enable,
 * pick ONE provider, fill in its id below, and set ANALYTICS_PROVIDER.
 *
 *  • Plausible (hosted, paid ~$9/mo, or self-hostable):
 *      set ANALYTICS_PROVIDER = "plausible"  (data-domain is already novafabric.ai)
 *      → sign up at https://plausible.io, add the domain novafabric.ai.
 *
 *  • Umami (free cloud tier, or self-host on the Hetzner VM — most on-brand):
 *      set ANALYTICS_PROVIDER = "umami" and UMAMI_WEBSITE_ID + UMAMI_SRC
 *      → https://umami.is (cloud) or self-host; create a website, copy its id.
 *
 * Both are GDPR-friendly and don't use cookies, so no cookie banner is needed.
 */

const ANALYTICS_PROVIDER: "none" | "plausible" | "umami" = "none";

const PLAUSIBLE_DOMAIN = "novafabric.ai";

const UMAMI_WEBSITE_ID = "PASTE_UMAMI_WEBSITE_ID";
const UMAMI_SRC = "https://cloud.umami.is/script.js"; // or your self-hosted URL

export default function Analytics() {
  if (ANALYTICS_PROVIDER === "plausible") {
    return (
      <Script
        defer
        data-domain={PLAUSIBLE_DOMAIN}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  if (ANALYTICS_PROVIDER === "umami") {
    return (
      <Script
        defer
        data-website-id={UMAMI_WEBSITE_ID}
        src={UMAMI_SRC}
        strategy="afterInteractive"
      />
    );
  }

  return null;
}
