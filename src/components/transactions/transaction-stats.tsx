import React from 'react'
import { ArrowDownCircle, ArrowUpCircle, Wallet as WalletIcon, PiggyBank } from 'lucide-react'
import type { TransactionStats } from './types'

interface StatsProps {
  stats: TransactionStats
  formatMoney: (val: string | number) => string
  t: any
}

export function TransactionStats({ stats, formatMoney, t }: StatsProps) {
  const cards = [
    {
      label: t('stats.income'),
      value: formatMoney(stats.totalIncome),
      valueClass: 'text-emerald-600 dark:text-emerald-500',
      iconClass: 'bg-emerald-500/10 text-emerald-500',
      icon: <ArrowDownCircle className="size-5" />,
      trend: '↑ 12.5%',
      trendClass: 'text-emerald-500',
    },
    {
      label: t('stats.expense'),
      value: formatMoney(stats.totalExpense),
      valueClass: 'text-red-600 dark:text-red-500',
      iconClass: 'bg-red-500/10 text-red-500',
      icon: <ArrowUpCircle className="size-5" />,
      trend: '↑ 8.2%',
      trendClass: 'text-red-500',
    },
    {
      label: t('stats.balance'),
      value: formatMoney(stats.balance),
      valueClass: '',
      iconClass: 'bg-blue-500/10 text-blue-500',
      icon: <WalletIcon className="size-5" />,
      trend: '↑ 5.6%',
      trendClass: 'text-emerald-500',
    },
    {
      label: t('stats.savings'),
      value: `${stats.savingsRate}%`,
      valueClass: 'text-teal-600 dark:text-teal-500',
      iconClass: 'bg-teal-500/10 text-teal-500',
      icon: <PiggyBank className="size-5" />,
      trend: '↑ 3.0%',
      trendClass: 'text-emerald-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
              <h2 className={`mt-2 text-2xl font-bold ${card.valueClass}`}>{card.value}</h2>
            </div>
            <div className={`flex size-10 items-center justify-center rounded-full ${card.iconClass}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className={`font-medium ${card.trendClass}`}>{card.trend}</span>
            <span className="text-zinc-500">{t('stats.monthTrend')}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
