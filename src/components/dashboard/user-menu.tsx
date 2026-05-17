'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  BookOpen,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

type UserMenuProps = {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

const menuItems = [
  { key: 'profile' as const, icon: User, href: '#' },
  { key: 'settings' as const, icon: Settings, href: '#' },
  { key: 'docs' as const, icon: BookOpen, href: '#' },
]

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations('dashboard.userMenu')
  const tAuth = useTranslations('auth')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const initials = getInitials(user.name, user.email)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white py-1 pl-1 pr-2 text-sm transition',
          'hover:border-zinc-300 hover:bg-zinc-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40',
          'dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800',
        )}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="size-8 rounded-md object-cover"
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-md bg-linear-to-br from-blue-400 to-cyan-400 text-xs font-semibold text-zinc-950">
            {initials}
          </span>
        )}
        <span className="hidden max-w-32 truncate font-medium text-zinc-900 sm:inline dark:text-zinc-100">
          {user.name ?? user.email}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-zinc-400 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl',
            'dark:border-zinc-700 dark:bg-zinc-900',
          )}
        >
          <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user.name ?? '—'}
            </p>
            {user.email && (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            )}
          </div>

          {menuItems.map(({ key, icon: Icon, href }) => (
            <a
              key={key}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition',
                'hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
              )}
            >
              <Icon className="size-4 shrink-0 text-zinc-500" aria-hidden />
              {t(key)}
            </a>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void signOut({ callbackUrl: routes.login })
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition',
              'hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10',
            )}
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            {tAuth('signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
