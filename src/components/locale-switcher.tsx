'use client'

import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { locales, type Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

type LocaleSwitcherProps = {
  className?: string
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const locale = useLocale() as Locale
  const t = useTranslations('locale')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { data: session } = useSession()
  
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

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

  function handleLocaleChange(nextLocale: Locale) {
    if (nextLocale === locale || isPending) return
    
    startTransition(async () => {
      document.cookie = `locale=${nextLocale};path=/;max-age=31536000;samesite=lax`
      
      if (session?.user) {
        try {
          await fetch('/api/profile/locale', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locale: nextLocale }),
          })
        } catch (error) {
          console.error('Failed to update database profile locale:', error)
        }
      }
      
      window.location.reload()
    })
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn('relative inline-flex items-center', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={isPending}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-9 items-center gap-2 rounded-full border border-white/20 bg-transparent pl-3 pr-2.5 text-xs font-bold text-white transition hover:bg-white/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40',
          'disabled:cursor-wait disabled:opacity-60',
          'dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/60',
          open && 'bg-white/10 dark:bg-zinc-800/60'
        )}
      >
        <Globe className="size-4 shrink-0 text-[#C0E8FB]" aria-hidden />
        <span className="uppercase tracking-wider">{locale}</span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 text-white/70 transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-44 origin-top-right overflow-hidden rounded-xl border border-zinc-200/80 bg-white/95 p-1 shadow-xl backdrop-blur-md transition-all duration-150',
            'dark:border-zinc-700/60 dark:bg-[#0f1c2b]/95',
          )}
        >
          {locales.map((value) => {
            const isActive = value === locale
            return (
              <button
                key={value}
                type="button"
                role="menuitem"
                disabled={isPending}
                onClick={() => handleLocaleChange(value)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-zinc-700 transition',
                  'hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50 disabled:cursor-wait',
                  'dark:text-zinc-300 dark:hover:bg-[#102a43] dark:hover:text-white',
                  isActive && 'bg-primary-50/70 text-primary-700 dark:bg-[#102a43]/70 dark:text-white'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="uppercase text-[9px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1 py-0.5 rounded font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                    {value}
                  </span>
                  <span>{t(value)}</span>
                </span>
                {isActive && <Check className="size-3.5 shrink-0 text-primary-600 dark:text-brand-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
