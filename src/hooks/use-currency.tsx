'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { DEFAULT_CURRENCY, formatCurrency } from '@/lib/currency'

interface CurrencyContextType {
  currency: string
  isLoading: boolean
  formatMoney: (amount: string | number) => string
  updateCurrency: (code: string) => Promise<boolean>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch settings from API on mount
  useEffect(() => {
    let active = true
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const settings = await res.json()
          const prefCurrency = settings.preferences?.currency
          if (prefCurrency && active) {
            setCurrencyState(prefCurrency)
          }
        }
      } catch (err) {
        console.error('Failed to load currency setting:', err)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadSettings()
    return () => {
      active = false
    }
  }, [])

  // Format currency dynamically based on current selected currency
  const formatMoney = useCallback(
    (amount: string | number) => {
      return formatCurrency(amount, currency)
    },
    [currency]
  )

  // Update preferred currency via settings PATCH API
  const updateCurrency = useCallback(async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: { currency: code },
        }),
      })

      if (res.ok) {
        setCurrencyState(code)
        // Disseminate custom event to other components listening to setting changes
        window.dispatchEvent(new CustomEvent('currency-changed', { detail: code }))
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to update currency setting:', err)
      return false
    }
  }, [])

  // Listen to external setting updates (e.g. from profile page settings card)
  useEffect(() => {
    const handleExternalChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setCurrencyState(customEvent.detail)
      }
    }
    window.addEventListener('currency-changed', handleExternalChange)
    return () => {
      window.removeEventListener('currency-changed', handleExternalChange)
    }
  }, [])

  return (
    <CurrencyContext.Provider value={{ currency, isLoading, formatMoney, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
