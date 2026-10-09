import Script from "next/script";

/**
 * Cookieless web analytics, off by default: no external script loads while
 * ANALYTICS_PROVIDER is "none" (the deployed setting). Enabling it is an owner
 * decision (privacy, consent and budget), not a code change to make in passing:
 * "cookieless" does not by itself settle whether consent or a notice is needed.
 *
 *  • Plausible (hosted or self-hosted): ANALYTICS_PROVIDER = "plausible"
 *    (data-domain is already novafabric.ai).
 *  • Umami (cloud or self-hosted): ANALYTICS_PROVIDER = "umami", plus
 *    UMAMI_WEBSITE_ID and UMAMI_SRC.
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
