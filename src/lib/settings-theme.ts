import type { ThemePreference } from '@/generated/prisma/client'
import type { Theme } from '@/lib/theme'

const PREFERENCE_TO_THEME: Record<ThemePreference, Theme> = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
}

const THEME_TO_PREFERENCE: Record<Theme, ThemePreference> = {
  light: 'LIGHT',
  dark: 'DARK',
  system: 'SYSTEM',
}

export function preferenceToTheme(preference: ThemePreference): Theme {
  return PREFERENCE_TO_THEME[preference]
}

export function themeToPreference(theme: Theme): ThemePreference {
  return THEME_TO_PREFERENCE[theme]
}
