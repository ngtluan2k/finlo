'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { routes } from '@/lib/routes'

export function SignOutButton() {
  const t = useTranslations('auth')

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: routes.login })}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      <LogOut className="size-4" aria-hidden />
      {t('signOut')}
    </button>
  )
}
