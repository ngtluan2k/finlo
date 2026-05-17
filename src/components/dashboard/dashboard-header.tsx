'use client'

import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserMenu } from '@/components/dashboard/user-menu'

type DashboardHeaderProps = {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const t = useTranslations('dashboard')

  return (
    <header className="flex h-14 items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="min-w-0 flex-1 pl-6 sm:pl-8">
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('header.menu')}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeSwitcher />
        <LocaleSwitcher />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
