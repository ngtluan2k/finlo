'use client'

import { Wallet, Landmark, CreditCard, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletSummaryProps {
  totalBalance: number
  walletBalance: number
  bankBalance: number
  creditBalance: number
  walletCount: number
  bankCount: number
  creditCardCount: number
  formatMoney: (val: string | number) => string
  t: any
}

export function WalletSummary({
  totalBalance, walletBalance, bankBalance, creditBalance,
  walletCount, bankCount, creditCardCount,
  formatMoney, t,
}: WalletSummaryProps) {
  const cards = [
    {
      label: t('stats.totalBalance'),
      value: `${formatMoney(totalBalance)} đ`,
      valueClass: '',
      iconClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      icon: <TrendingUp className="size-5" />,
      sub: '↑ 12.5%',
      subLabel: t('stats.monthTrend'),
      subClass: 'text-emerald-500',
    },
    {
      label: t('stats.wallets'),
      value: `${formatMoney(walletBalance)} đ`,
      valueClass: 'text-emerald-600 dark:text-emerald-400',
      iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      icon: <Wallet className="size-5" />,
      sub: t('stats.walletCount', { count: walletCount }),
      subLabel: '',
      subClass: 'text-zinc-500',
    },
    {
      label: t('stats.banks'),
      value: `${formatMoney(bankBalance)} đ`,
      valueClass: 'text-amber-600 dark:text-amber-400',
      iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      icon: <Landmark className="size-5" />,
      sub: t('stats.bankCount', { count: bankCount }),
      subLabel: '',
      subClass: 'text-zinc-500',
    },
    {
      label: t('stats.creditCards'),
      value: `${formatMoney(creditBalance)} đ`,
      valueClass: creditBalance < 0 ? 'text-red-600 dark:text-red-400' : '',
      iconClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      icon: <CreditCard className="size-5" />,
      sub: t('stats.cardCount', { count: creditCardCount }),
      subLabel: '',
      subClass: 'text-zinc-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
              <h2 className={cn('mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100', card.valueClass)}>{card.value}</h2>
            </div>
            <div className={cn('flex size-10 items-center justify-center rounded-full', card.iconClass)}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className={cn('font-medium', card.subClass)}>{card.sub}</span>
            {card.subLabel && <span className="text-zinc-500">{card.subLabel}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
