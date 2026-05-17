'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { themes, type Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const variants = {
  default: {
    trigger:
      'border-zinc-200 bg-white text-zinc-900 shadow-sm hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600',
    menu: 'border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-900/95 dark:shadow-black/50',
    item: 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10',
    itemActive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    icon: 'text-zinc-500 dark:text-zinc-400',
    chevron: 'text-zinc-400',
  },
  glass: {
    trigger:
      'border-white/15 bg-white/5 text-zinc-100 backdrop-blur-md hover:border-white/25 hover:bg-white/10',
    menu: 'border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/50 backdrop-blur-xl',
    item: 'text-zinc-300 hover:bg-white/10',
    itemActive: 'bg-emerald-500/15 text-emerald-400',
    icon: 'text-emerald-400/80',
    chevron: 'text-zinc-400',
  },
} as const

type ThemeSwitcherProps = {
  className?: string
  variant?: keyof typeof variants
}

export function ThemeSwitcher({
  className,
  variant = 'default',
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('theme')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const styles = variants[variant]
  const ActiveIcon = themeIcons[theme]

  function selectTheme(nextTheme: Theme) {
    if (nextTheme === theme) {
      setOpen(false)
      return
    }
    setTheme(nextTheme)
    setOpen(false)
  }

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
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={t('label')}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40',
          styles.trigger,
        )}
      >
        <ActiveIcon className={cn('size-4 shrink-0', styles.icon)} aria-hidden />
        <span className="max-w-28 truncate">{t(theme)}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform duration-200',
            styles.chevron,
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t('label')}
          className={cn(
            'absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-xl border p-1',
            'origin-top-right',
            styles.menu,
          )}
        >
          {themes.map((value) => {
            const selected = value === theme
            const Icon = themeIcons[value]
            return (
              <li key={value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectTheme(value)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:ring-inset',
                    selected ? styles.itemActive : styles.item,
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                    {t(value)}
                  </span>
                  {selected && (
                    <Check className="size-4 shrink-0 text-emerald-500" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
