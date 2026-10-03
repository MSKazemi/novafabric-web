/**
 * Renders a counter value. The real value is always in the markup, never an
 * animated zero, so crawlers, link previews and visitors without JavaScript
 * read the true number ("425K", "220+", "Apache-2.0"). The previous version
 * started every counter at 0 and replaced the text on scroll, which put
 * "0K lines of code" and "Apache-0.0" into the static HTML.
 */
export default function CountUp({ value }: { value: string; duration?: number }) {
  return <span>{value}</span>;
}
