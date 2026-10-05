/** Tiny class name joiner — keeps JSX readable without pulling in a utility lib. */
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ')
}
