'use client'

import { ArrowRightLeft, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserMenu } from '@/components/dashboard/user-menu'
import { useRouter } from 'next/navigation'
import { NotificationDropdown } from '@/components/dashboard/notification-dropdown'

import { DashboardSidebarToggle } from '@/components/dashboard/dashboard-sidebar-toggle'

type DashboardHeaderProps = {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function DashboardHeader({ user, sidebarOpen, onToggleSidebar }: DashboardHeaderProps) {
  const t = useTranslations('dashboard')
  const router = useRouter()

  const handleAddTransactionClick = () => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    if (pathname.includes('/transactions')) {
      window.dispatchEvent(new CustomEvent('open-add-transaction-modal'))
    } else {
      router.push('/transactions?add=true')
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 bg-transparent px-4 sm:px-6">
      <DashboardSidebarToggle open={sidebarOpen} onToggle={onToggleSidebar} />
      
      <div className="min-w-0 flex-1 sm:pl-4">
        <div className="relative max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#C0E8FB]/70 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="h-9 w-full rounded-xl border border-transparent bg-white/10 pl-10 pr-12 text-sm text-white placeholder:text-[#C0E8FB]/70 focus:outline-none focus:border-[#54A4D7] focus:ring-1 focus:ring-[#54A4D7] dark:bg-[#0f1c2b] dark:text-white"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white dark:bg-slate-800 dark:text-slate-400">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button 
          onClick={handleAddTransactionClick}
          className="flex size-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 dark:border-[#1E293B] dark:hover:bg-[#102A43]"
        >
          <ArrowRightLeft className="size-4" />
        </button>

        <NotificationDropdown />

        <div className="h-6 w-px bg-white/20 dark:bg-[#1E293B] mx-1 hidden sm:block"></div>

        <LocaleSwitcher />
        <ThemeSwitcher />
      </div>
    </header>
  )
}
