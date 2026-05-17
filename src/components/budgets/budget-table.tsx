import { MoreVertical, Layers, CheckCircle2, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BudgetItem } from './budgets-client'

interface BudgetTableProps {
  budgets: BudgetItem[]
  formatMoney: (val: string | number) => string
  t: any
  loading: boolean
  onEdit: (budget: BudgetItem) => void
}

export function BudgetTable({ budgets, formatMoney, t, loading, onEdit }: BudgetTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-10 items-center justify-center border rounded-3xl bg-white dark:bg-slate-900 border-zinc-200 dark:border-slate-800">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-[#015C97] dark:border-slate-700 dark:border-t-blue-500" />
        <p className="text-sm font-medium text-zinc-500 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col gap-3 py-16 items-center justify-center border rounded-3xl bg-white dark:bg-slate-900 border-zinc-200 dark:border-slate-800 text-center px-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-zinc-50 dark:bg-slate-800">
          <Layers className="size-8 text-zinc-400 dark:text-slate-500" />
        </div>
        <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">No budgets found</p>
        <p className="text-sm text-zinc-500 dark:text-slate-400 max-w-xs">You haven't set up any budgets for this period yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-800/50">
            <tr>
              <th className="px-5 py-4 font-bold text-zinc-500 dark:text-slate-400">{t('table.category')}</th>
              <th className="px-5 py-4 font-bold text-zinc-500 dark:text-slate-400 text-right">{t('table.budget')}</th>
              <th className="px-5 py-4 font-bold text-zinc-500 dark:text-slate-400 text-right">{t('table.spent')}</th>
              <th className="px-5 py-4 font-bold text-zinc-500 dark:text-slate-400 text-right">{t('table.remaining')}</th>
              <th className="px-5 py-4 font-bold text-zinc-500 dark:text-slate-400 w-48">{t('table.progress')}</th>
              <th className="px-5 py-4 font-bold text-zinc-500 dark:text-slate-400 w-32">{t('table.status')}</th>
              <th className="px-4 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-slate-800/60">
            {budgets.map((b) => {
              const amt = parseFloat(b.amount)
              const spent = parseFloat(b.spent)
              const remaining = amt - spent
              const progress = amt > 0 ? (spent / amt) * 100 : 0
              
              let statusText = t('status.good')
              let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
              let barColor = 'bg-emerald-500'

              if (progress >= 100) {
                statusText = t('status.exceeded')
                statusColor = 'text-red-700 bg-red-50 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                barColor = 'bg-red-500'
              } else if (progress >= 80) {
                statusText = t('status.warning')
                statusColor = 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                barColor = 'bg-amber-500'
              }

              // Custom logic for Savings/Investments
              if (b.category.type === 'INCOME') {
                statusColor = 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                barColor = 'bg-blue-500'
                if (progress >= 100) {
                  statusText = t('status.completed')
                  statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                  barColor = 'bg-emerald-500'
                } else {
                  statusText = t('status.warning')
                }
              }

              return (
                <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-slate-800/30 transition group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-slate-300">
                        {/* Placeholder icon since category icons are stored differently */}
                        <Layers className="size-5" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{b.category.name}</div>
                        <div className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5 font-medium">
                          {b.category.type === 'EXPENSE' ? t('tabs.expense', { count: '' }).replace('()', '').trim() : t('tabs.saving', { count: '' }).replace('()', '').trim()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                    {formatMoney(amt)} ₫
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                    {formatMoney(spent)} ₫
                  </td>
                  <td className={cn(
                    "px-5 py-4 text-right font-bold",
                    remaining < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                  )}>
                    {remaining < 0 ? '-' : ''}{formatMoney(Math.abs(remaining))} ₫
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-slate-400 mb-1.5">
                      <span>{progress.toFixed(0)}%</span>
                      {b.category.type === 'EXPENSE' && <span>{progress >= 100 ? 100 : progress.toFixed(0)}%</span>}
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", barColor)}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className={cn(
                      "inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold border",
                      statusColor
                    )}>
                      {statusText}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => onEdit(b)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-[#015C97] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-200 dark:border-slate-800 px-5 py-3 bg-zinc-50/50 dark:bg-slate-800/50 flex justify-between items-center">
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          {t('table.showing', { start: 1, end: budgets.length, total: budgets.length })}
        </span>
        <div className="flex items-center gap-1">
          {/* Simple pagination placeholder */}
          <button className="px-3 py-1.5 text-xs font-bold text-zinc-400 border border-zinc-200 dark:border-slate-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-slate-800 transition">Prev</button>
          <button className="px-3 py-1.5 text-xs font-bold text-white bg-[#015C97] rounded-lg">1</button>
          <button className="px-3 py-1.5 text-xs font-bold text-zinc-400 border border-zinc-200 dark:border-slate-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-slate-800 transition">Next</button>
        </div>
      </div>
    </div>
  )
}
