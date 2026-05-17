'use client'

import { useState, useRef, useEffect } from 'react'
import {
  BarChart3,
  ChevronDown,
  Landmark,
  LayoutDashboard,
  LogOut,
  PieChart,
  PiggyBank,
  Receipt,
  Settings,
  ShieldCheck,
  Target,
  Wallet,
  Users,
  History,
  Sliders,
  ShieldAlert,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { FinloLogo } from '@/components/brand/finlo-logo'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/string'

const navSections = [
  {
    titleKey: 'sidebar.system' as const,
    isDropdown: true,
    labelKey: 'nav.systemManagement' as const,
    icon: Settings,
    requiredPermissions: ['user:read', 'role:read', 'permission:read', 'user:manage', 'role:manage'],
    items: [
      { href: routes.systemUsers, icon: Users, labelKey: 'nav.systemUsers' as const, requiredPermissions: ['user:read', 'user:manage'] },
      { href: routes.systemRoles, icon: ShieldAlert, labelKey: 'nav.systemRoles' as const, requiredPermissions: ['role:read', 'role:manage'] },
      { href: routes.systemActivityLog, icon: History, labelKey: 'nav.systemActivityLog' as const, requiredPermissions: ['user:read', 'user:manage'] },
      { href: '#', icon: Sliders, labelKey: 'nav.systemSettings' as const, disabled: true, requiredPermissions: ['permission:read'] },
    ],
  },
  {
    titleKey: 'sidebar.main' as const,
    isDropdown: false,
    items: [
      { href: routes.dashboard, icon: LayoutDashboard, labelKey: 'nav.overview' as const },
      { href: '#', icon: Receipt, labelKey: 'nav.transactions' as const, disabled: true, requiredPermissions: ['transaction:read'] },
      { href: '#', icon: Wallet, labelKey: 'nav.wallets' as const, disabled: true, requiredPermissions: ['wallet:read'] },
      { href: '#', icon: PiggyBank, labelKey: 'nav.budgets' as const, disabled: true, requiredPermissions: ['budget:read'] },
    ],
  },
  {
    titleKey: 'sidebar.planning' as const,
    isDropdown: false,
    items: [
      { href: '#', icon: Target, labelKey: 'nav.goals' as const, disabled: true },
      { href: '#', icon: Landmark, labelKey: 'nav.savings' as const, disabled: true },
    ],
  },
  {
    titleKey: 'sidebar.analytics' as const,
    isDropdown: false,
    items: [
      { href: '#', icon: BarChart3, labelKey: 'nav.reports' as const, disabled: true },
      { href: '#', icon: PieChart, labelKey: 'nav.analytics' as const, disabled: true },
    ],
  },
]

type DashboardSidebarProps = {
  open: boolean
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    permissions?: string[]
    isSuperAdmin?: boolean
  }
}

export function DashboardSidebar({ open, user }: DashboardSidebarProps) {
  const t = useTranslations('dashboard')
  const pathname = usePathname()
  
  const hasAccess = (requiredPermissions?: string[]) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true
    if (user?.isSuperAdmin) return true
    if (!user?.permissions) return false
    return requiredPermissions.some(p => user.permissions!.includes(p))
  }

  const [systemOpen, setSystemOpen] = useState(() => pathname.startsWith('/dashboard/system'))
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profileOpen) return

    function onPointerDown(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [profileOpen])

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform duration-200 ease-out',
        'bg-transparent', 
        'lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:overflow-hidden',
      )}
      aria-hidden={!open}
    >
      <Link
        href={routes.dashboard}
        className="flex h-16 shrink-0 items-center gap-2.5 px-6 relative"
      >
        <div className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-24 bg-white/10 blur-xl rounded-full" aria-hidden />
        <FinloLogo variant="full" priority className="relative z-10 h-8 brightness-[1.3] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all hover:brightness-[1.4]" />
      </Link>

      <nav 
        className="flex-1 space-y-6 overflow-y-auto p-4 px-3 [&::-webkit-scrollbar]:hidden" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Unified Render Sections */}
        {navSections.map((section) => {
          if ('requiredPermissions' in section && !hasAccess(section.requiredPermissions)) {
            return null
          }

          if (section.isDropdown) {
            const Icon = section.icon
            return (
              <div key={section.titleKey} className="space-y-1">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[#C0E8FB]/70 dark:text-slate-500">
                  {t(section.titleKey)}
                </p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setSystemOpen(!systemOpen)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition text-left cursor-pointer',
                      pathname.startsWith('/dashboard/system')
                        ? 'bg-white/5 text-white dark:bg-[#102A43]/50'
                        : 'text-[#C0E8FB] hover:bg-white/10 hover:text-white dark:text-slate-300 dark:hover:bg-[#102A43]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="size-4.5 shrink-0 text-[#C0E8FB]" />}
                      <span>{t(section.labelKey!) || 'Quản lý hệ thống'}</span>
                    </div>
                    <ChevronDown className={cn('size-4 text-[#C0E8FB] transition-transform duration-200', systemOpen && 'rotate-180')} />
                  </button>

                  {systemOpen && (
                    <div className="mt-1 ml-3 pl-3 border-l border-white/10 dark:border-slate-800 space-y-1 transition-all duration-200">
                      {section.items.map((subItem) => {
                        if ('requiredPermissions' in subItem && !hasAccess(subItem.requiredPermissions)) return null

                        const SubIcon = subItem.icon
                        const active = !subItem.disabled && pathname === subItem.href
                        const className = cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                          active
                            ? 'bg-white/15 text-white shadow-sm dark:bg-[#102A43] border border-white/5'
                            : 'text-[#C0E8FB]/90 hover:bg-white/10 hover:text-white dark:text-slate-400 dark:hover:bg-[#102A43]',
                          subItem.disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent dark:hover:bg-transparent'
                        )

                        if (subItem.disabled) {
                          return (
                            <span key={subItem.labelKey} className={className} aria-disabled>
                              <SubIcon className="size-4 shrink-0" aria-hidden />
                              <span>{t(subItem.labelKey)}</span>
                            </span>
                          )
                        }

                        return (
                          <Link key={subItem.labelKey} href={subItem.href} className={className}>
                            <SubIcon className="size-4 shrink-0" />
                            <span>{t(subItem.labelKey)}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          }

          return (
            <div key={section.titleKey} className="space-y-1">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[#C0E8FB]/70 dark:text-slate-500">
                {t(section.titleKey)}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  if ('requiredPermissions' in item && !hasAccess(item.requiredPermissions)) return null
                  const { href, icon: Icon, labelKey, disabled } = item

                  const active = !disabled && pathname === href
                  const className = cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    active
                      ? 'bg-[linear-gradient(135deg,#003f66_0%,#015c97_35%,#2d82b9_70%,#54a4d7_100%)] text-white shadow-md dark:bg-[linear-gradient(135deg,#002b45_0%,#003f66_45%,#015c97_100%)]'
                      : 'text-[#C0E8FB] hover:bg-white/10 hover:text-white dark:text-slate-300 dark:hover:bg-[#102A43] dark:hover:text-white',
                    disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent dark:hover:bg-transparent',
                  )

                  if (disabled) {
                    return (
                      <span key={labelKey} className={className} aria-disabled>
                        <Icon className="size-4.5 shrink-0" aria-hidden />
                        {t(labelKey)}
                      </span>
                    )
                  }

                  return (
                    <Link key={labelKey} href={href} className={className}>
                      <Icon className="size-4.5 shrink-0" aria-hidden />
                      {t(labelKey)}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="p-3" ref={profileRef}>
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 p-2 transition text-left hover:bg-white/10 dark:border-[#1E293B] dark:hover:bg-[#102A43]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#003f66_0%,#015c97_35%,#2d82b9_70%,#54a4d7_100%)] text-sm font-bold text-white shadow-md dark:bg-[linear-gradient(135deg,#002b45_0%,#003f66_45%,#015c97_100%)]">
              {getInitials(user?.name, user?.email)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-white">{user?.name || user?.email || 'User'}</p>
              <p className="truncate text-xs font-medium text-[#C0E8FB]">{user?.isSuperAdmin ? 'Quản trị viên' : 'Thành viên'}</p>
            </div>
            <ChevronDown className={cn('size-4 text-[#C0E8FB] transition-transform', profileOpen && 'rotate-180')} />
          </button>
          
          {profileOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  void signOut({ callbackUrl: routes.login })
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition',
                  'hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10',
                )}
              >
                <LogOut className="size-4 shrink-0" aria-hidden />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
