'use client'

import {
  ArrowDownLeft, ArrowUpRight, ArrowRightLeft, MoreHorizontal,
  Pencil, ChevronRight, Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WalletItem } from './wallets-client'
import type { LucideIcon } from 'lucide-react'

interface WalletDetailProps {
  wallet: WalletItem | null
  formatMoney: (val: string | number) => string
  locale: string
  t: any
  getTypeLabel: (type: WalletItem['type']) => string
  getTypeIcon: (type: WalletItem['type']) => LucideIcon
  getTypeColor: (type: WalletItem['type']) => string
}

export function WalletDetail({
  wallet, formatMoney, locale, t,
  getTypeLabel, getTypeIcon, getTypeColor,
}: WalletDetailProps) {
  if (!wallet) {
    return (
      <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-slate-800 h-full items-center justify-center text-zinc-400 dark:text-slate-500 p-8">
        <Wallet className="size-16 mb-4 opacity-20" />
        <p className="text-sm">Chọn ví để xem chi tiết</p>
      </div>
    )
  }

  const Icon = getTypeIcon(wallet.type)
  const balance = parseFloat(wallet.balance)
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  }

  const formatTxDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })} • ${d.toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`
  }

  const quickActions = [
    { label: t('details.deposit'), icon: ArrowDownLeft, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { label: t('details.withdraw'), icon: ArrowUpRight, color: 'text-red-500 bg-red-50 dark:bg-red-500/15 dark:text-red-400' },
    { label: t('details.transfer'), icon: ArrowRightLeft, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/15 dark:text-blue-400' },
    { label: t('details.other'), icon: MoreHorizontal, color: 'text-zinc-600 bg-zinc-100 dark:bg-slate-700 dark:text-zinc-300' },
  ]

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-slate-800 h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-slate-700">
        {/* Header */}
        <div className="p-6 pb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-bold', getTypeColor(wallet.type))}>
                <Icon className="size-3.5" />
                {wallet.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {t('details.default')}
              </span>
            </div>
            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-slate-800 dark:hover:text-zinc-200 transition">
              <Pencil className="size-4" />
            </button>
          </div>

          {/* Balance */}
          <h2 className={cn(
            'text-3xl font-bold mb-1',
            balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          )}>
            {formatMoney(balance)} đ
          </h2>
          <p className="text-xs text-zinc-400 dark:text-slate-500 font-medium">{t('details.totalBalance')}</p>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {quickActions.map(action => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-zinc-100 dark:border-slate-800 hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className={cn('flex size-9 items-center justify-center rounded-xl', action.color)}>
                  <action.icon className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="px-6 pb-5 border-t border-zinc-100 dark:border-slate-800 pt-5 space-y-3.5">
          {[
            { label: t('details.typeLabel'), value: getTypeLabel(wallet.type) },
            { label: t('details.goal'), value: '—' },
            { label: t('details.createdAt'), value: formatDate(wallet.createdAt) },
            { label: t('details.currency'), value: 'VND' },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center text-[13px]">
              <span className="text-zinc-500 dark:text-slate-400">{row.label}</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{row.value}</span>
            </div>
          ))}
          <div className="pt-1">
            <p className="text-[13px] text-zinc-500 dark:text-slate-400 mb-1">{t('details.description')}</p>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed italic">—</p>
          </div>
          <div>
            <p className="text-[13px] text-zinc-500 dark:text-slate-400 mb-1">{t('details.notes')}</p>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed italic">—</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="px-6 pb-6 border-t border-zinc-100 dark:border-slate-800 pt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('details.recentTransactions')}</h3>
            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {t('details.viewAll')}
            </button>
          </div>

          {wallet.transactions.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-slate-500 text-center py-6">—</p>
          ) : (
            <div className="flex flex-col gap-3">
              {wallet.transactions.map(tx => {
                const amt = parseFloat(tx.amount)
                const isExpense = tx.type === 'EXPENSE'
                const isTransfer = tx.type === 'TRANSFER'
                return (
                  <div key={tx.id} className="flex items-center gap-3 group">
                    <div className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-xl',
                      isExpense ? 'bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400'
                        : isTransfer ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400'
                        : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400'
                    )}>
                      {isExpense ? <ArrowUpRight className="size-4" /> : isTransfer ? <ArrowRightLeft className="size-4" /> : <ArrowDownLeft className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {tx.note || tx.categoryName || (isExpense ? 'Chi tiêu' : isTransfer ? 'Chuyển khoản' : 'Thu nhập')}
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-slate-500 mt-0.5">
                        {formatTxDate(tx.transactionDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-[13px] font-bold',
                        isExpense ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      )}>
                        {isExpense ? '-' : '+'}{formatMoney(Math.abs(amt))} đ
                      </p>
                      <p className={cn(
                        'text-[11px] font-medium mt-0.5',
                        tx.status === 'COMPLETED' ? 'text-emerald-500' : 'text-zinc-400'
                      )}>
                        {tx.status === 'COMPLETED' ? 'Thành công' : tx.status}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {wallet.transactions.length > 0 && (
            <button className="w-full mt-4 py-2.5 rounded-xl border border-zinc-100 dark:border-slate-800 text-[13px] font-bold text-blue-600 dark:text-blue-400 hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition flex items-center justify-center gap-1.5">
              {t('details.viewAllTransactions')}
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
