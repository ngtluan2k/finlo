'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  applyTheme,
  readThemeFromCookie,
  resolveTheme,
  writeThemeCookie,
  type Theme,
} from '@/lib/theme'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  isPersisting: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

type ThemeProviderProps = {
  children: React.ReactNode
  userId?: string | null
  initialTheme?: Theme | null
}

export function ThemeProvider({
  children,
  userId = null,
  initialTheme = null,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme ?? 'system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [isPersisting, setIsPersisting] = useState(false)
  const hydratedRef = useRef(false)

  const syncResolved = useCallback((nextTheme: Theme) => {
    const resolved = resolveTheme(nextTheme)
    setResolvedTheme(resolved)
    applyTheme(nextTheme)
    writeThemeCookie(nextTheme)
  }, [])

  useEffect(() => {
    const stored =
      userId && initialTheme ? initialTheme : readThemeFromCookie()

    setThemeState(stored)
    syncResolved(stored)
    hydratedRef.current = true

    if (stored !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function onChange() {
      syncResolved('system')
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [initialTheme, syncResolved, userId])

  const persistTheme = useCallback(
    async (nextTheme: Theme) => {
      if (!userId) return

      setIsPersisting(true)
      try {
        const response = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: nextTheme }),
        })
        if (!response.ok) {
          console.error('[theme] failed to persist settings', response.status)
        }
      } catch (error) {
        console.error('[theme] failed to persist settings', error)
      } finally {
        setIsPersisting(false)
      }
    },
    [userId],
  )

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      syncResolved(nextTheme)

      if (userId && hydratedRef.current) {
        void persistTheme(nextTheme)
      }
    },
    [persistTheme, syncResolved, userId],
  )

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, isPersisting }),
    [theme, resolvedTheme, setTheme, isPersisting],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
