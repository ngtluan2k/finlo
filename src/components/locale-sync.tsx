'use client'

import { useEffect } from 'react'
import type { Locale } from '@/i18n/config'

type LocaleSyncProps = {
  userLocale: Locale | null
  currentLocale: Locale
}

export function LocaleSync({ userLocale, currentLocale }: LocaleSyncProps) {
  useEffect(() => {
    if (userLocale && userLocale !== currentLocale) {
      document.cookie = `locale=${userLocale};path=/;max-age=31536000;samesite=lax`
      window.location.reload()
    }
  }, [userLocale, currentLocale])

  return null
}
