import React from 'react'
import { Search, Calendar, X } from 'lucide-react'
import type { Wallet, Category, TransactionType } from './types'

interface FiltersProps {
  search: string
  setSearch: (v: string) => void
  typeFilter: TransactionType | ''
  setTypeFilter: (v: string) => void
  walletFilter: string
  setWalletFilter: (v: string) => void
  categoryFilter: string
  setCategoryFilter: (v: string) => void
  startDate: string
  setStartDate: (v: string) => void
  endDate: string
  setEndDate: (v: string) => void
  wallets: Wallet[]
  categories: Category[]
  handleClearFilters: () => void
  t: any
  locale: string
}

const WALLET_TYPE_LABELS: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK: 'Ngân hàng',
  E_WALLET: 'Ví điện tử',
  CREDIT_CARD: 'Thẻ tín dụng',
  OTHER: 'Khác',
}

export function TransactionFilters({
  search, setSearch,
  typeFilter, setTypeFilter,
  walletFilter, setWalletFilter,
  categoryFilter, setCategoryFilter,
  startDate, setStartDate,
  endDate, setEndDate,
  wallets, categories,
  handleClearFilters,
  t, locale,
}: FiltersProps) {
  const hasActiveFilter = !!(search || typeFilter || walletFilter || categoryFilter || startDate || endDate)

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] flex flex-col gap-3">
      {/* Row 1: search + type */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="transaction-search"
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-10 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#015C97] focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-primary-700"
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 pointer-events-none">
            /
          </kbd>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-[#015C97] dark:border-zinc-800 dark:bg-[#0c0c0e]"
        >
          <option value="">{t('filters.type')}</option>
          <option value="INCOME">{t('filters.income')}</option>
          <option value="EXPENSE">{t('filters.expense')}</option>
          <option value="TRANSFER">{t('filters.transfer')}</option>
        </select>
      </div>

      {/* Row 2: wallet, category, date range, clear */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Wallet — shows WalletType label */}
        <select
          value={walletFilter}
          onChange={(e) => setWalletFilter(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#015C97] dark:border-zinc-800 dark:bg-[#0c0c0e] cursor-pointer"
        >
          <option value="">{t('filters.wallet')}</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} · {WALLET_TYPE_LABELS[w.type] ?? w.type}
            </option>
          ))}
        </select>

        {/* Category — filtered by CategoryType */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#015C97] dark:border-zinc-800 dark:bg-[#0c0c0e] cursor-pointer"
        >
          <option value="">{t('filters.category')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type === 'INCOME' ? '+' : '−'})
            </option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-xs dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <Calendar className="size-3 text-zinc-500 shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent outline-none cursor-pointer"
          />
          <span className="text-zinc-400 px-1">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent outline-none cursor-pointer"
          />
        </div>

        {hasActiveFilter && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 rounded-xl bg-red-500/10 text-red-500 px-3 py-1.5 text-xs font-semibold hover:bg-red-500/20 transition-colors"
          >
            <X className="size-3" />
            {t('filters.clearFilter')}
          </button>
        )}
      </div>
    </div>
  )
}
