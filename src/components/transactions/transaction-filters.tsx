import React from 'react'
import { Search, X } from 'lucide-react'
import type { Wallet, Category, TransactionType } from './types'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

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
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] flex flex-col gap-3 relative z-20">
      {/* Row 1: search + type */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <div className="flex-1">
          <Input
            id="transaction-search"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="size-4 text-zinc-400" />}
            rightIcon={
              <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 pointer-events-none mr-1.5">
                /
              </kbd>
            }
          />
        </div>

        <div className="w-full md:w-[180px] shrink-0">
          <Select
            value={typeFilter}
            searchable={false}
            placeholder={t('filters.type')}
            options={[
              { value: 'INCOME', label: t('filters.income') },
              { value: 'EXPENSE', label: t('filters.expense') },
              { value: 'TRANSFER', label: t('filters.transfer') },
            ]}
            onChange={setTypeFilter}
          />
        </div>
      </div>

      {/* Row 2: wallet, category, date range, clear */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Wallet — shows WalletType label */}
        <div className="w-[180px]">
          <Select
            value={walletFilter}
            onChange={setWalletFilter}
            placeholder={t('filters.wallet')}
            options={wallets.map((w) => ({
              value: w.id,
              label: w.name,
              subLabel: WALLET_TYPE_LABELS[w.type] ?? w.type,
            }))}
          />
        </div>

        {/* Category — filtered by CategoryType */}
        <div className="w-[180px]">
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder={t('filters.category')}
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
              subLabel: c.type === 'INCOME' ? '+' : '−',
            }))}
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <div className="w-[140px]">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              locale={locale}
            />
          </div>
          <span className="text-zinc-400">→</span>
          <div className="w-[140px]">
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              locale={locale}
            />
          </div>
        </div>

        {hasActiveFilter && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 rounded-xl bg-red-500/10 text-red-500 px-3 py-2 text-xs font-semibold hover:bg-red-500/20 transition-colors cursor-pointer h-10 border border-red-500/10"
          >
            <X className="size-3" />
            {t('filters.clearFilter')}
          </button>
        )}
      </div>
    </div>
  )
}
