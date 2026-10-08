/** Join truthy class names. A dependency-free stand-in for `clsx`, enough for the demo islands. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
