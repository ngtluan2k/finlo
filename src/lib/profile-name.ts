export function formatProfileDisplayName(
  firstName: string,
  lastName: string,
): string {
  return `${lastName.trim()} ${firstName.trim()}`.trim()
}
