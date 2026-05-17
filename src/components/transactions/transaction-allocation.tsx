import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowRight, Activity } from 'lucide-react'

interface DonutItem {
  name: string
  value: number
  color: string
}

interface AllocationProps {
  donutData: DonutItem[]
  totalExpenseSum: number
  formatMoney: (val: number | string) => string
  mounted: boolean
  t: any
  locale: string
}

export function TransactionAllocation({
  donutData,
  totalExpenseSum,
  formatMoney,
  mounted,
  t,
  locale,
}: AllocationProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
      <h3 className="font-semibold text-base mb-4">
        {t('chart.allocation')}
      </h3>

      {mounted && donutData.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-md dark:border-zinc-800 dark:bg-zinc-950 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="font-bold">{data.name}</span>
                            <span className="font-bold ml-1">
                              {formatMoney(data.value)}
                            </span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Central Summary text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm text-zinc-500 tracking-wide">{t('chart.totalExpense')}</span>
              <span className="text-lg font-extrabold mt-0.5">{formatMoney(totalExpenseSum)}</span>
            </div>
          </div>

          {/* Legends */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {donutData.map((item, idx) => {
              const pct = totalExpenseSum > 0 ? Math.round((item.value / totalExpenseSum) * 100) : 0
              return (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-600 dark:text-zinc-400 truncate">{item.name}</span>
                  </div>
                  <span className="font-bold shrink-0 pl-1">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="h-44 w-full flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
          <Activity className="size-8" />
          <span>{locale === 'vi' ? 'Không có dữ liệu chi tiêu tháng này' : 'No expense data for this month'}</span>
        </div>
      )}

      <button className="mt-4 w-full text-center text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center justify-center gap-1 py-1.5 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-blue-400 transition-colors">
        {t('chart.viewReport')}
        <ArrowRight className="size-3" />
      </button>
    </div>
  )
}
