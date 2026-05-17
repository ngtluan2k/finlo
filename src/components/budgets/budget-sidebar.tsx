'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowUpRight, AlertCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BudgetItem } from './budgets-client'

interface BudgetSidebarProps {
  budgets: BudgetItem[]
  formatMoney: (val: string | number) => string
  t: any
  month: number
  year: number
}

const COLORS = ['#015C97', '#10B981', '#8B5CF6'] // Blue (Expense), Green (Saving), Purple (Investment)

export function BudgetSidebar({ budgets, formatMoney, t }: BudgetSidebarProps) {
  // Chart Data
  const chartData = useMemo(() => {
    let expense = 0
    let saving = 0
    let investment = 0
    let total = 0
    let spent = 0

    budgets.forEach(b => {
      const amt = parseFloat(b.amount)
      total += amt
      spent += parseFloat(b.spent)
      
      const name = b.category.name.toLowerCase()
      if (name.includes('tiết kiệm') || name.includes('saving')) {
        saving += amt
      } else if (name.includes('đầu tư') || name.includes('invest')) {
        investment += amt
      } else {
        expense += amt
      }
    })

    const spentPercent = total > 0 ? (spent / total) * 100 : 0

    return {
      total,
      spentPercent,
      data: [
        { name: t('sidebar.spent') || 'Chi tiêu', value: expense, percent: total > 0 ? (expense / total) * 100 : 0 },
        { name: t('sidebar.saving') || 'Tiết kiệm', value: saving, percent: total > 0 ? (saving / total) * 100 : 0 },
        { name: t('sidebar.investment') || 'Đầu tư', value: investment, percent: total > 0 ? (investment / total) * 100 : 0 },
      ]
    }
  }, [budgets, t])

  // Alerts
  const exceededBudgets = useMemo(() => {
    return budgets.filter(b => parseFloat(b.spent) > parseFloat(b.amount))
  }, [budgets])

  return (
    <div className="space-y-6">
      {/* Overview Chart Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{t('sidebar.overview')}</h3>
        
        <div className="relative mt-6 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.data.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${formatMoney(value || 0)} ₫`, '']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Inner Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-zinc-500 dark:text-slate-400">{t('sidebar.spent')}</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {chartData.spentPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2.5">
          {chartData.data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.name}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-zinc-50 dark:bg-slate-800/50 p-3 text-xs font-semibold">
          <span className="text-zinc-500 dark:text-slate-400">{t('sidebar.comparedToLastMonth')}</span>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="size-3.5" />
            <span>12.5%</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-3xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{t('sidebar.alerts')}</h3>
          <button className="text-xs font-bold text-[#015C97] dark:text-blue-400 hover:underline">
            {t('sidebar.viewAll')}
          </button>
        </div>

        {exceededBudgets.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-500/10 p-3 text-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <AlertCircle className="size-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-900 dark:text-red-200">
                  {t('sidebar.alertMessage', { count: exceededBudgets.length })}
                </p>
                <div className="mt-2 space-y-1">
                  {exceededBudgets.slice(0, 3).map(b => (
                    <div key={b.id} className="flex justify-between text-xs font-semibold text-red-700 dark:text-red-300">
                      <span>{b.category.name}</span>
                      <span>-{formatMoney(parseFloat(b.spent) - parseFloat(b.amount))} ₫</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-slate-400 italic">{t('sidebar.noAlerts') || 'Không có cảnh báo nào.'}</p>
        )}
      </div>

      {/* Suggestions */}
      <div className="rounded-3xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{t('sidebar.suggestions')}</h3>
          <button className="text-xs font-bold text-[#015C97] dark:text-blue-400 hover:underline">
            {t('sidebar.viewAll')}
          </button>
        </div>
        
        <div className="space-y-3">
          <button className="flex w-full items-center justify-between rounded-2xl border border-zinc-100 dark:border-slate-800 p-3 hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition text-left">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <TrendingUp className="size-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t('sidebar.suggestion1Title', { category: 'Sức khỏe' })}</p>
                <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">{t('sidebar.suggestion1Desc')}</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
