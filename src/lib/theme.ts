export const THEME_COOKIE = 'theme'
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const themes = ['light', 'dark', 'system'] as const
export type Theme = (typeof themes)[number]

export function isTheme(value: string | null | undefined): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

export function applyResolvedTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function applyTheme(theme: Theme) {
  applyResolvedTheme(resolveTheme(theme))
}

export function readThemeFromCookie(): Theme {
  if (typeof document === 'undefined') return 'system'
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`),
  )
  const value = match ? decodeURIComponent(match[1]) : null
  return isTheme(value) ? value : 'system'
}

export function writeThemeCookie(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${THEME_COOKIE_MAX_AGE};samesite=lax`
}
