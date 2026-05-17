'use client'

import { PanelLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type DashboardSidebarToggleProps = {
  open: boolean
  onToggle: () => void
  className?: string
}

export function DashboardSidebarToggle({
  open,
  onToggle,
  className,
}: DashboardSidebarToggleProps) {
  const t = useTranslations('dashboard')

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? t('header.closeSidebar') : t('header.openSidebar')}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border transition',
        'border-zinc-200 bg-zinc-50 text-zinc-700 shadow-sm',
        'hover:border-zinc-300 hover:bg-zinc-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40',
        'dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
        'dark:hover:border-zinc-600 dark:hover:bg-zinc-700',
        className,
      )}
    >
      <PanelLeft className="size-4" aria-hidden />
    </button>
  )
}
