'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { name: 'Ăn uống', value: 1240.5, color: '#ef4444' }, // red
  { name: 'Mua sắm', value: 850.0, color: '#eab308' }, // yellow
  { name: 'Di chuyển', value: 620.0, color: '#3b82f6' }, // blue
  { name: 'Giải trí', value: 480.0, color: '#a855f7' }, // purple
  { name: 'Hóa đơn', value: 380.0, color: '#10b981' }, // emerald
  { name: 'Khác', value: 250.0, color: '#71717a' }, // zinc
]

export function CategoryChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="text-sm font-medium">{data.name}</span>
                    <span className="text-sm font-bold ml-2">
                      ${data.value.toFixed(2)}
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
  )
}
