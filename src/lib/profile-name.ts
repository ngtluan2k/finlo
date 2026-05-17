export function formatProfileDisplayName(
  firstName: string,
  lastName: string,
  displayName?: string | null,
): string {
  if (displayName?.trim()) {
    return displayName.trim()
  }
  return `${lastName.trim()} ${firstName.trim()}`.trim()
}
