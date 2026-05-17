'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import {
  Search, Filter, Plus,
  Wallet, Landmark, CreditCard, LayoutGrid, List, Settings,
  MoreVertical, Pencil, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { WalletSummary } from '@/components/wallets/wallet-summary'
import { WalletDetail } from '@/components/wallets/wallet-detail'
import { WalletFormModal } from '@/components/wallets/wallet-form-modal'

export type WalletTransaction = {
  id: string
  amount: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  status: string
  note: string | null
  transactionDate: string
  createdAt: string
  categoryName: string | null
  categoryType: string | null
}

export type WalletItem = {
  id: string
  name: string
  balance: string
  type: 'CASH' | 'BANK' | 'E_WALLET' | 'CREDIT_CARD' | 'OTHER'
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  metadata?: Record<string, any> | null
  createdAt: string
  updatedAt: string
  transactions: WalletTransaction[]
}

type TabKey = 'all' | 'wallet' | 'bank' | 'credit_card'

const WALLET_TYPES: Record<string, WalletItem['type'][]> = {
  all: [],
  wallet: ['CASH', 'E_WALLET', 'OTHER'],
  bank: ['BANK'],
  credit_card: ['CREDIT_CARD'],
}

export function WalletsClient({ initialWallets }: { initialWallets: WalletItem[] }) {
  const t = useTranslations('wallets')
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [wallets, setWallets] = useState<WalletItem[]>(initialWallets)
  const [selectedId, setSelectedId] = useState<string | null>(initialWallets[0]?.id ?? null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [formOpen, setFormOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletItem | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const openCreate = useCallback(() => { setEditingWallet(null); setFormOpen(true) }, [])
  const openEdit   = useCallback((w: WalletItem) => { setEditingWallet(w); setFormOpen(true) }, [])
  const closeForm  = useCallback(() => setFormOpen(false), [])

  const handleSaved = useCallback((saved: WalletItem) => {
    setWallets(prev => {
      const exists = prev.some(w => w.id === saved.id)
      if (exists) return prev.map(w => w.id === saved.id ? saved : w)
      return [saved, ...prev]
    })
    setSelectedId(saved.id)
  }, [])

  const formatMoney = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(num)
  }

  // Counts
  const walletCount = wallets.filter(w => ['CASH', 'E_WALLET', 'OTHER'].includes(w.type)).length
  const bankCount = wallets.filter(w => w.type === 'BANK').length
  const creditCardCount = wallets.filter(w => w.type === 'CREDIT_CARD').length

  // Summary stats
  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0)
  const walletBalance = wallets.filter(w => ['CASH', 'E_WALLET', 'OTHER'].includes(w.type)).reduce((s, w) => s + parseFloat(w.balance), 0)
  const bankBalance = wallets.filter(w => w.type === 'BANK').reduce((s, w) => s + parseFloat(w.balance), 0)
  const creditBalance = wallets.filter(w => w.type === 'CREDIT_CARD').reduce((s, w) => s + parseFloat(w.balance), 0)

  // Filtered wallets
  const filteredWallets = useMemo(() => {
    let result = wallets
    if (activeTab !== 'all') {
      const types = WALLET_TYPES[activeTab]
      result = result.filter(w => types.includes(w.type))
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(w => w.name.toLowerCase().includes(q))
    }
    return result
  }, [wallets, activeTab, searchQuery])

  const selectedWallet = wallets.find(w => w.id === selectedId) ?? null

  const getTypeLabel = (type: WalletItem['type']) => {
    switch (type) {
      case 'CASH': case 'E_WALLET': case 'OTHER': return t('types.wallet')
      case 'BANK': return t('types.bank')
      case 'CREDIT_CARD': return t('types.creditCard')
    }
  }

  const getTypeIcon = (type: WalletItem['type']) => {
    switch (type) {
      case 'CASH': case 'E_WALLET': case 'OTHER': return Wallet
      case 'BANK': return Landmark
      case 'CREDIT_CARD': return CreditCard
    }
  }

  const getTypeColor = (type: WalletItem['type']) => {
    switch (type) {
      case 'CASH': case 'E_WALLET': case 'OTHER':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/15'
      case 'BANK':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/15'
      case 'CREDIT_CARD':
        return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/15'
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: t('tabs.all', { count: wallets.length }) },
    { key: 'wallet', label: t('tabs.wallets', { count: walletCount }) },
    { key: 'bank', label: t('tabs.banks', { count: bankCount }) },
    { key: 'credit_card', label: t('tabs.creditCards', { count: creditCardCount }) },
  ]

  return (
    <div className="mx-auto flex w-full flex-col gap-6 text-zinc-900 dark:text-zinc-50 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('title')}</h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-64">
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="size-4" />}
            />
          </div>
          <button className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-zinc-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition shadow-sm">
            <Filter className="size-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#015C97] to-[#0172B2] px-5 text-[14px] font-bold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all shadow-sm"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">{t('addWallet')}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <WalletSummary
        totalBalance={totalBalance}
        walletBalance={walletBalance}
        bankBalance={bankBalance}
        creditBalance={creditBalance}
        walletCount={walletCount}
        bankCount={bankCount}
        creditCardCount={creditCardCount}
        formatMoney={formatMoney}
        t={t}
      />

      {/* Main Content */}
      <div className="flex h-full w-full flex-col lg:flex-row gap-8 mt-8 min-h-0 flex-1">
        {/* Left: Tabs + Table */}
        <div className="flex w-full lg:flex-1 flex-col min-w-0">
          {/* Tab Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-slate-800/80 rounded-xl p-1">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-[13px] font-bold transition-all',
                    activeTab === tab.key
                      ? 'bg-white dark:bg-slate-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-1 ml-4">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition',
                  viewMode === 'grid' ? 'bg-zinc-200/80 dark:bg-slate-700 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600'
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition',
                  viewMode === 'list' ? 'bg-zinc-200/80 dark:bg-slate-700 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600'
                )}
              >
                <List className="size-4" />
              </button>
              <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 transition">
                <Settings className="size-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-slate-800">
                    <th className="px-5 py-4 text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">{t('table.name')}</th>
                    <th className="px-5 py-4 text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">{t('table.type')}</th>
                    <th className="px-5 py-4 text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('table.balance')}</th>
                    <th className="px-5 py-4 text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">{t('table.currency')}</th>
                    <th className="px-5 py-4 text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">{t('table.status')}</th>
                    <th className="px-5 py-4 text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider text-center">{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWallets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-sm text-zinc-400 dark:text-slate-500">
                        <Wallet className="size-10 mx-auto mb-3 opacity-20" />
                        {t('table.noData')}
                      </td>
                    </tr>
                  ) : (
                    filteredWallets.map((w) => {
                      const Icon = getTypeIcon(w.type)
                      const isSelected = selectedId === w.id
                      const balance = parseFloat(w.balance)
                      return (
                        <tr
                          key={w.id}
                          onClick={() => setSelectedId(w.id)}
                          className={cn(
                            'border-b border-zinc-50 dark:border-slate-800/50 cursor-pointer transition-all',
                            isSelected
                              ? 'bg-blue-50/50 dark:bg-blue-500/5'
                              : 'hover:bg-zinc-50/80 dark:hover:bg-slate-800/30'
                          )}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn('flex size-9 items-center justify-center rounded-xl', getTypeColor(w.type))}>
                                <Icon className="size-4" />
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">{w.name}</p>
                                {w.type === 'BANK' && (
                                  <p className="text-[12px] text-zinc-400 dark:text-slate-500 mt-0.5">•••• •••• ••••</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-bold',
                              getTypeColor(w.type)
                            )}>
                              {getTypeLabel(w.type)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={cn(
                              'text-[14px] font-bold',
                              balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'
                            )}>
                              {formatMoney(balance)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[13px] font-semibold text-zinc-500 dark:text-slate-400">VND</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold',
                              w.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                                : 'bg-zinc-100 text-zinc-500 dark:bg-slate-800 dark:text-slate-400'
                            )}>
                              <span className={cn(
                                'size-1.5 rounded-full',
                                w.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-zinc-400'
                              )} />
                              {w.status === 'ACTIVE' ? t('status.active') : t('status.inactive')}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="relative flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); openEdit(w) }}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition"
                                title="Edit"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === w.id ? null : w.id) }}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-slate-800 dark:hover:text-zinc-200 transition"
                              >
                                <MoreVertical className="size-4" />
                              </button>
                              {openMenuId === w.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-8 z-20 w-36 rounded-2xl border border-zinc-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
                                >
                                  <button
                                    onClick={() => { openEdit(w); setOpenMenuId(null) }}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 transition"
                                  >
                                    <Pencil className="size-3.5 text-zinc-400" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setOpenMenuId(null)}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                  >
                                    <Trash2 className="size-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination footer */}
            <div className="border-t border-zinc-100 dark:border-slate-800 px-5 py-3">
              <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium">
                {t('table.showing', { start: 1, end: filteredWallets.length, total: filteredWallets.length })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Detail Pane */}
        <div className="hidden lg:block w-[400px] xl:w-[420px] shrink-0">
          <WalletDetail
            wallet={selectedWallet}
            formatMoney={formatMoney}
            locale={locale}
            t={t}
            getTypeLabel={getTypeLabel}
            getTypeIcon={getTypeIcon}
            getTypeColor={getTypeColor}
          />
        </div>
      </div>

      {/* Add / Edit Wallet modal */}
      <WalletFormModal
        open={formOpen}
        wallet={editingWallet}
        onClose={closeForm}
        onSuccess={handleSaved}
      />
    </div>
  )
}
