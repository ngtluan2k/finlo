'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Utensils,
  ShoppingCart,
  Car,
  Tv,
  FileText,
  CircleEllipsis,
  HeartPulse,
  GraduationCap,
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'

import { TransactionStats } from './transaction-stats'
import { TransactionFilters } from './transaction-filters'
import { TransactionTable } from './transaction-table'
import { TransactionAllocation } from './transaction-allocation'
import { TransactionBudget } from './transaction-budget'
import { TransactionWizardModal } from './transaction-wizard-modal'

import { useCurrency } from '@/hooks/use-currency'
import type {
  Transaction,
  Wallet,
  Category,
  TransactionType,
  TransactionStats as TStats,
} from './types'

export function TransactionsManagement() {
  const t = useTranslations('transactions')
  const locale = useLocale()
  const { formatMoney } = useCurrency()
  const searchParams = useSearchParams()
  const router = useRouter()


  // Core data
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('')
  const [walletFilter, setWalletFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(8)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Stats
  const [stats, setStats] = useState<TStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savingsRate: 0,
  })

  // UI state
  const [activeActionsId, setActiveActionsId] = useState<string | null>(null)

  // Wizard modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalStep, setModalStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTxType, setNewTxType] = useState<TransactionType>('EXPENSE')
  const [newTxAmount, setNewTxAmount] = useState('')
  const [newTxWalletId, setNewTxWalletId] = useState('')
  const [newTxToWalletId, setNewTxToWalletId] = useState('')
  const [newTxCategoryId, setNewTxCategoryId] = useState('')
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split('T')[0])
  const [newTxNote, setNewTxNote] = useState('')

  // ---------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------
  useEffect(() => {
    const handleOpenModal = () => {
      setShowAddModal(true)
      setModalStep(1)
    }
    window.addEventListener('open-add-transaction-modal', handleOpenModal)

    if (searchParams.get('add') === 'true') {
      setShowAddModal(true)
      setModalStep(1)
      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.delete('add')
      const qs = nextParams.toString()
      router.replace(`/transactions${qs ? `?${qs}` : ''}`)
    }

    return () => {
      window.removeEventListener('open-add-transaction-modal', handleOpenModal)
    }
  }, [searchParams, router])

  useEffect(() => {
    setMounted(true)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        document.getElementById('transaction-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Debounce search → reset to page 1
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  // ---------------------------------------------------
  // Data fetching
  // ---------------------------------------------------
  const fetchTransactionsData = async () => {
    setIsLoading(true)
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        query: debouncedSearch,
        type: typeFilter,
        walletId: walletFilter,
        categoryId: categoryFilter,
        startDate,
        endDate,
      })
      const res = await fetch(`/api/transactions?${qs}`)
      if (!res.ok) throw new Error('fetch-failed')
      const data = await res.json()
      setTransactions(data.transactions ?? [])
      setTotalCount(data.pagination.totalCount ?? 0)
      setTotalPages(data.pagination.totalPages ?? 1)
      setStats(data.stats ?? { totalIncome: 0, totalExpense: 0, balance: 0, savingsRate: 0 })
    } catch {
      toast.error(locale === 'vi' ? 'Không thể tải dữ liệu giao dịch' : 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFiltersData = async () => {
    try {
      const [wRes, cRes] = await Promise.all([fetch('/api/wallets'), fetch('/api/categories')])
      if (wRes.ok) {
        const wData: Wallet[] = await wRes.json()
        setWallets(wData)
        if (wData.length > 0) setNewTxWalletId(wData[0].id)
        if (wData.length > 1) setNewTxToWalletId(wData[1].id)
      }
      if (cRes.ok) {
        const cData: Category[] = await cRes.json()
        setCategories(cData)
        if (cData.length > 0) setNewTxCategoryId(cData[0].id)
      }
    } catch {
      console.error('Failed to load wallets/categories')
    }
  }

  useEffect(() => {
    if (mounted) fetchTransactionsData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, typeFilter, walletFilter, categoryFilter, startDate, endDate, mounted])

  useEffect(() => {
    if (mounted) fetchFiltersData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  // ---------------------------------------------------
  // Handlers
  // ---------------------------------------------------
  const handleClearFilters = () => {
    setSearch('')
    setTypeFilter('')
    setWalletFilter('')
    setCategoryFilter('')
    setStartDate('')
    setEndDate('')
    setPage(1)
    toast.success(locale === 'vi' ? 'Đã thiết lập lại bộ lọc' : 'Filters reset')
  }

  const handleAddSubmit = async () => {
    const amount = parseFloat(newTxAmount)
    if (!newTxAmount || isNaN(amount) || amount <= 0) {
      toast.error(t('modal.validationError'))
      return
    }
    if (newTxType === 'TRANSFER' && newTxWalletId === newTxToWalletId) {
      toast.error(
        locale === 'vi'
          ? 'Tài khoản đích không được trùng với tài khoản nguồn!'
          : 'Source and destination wallets must be different.'
      )
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          type: newTxType,
          walletId: newTxWalletId,
          toWalletId: newTxType === 'TRANSFER' ? newTxToWalletId : undefined,
          // TRANSFER has no category in our schema (categoryId is optional)
          categoryId: newTxType === 'TRANSFER' ? undefined : newTxCategoryId || undefined,
          transactionDate: newTxDate,
          note: newTxNote || undefined,
          // status defaults to COMPLETED in schema
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.code ?? 'unknown')
      }
      toast.success(t('modal.successAdd'))
      setShowAddModal(false)
      setModalStep(1)
      setNewTxAmount('')
      setNewTxNote('')
      setNewTxDate(new Date().toISOString().split('T')[0])
      await Promise.all([fetchTransactionsData(), fetchFiltersData()])
    } catch (err: any) {
      console.error(err)
      toast.error(t('modal.failAdd'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm(locale === 'vi' ? 'Bạn có chắc chắn muốn xóa giao dịch này?' : 'Delete this transaction?'))
      return
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete-failed')
      toast.success(locale === 'vi' ? 'Đã xóa giao dịch' : 'Transaction deleted')
      setActiveActionsId(null)
      await fetchTransactionsData()
      await fetchFiltersData()
    } catch {
      toast.error(locale === 'vi' ? 'Xóa giao dịch thất bại' : 'Failed to delete transaction')
    }
  }

  // ---------------------------------------------------
  // Visual helpers (category name → icon / colour)
  // ---------------------------------------------------
  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Ăn uống':    return <Utensils      className="size-3.5" />
      case 'Mua sắm':    return <ShoppingCart  className="size-3.5" />
      case 'Di chuyển':  return <Car           className="size-3.5" />
      case 'Giải trí':   return <Tv            className="size-3.5" />
      case 'Hóa đơn':   return <FileText       className="size-3.5" />
      case 'Sức khỏe':  return <HeartPulse    className="size-3.5" />
      case 'Giáo dục':  return <GraduationCap className="size-3.5" />
      default:           return <CircleEllipsis className="size-3.5" />
    }
  }

  const getCategoryColor = (name: string) => {
    switch (name) {
      case 'Ăn uống':   return 'bg-red-500/10    text-red-500    border border-red-500/20'
      case 'Mua sắm':   return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
      case 'Di chuyển': return 'bg-blue-500/10   text-blue-500   border border-blue-500/20'
      case 'Giải trí':  return 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
      case 'Hóa đơn':  return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
      case 'Sức khỏe': return 'bg-pink-500/10    text-pink-500   border border-pink-500/20'
      case 'Giáo dục': return 'bg-cyan-500/10    text-cyan-500   border border-cyan-500/20'
      case 'Lương':     return 'bg-teal-500/10   text-teal-500   border border-teal-500/20'
      case 'Thưởng':    return 'bg-indigo-500/10  text-indigo-500  border border-indigo-500/20'
      case 'Đầu tư':   return 'bg-orange-500/10  text-orange-500  border border-orange-500/20'
      default:           return 'bg-zinc-500/10   text-zinc-500   border border-zinc-500/20'
    }
  }

  // ---------------------------------------------------
  // Derived data for charts & budget panels
  // ---------------------------------------------------
  const expenseDataMap = new Map<string, number>()
  transactions.forEach((tx) => {
    if (tx.type === 'EXPENSE' && tx.category) {
      const amt = Number(tx.amount)
      expenseDataMap.set(tx.category.name, (expenseDataMap.get(tx.category.name) ?? 0) + amt)
    }
  })

  const donutColors: Record<string, string> = {
    'Ăn uống':  '#ef4444',
    'Mua sắm':  '#eab308',
    'Di chuyển':'#3b82f6',
    'Giải trí': '#a855f7',
    'Hóa đơn': '#10b981',
    'Sức khỏe':'#ec4899',
    'Giáo dục':'#06b6d4',
  }
  const donutData = Array.from(expenseDataMap.entries()).map(([name, value]) => ({
    name,
    value,
    color: donutColors[name] ?? '#6366f1',
  }))
  const totalExpenseSum = donutData.reduce((s, d) => s + d.value, 0)

  const budgetLimits = [
    { name: 'Ăn uống',  limit: 3_000_000, color: 'bg-red-500'    },
    { name: 'Mua sắm',  limit: 2_000_000, color: 'bg-yellow-500' },
    { name: 'Di chuyển',limit: 1_000_000, color: 'bg-blue-500'   },
  ]
  const budgetProgress = budgetLimits.map((b) => {
    const spent = expenseDataMap.get(b.name) ?? 0
    const pct   = Math.min(100, Math.round((spent / b.limit) * 100))
    return { ...b, spent, pct }
  })

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
  return (
    <div className="mx-auto flex w-full flex-col gap-6 text-zinc-900 dark:text-zinc-50 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => { setModalStep(1); setShowAddModal(true) }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#015C97] hover:bg-[#003F66] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200"
        >
          <Plus className="size-4" />
          {t('addTransaction')}
        </button>
      </div>

      {/* Stats row */}
      <TransactionStats stats={stats} formatMoney={formatMoney} t={t} />

      {/* Main 70/30 grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — filters + table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <TransactionFilters
            search={search}            setSearch={setSearch}
            typeFilter={typeFilter}    setTypeFilter={(v) => setTypeFilter(v as TransactionType | '')}
            walletFilter={walletFilter}      setWalletFilter={setWalletFilter}
            categoryFilter={categoryFilter}  setCategoryFilter={setCategoryFilter}
            startDate={startDate}      setStartDate={setStartDate}
            endDate={endDate}          setEndDate={setEndDate}
            wallets={wallets}
            categories={categories}
            handleClearFilters={handleClearFilters}
            t={t}
            locale={locale}
          />
          <TransactionTable
            isLoading={isLoading}
            transactions={transactions}
            page={page}               setPage={setPage}
            limit={limit}             setLimit={setLimit}
            totalCount={totalCount}
            totalPages={totalPages}
            activeActionsId={activeActionsId}  setActiveActionsId={setActiveActionsId}
            handleDeleteTransaction={handleDeleteTransaction}
            formatMoney={formatMoney}
            getCategoryColor={getCategoryColor}
            getCategoryIcon={getCategoryIcon}
            t={t}
            locale={locale}
          />
        </div>

        {/* Right — chart + budgets */}
        <div className="flex flex-col gap-6">
          <TransactionAllocation
            donutData={donutData}
            totalExpenseSum={totalExpenseSum}
            formatMoney={formatMoney}
            mounted={mounted}
            t={t}
            locale={locale}
          />
          <TransactionBudget budgetProgress={budgetProgress} formatMoney={formatMoney} t={t} />
        </div>
      </div>

      {/* Wizard */}
      <TransactionWizardModal
        showAddModal={showAddModal}        setShowAddModal={setShowAddModal}
        modalStep={modalStep}              setModalStep={setModalStep}
        isSubmitting={isSubmitting}
        newTxType={newTxType}              setNewTxType={setNewTxType}
        newTxAmount={newTxAmount}          setNewTxAmount={setNewTxAmount}
        newTxWalletId={newTxWalletId}      setNewTxWalletId={setNewTxWalletId}
        newTxToWalletId={newTxToWalletId}  setNewTxToWalletId={setNewTxToWalletId}
        newTxCategoryId={newTxCategoryId}  setNewTxCategoryId={setNewTxCategoryId}
        newTxDate={newTxDate}              setNewTxDate={setNewTxDate}
        newTxNote={newTxNote}              setNewTxNote={setNewTxNote}
        wallets={wallets}
        categories={categories}
        handleAddSubmit={handleAddSubmit}
        formatMoney={formatMoney}
        t={t}
        locale={locale}
      />
    </div>
  )
}


