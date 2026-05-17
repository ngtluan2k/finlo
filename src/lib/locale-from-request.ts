import { defaultLocale, isLocale, type Locale } from '@/i18n/config'

export function localeFromRequest(request: Request): Locale {
  const cookie = request.headers.get('cookie') ?? ''
  const match = cookie.match(/(?:^|;\s*)locale=([^;]+)/)
  const value = match?.[1]?.trim()
  return value && isLocale(value) ? value : defaultLocale
}
