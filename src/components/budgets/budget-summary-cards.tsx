import { Wallet, TrendingUp, PieChart, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BudgetItem } from './budgets-client'

interface BudgetSummaryCardsProps {
  budgets: BudgetItem[]
  formatMoney: (val: string | number) => string
  t: any
}

export function BudgetSummaryCards({ budgets, formatMoney, t }: BudgetSummaryCardsProps) {
  let totalBudget = 0
  let totalSpent = 0
  let exceededCount = 0
  let exceededAmount = 0

  budgets.forEach(b => {
    const amt = parseFloat(b.amount)
    const spent = parseFloat(b.spent)
    totalBudget += amt
    totalSpent += spent

    if (spent > amt) {
      exceededCount++
      exceededAmount += (spent - amt)
    }
  })

  const remaining = totalBudget - totalSpent
  const spentPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const remainingPercent = totalBudget > 0 ? (Math.max(0, remaining) / totalBudget) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Budget */}
      <div className="flex flex-col justify-between rounded-3xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <Wallet className="size-5" />
          </div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-slate-400">
            {t('summary.totalBudget')}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {formatMoney(totalBudget)} ₫
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            100% so với kế hoạch
          </div>
        </div>
      </div>

      {/* Spent */}
      <div className="flex flex-col justify-between rounded-3xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-500/5 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <TrendingUp className="size-5" />
          </div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-slate-400">
            {t('summary.spent')}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {formatMoney(totalSpent)} ₫
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {spentPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Remaining */}
      <div className="flex flex-col justify-between rounded-3xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-500/5 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <PieChart className="size-5" />
          </div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-slate-400">
            {t('summary.remaining')}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {formatMoney(remaining)} ₫
          </div>
          <div className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            {remainingPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Exceeded */}
      <div className="flex flex-col justify-between rounded-3xl border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-500/5 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
            <Target className="size-5" />
          </div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-slate-400">
            {t('summary.exceeded')}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-xl font-black text-zinc-900 dark:text-zinc-50">
            {exceededCount} {t('table.category').toLowerCase()}
          </div>
          <div className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
            -{formatMoney(exceededAmount)} ₫
          </div>
        </div>
      </div>
    </div>
  )
}
