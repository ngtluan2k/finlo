'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Plus, Filter, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BudgetSummaryCards } from '@/components/budgets/budget-summary-cards'
import { BudgetTable } from '@/components/budgets/budget-table'
import { BudgetSidebar } from '@/components/budgets/budget-sidebar'
import { BudgetFormModal } from '@/components/budgets/budget-form-modal'

export type BudgetItem = {
  id: string
  categoryId: string
  amount: string
  month: number
  year: number
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  spent: string
  category: {
    id: string
    name: string
    type: 'INCOME' | 'EXPENSE'
  }
  createdAt: string
  updatedAt: string
}

interface BudgetsClientProps {
  initialBudgets: BudgetItem[]
  initialMonth: number
  initialYear: number
}

export function BudgetsClient({ initialBudgets, initialMonth, initialYear }: BudgetsClientProps) {
  const t = useTranslations('budgets')
  const locale = useLocale()

  const [month, setMonth] = useState(initialMonth)
  const [year, setYear] = useState(initialYear)
  const [budgets, setBudgets] = useState<BudgetItem[]>(initialBudgets)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'saving' | 'investment'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null)

  // Fetch budgets when month/year changes
  useEffect(() => {
    // Skip initial render fetch since we have initialBudgets
    if (month === initialMonth && year === initialYear && budgets.length === initialBudgets.length) return

    let mounted = true
    const fetchBudgets = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/budgets?month=${month}&year=${year}`)
        if (!res.ok) throw new Error('Failed to fetch budgets')
        const data = await res.json()
        if (mounted) setBudgets(data)
      } catch (error) {
        console.error(error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchBudgets()

    return () => { mounted = false }
  }, [month, year, initialMonth, initialYear])

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(prev => prev - 1)
    } else {
      setMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(prev => prev + 1)
    } else {
      setMonth(prev => prev + 1)
    }
  }

  // Filter budgets based on active tab
  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      if (activeTab === 'all') return true
      if (activeTab === 'expense') return b.category.type === 'EXPENSE'
      if (activeTab === 'saving') return b.category.name.toLowerCase().includes('tiết kiệm') || b.category.name.toLowerCase().includes('saving')
      if (activeTab === 'investment') return b.category.name.toLowerCase().includes('đầu tư') || b.category.name.toLowerCase().includes('invest')
      return true
    })
  }, [budgets, activeTab])

  // Counts for tabs
  const counts = useMemo(() => {
    const expense = budgets.filter(b => b.category.type === 'EXPENSE').length
    const saving = budgets.filter(b => b.category.name.toLowerCase().includes('tiết kiệm') || b.category.name.toLowerCase().includes('saving')).length
    const investment = budgets.filter(b => b.category.name.toLowerCase().includes('đầu tư') || b.category.name.toLowerCase().includes('invest')).length
    return { all: budgets.length, expense, saving, investment }
  }, [budgets])

  // Format money helper
  const formatMoney = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(num)
  }

  const handleSaved = useCallback((saved: BudgetItem) => {
    setBudgets(prev => {
      const exists = prev.some(b => b.id === saved.id)
      if (exists) return prev.map(b => b.id === saved.id ? saved : b)
      return [saved, ...prev]
    })
  }, [])

  return (
    <div className="mx-auto flex w-full flex-col gap-6 text-zinc-900 dark:text-zinc-50 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center rounded-2xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="flex size-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="px-3 text-sm font-bold text-zinc-700 dark:text-zinc-200 min-w-[120px] text-center">
              {t('monthPrefix')} {month}, {year}
            </div>
            <button
              onClick={handleNextMonth}
              className="flex size-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <button className="flex h-10 items-center gap-2 rounded-2xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 transition shadow-sm">
            <Filter className="size-4" />
            <span className="hidden sm:inline">{t('filter')}</span>
          </button>
          <button
            onClick={() => { setEditingBudget(null); setFormOpen(true) }}
            className="flex h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#015C97] to-[#0172B2] px-4 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:shadow-[#015C97]/25 transition"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">{t('createBudget')}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <BudgetSummaryCards budgets={budgets} formatMoney={formatMoney} t={t} />

      {/* Main Content Layout */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        
        {/* Left column: List & Table */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Tabs & View Toggle */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-slate-800">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
              {(['all', 'expense', 'saving', 'investment'] as const).map(tab => {
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'whitespace-nowrap border-b-2 py-3 text-sm font-bold transition-colors',
                      isActive
                        ? 'border-[#015C97] text-[#015C97] dark:text-blue-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-slate-400 dark:hover:text-zinc-300'
                    )}
                  >
                    {t(`tabs.${tab}`, { count: counts[tab] })}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 hidden sm:flex">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg transition-all',
                  viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-700'
                )}
              >
                <ListIcon className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg transition-all',
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-700'
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <BudgetTable 
            budgets={filteredBudgets} 
            formatMoney={formatMoney} 
            t={t} 
            loading={loading}
            onEdit={(b) => { setEditingBudget(b); setFormOpen(true) }}
          />

        </div>

        {/* Right column: Sidebar */}
        <div className="w-full xl:w-[350px] shrink-0 space-y-6">
          <BudgetSidebar 
            budgets={budgets} 
            formatMoney={formatMoney} 
            t={t}
            month={month}
            year={year}
          />
        </div>
      </div>

      {/* Form Modal */}
      <BudgetFormModal 
        open={formOpen} 
        onClose={() => setFormOpen(false)} 
        budget={editingBudget} 
        onSuccess={handleSaved}
        month={month}
        year={year}
        t={t}
      />
    </div>
  )
}
