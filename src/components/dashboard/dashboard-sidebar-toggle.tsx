'use client'

import { ChevronsLeft, Menu } from 'lucide-react'
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
        'inline-flex size-9 items-center justify-center rounded-xl border transition',
        'border-white/20 bg-transparent text-white shadow-sm',
        'hover:border-white/30 hover:bg-white/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54A4D7]',
        'dark:border-[#1E293B] dark:bg-transparent dark:text-slate-300',
        'dark:hover:bg-[#102A43] dark:hover:text-white',
        className,
      )}
    >
      {open ? (
        <ChevronsLeft className="size-4" aria-hidden />
      ) : (
        <Menu className="size-4" aria-hidden />
      )}
    </button>
  )
}
