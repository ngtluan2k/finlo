import React from 'react'

interface BudgetItem {
  name: string
  limit: number
  color: string
  spent: number
  pct: number
}

interface BudgetProps {
  budgetProgress: BudgetItem[]
  formatMoney: (val: number | string) => string
  t: any
}

export function TransactionBudget({ budgetProgress, formatMoney, t }: BudgetProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">
          {t('budget.title')}
        </h3>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400">
          {t('budget.viewAll')}
        </button>
      </div>

      <div className="space-y-4">
        {budgetProgress.map((bp, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">{bp.name}</span>
              <span className="text-zinc-500">
                {bp.pct}% ({formatMoney(bp.spent)} / {formatMoney(bp.limit)})
              </span>
            </div>
            {/* Progress track bar */}
            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200/20">
              <div
                className={`h-full rounded-full transition-all duration-500 ${bp.color} ${
                  bp.pct >= 90 ? 'bg-red-500' : bp.pct >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${bp.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
