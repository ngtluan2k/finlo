'use client'

import {
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FinloLogo } from '@/components/brand/finlo-logo'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

const navItems = [
  { href: routes.dashboard, icon: LayoutDashboard, labelKey: 'nav.overview' as const },
  { href: '#', icon: Wallet, labelKey: 'nav.wallets' as const, disabled: true },
  { href: '#', icon: Receipt, labelKey: 'nav.transactions' as const, disabled: true },
  { href: '#', icon: PiggyBank, labelKey: 'nav.budgets' as const, disabled: true },
]

type DashboardSidebarProps = {
  open: boolean
}

export function DashboardSidebar({ open }: DashboardSidebarProps) {
  const t = useTranslations('dashboard')
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white transition-transform duration-200 ease-out dark:bg-zinc-900',
        'lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:overflow-hidden lg:border-r-0',
      )}
      aria-hidden={!open}
    >
      <Link
        href={routes.dashboard}
        className="flex h-14 shrink-0 items-center gap-2.5 border-b border-zinc-200 px-4 dark:border-zinc-800"
      >
        <FinloLogo variant="full" className="h-8" />
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto border-r border-zinc-200 p-3 dark:border-zinc-800">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {t('sidebar.label')}
        </p>
        {navItems.map(({ href, icon: Icon, labelKey, disabled }) => {
          const active = !disabled && pathname === href
          const className = cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
            active
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
            disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent dark:hover:bg-transparent',
          )

          if (disabled) {
            return (
              <span key={labelKey} className={className} aria-disabled>
                <Icon className="size-4 shrink-0" aria-hidden />
                {t(labelKey)}
              </span>
            )
          }

          return (
            <Link key={labelKey} href={href} className={className}>
              <Icon className="size-4 shrink-0" aria-hidden />
              {t(labelKey)}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
