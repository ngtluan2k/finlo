'use client'

import { useTranslations } from 'next-intl'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'

type ThemeSwitcherProps = {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('theme')
  
  const isDark = theme === 'dark' || theme === 'system'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('label')}
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-transparent text-white transition-all duration-200',
        'hover:border-white/40 hover:bg-white/10 hover:text-[#C0E8FB]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40',
        'active:scale-95',
        'dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/60 dark:hover:text-white',
        className
      )}
    >
      {isDark ? (
        <Moon className="size-4 transition-transform duration-300 group-hover:-rotate-12 hover:-rotate-12" />
      ) : (
        <Sun className="size-4 transition-transform duration-500 group-hover:rotate-90 hover:rotate-90" />
      )}
    </button>
  )
}
