import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
  PiggyBank,
  Wallet,
  Calendar,
  MoreVertical,
  ArrowRight,
  Utensils,
  ShoppingCart,
  Car,
  Tv,
  FileText,
  CircleEllipsis
} from 'lucide-react'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { CashflowChart } from '@/components/dashboard/cashflow-chart'
import { CategoryChart } from '@/components/dashboard/category-chart'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('dashboard')

  return (
    <div className="mx-auto flex w-full flex-col gap-6 text-zinc-900 dark:text-zinc-50 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Xin chào, LUAN 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tổng quan tài chính của bạn hôm nay
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <Calendar className="size-4 text-zinc-500" />
          Hôm nay, 24/05/2025
          <ChevronDown className="size-4 text-zinc-500 ml-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tổng tài sản <span className="inline-flex size-4 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 text-[10px] ml-1">i</span></p>
              <h2 className="mt-2 text-3xl font-bold">$12,430.50</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-500">
              <Wallet className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="flex items-center text-emerald-500 font-medium">↑ 12.5%</span>
            <span className="text-zinc-500">so với tháng trước</span>
          </div>
          {/* Sparkline placeholder */}
          <div className="mt-3 h-8 w-full bg-[url('/sparkline-green.svg')] bg-cover bg-no-repeat opacity-50 hidden"></div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Thu nhập tháng</p>
              <h2 className="mt-2 text-3xl font-bold">$8,240.00</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <ArrowDownCircle className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="flex items-center text-emerald-500 font-medium">↑ 8.2%</span>
            <span className="text-zinc-500">so với tháng trước</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Chi tiêu tháng</p>
              <h2 className="mt-2 text-3xl font-bold">$3,820.50</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <ArrowUpCircle className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="flex items-center text-red-500 font-medium">↓ 5.4%</span>
            <span className="text-zinc-500">so với tháng trước</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tiết kiệm</p>
              <h2 className="mt-2 text-3xl font-bold">$4,420.00</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <PiggyBank className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="flex items-center text-emerald-500 font-medium">↑ 15.3%</span>
            <span className="text-zinc-500">so với tháng trước</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cashflow Chart */}
        <div className="col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-lg">Dòng tiền <span className="inline-flex size-4 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 text-[10px] ml-1 text-zinc-400 font-normal">i</span></h3>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500"></span> Thu nhập</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500"></span> Chi tiêu</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium">
                Tháng này <ChevronDown className="size-3.5 ml-1" />
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium">
                Biểu đồ <ChevronDown className="size-3.5 ml-1" />
              </div>
              <button className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><MoreVertical className="size-5" /></button>
            </div>
          </div>
          <div className="h-64 w-full">
            <CashflowChart />
          </div>
        </div>

        {/* Category Chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Chi tiêu theo danh mục</h3>
            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium">
              Tháng này <ChevronDown className="size-3.5 ml-1" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-40 w-full relative flex items-center justify-center">
              <CategoryChart />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold">$3,820.50</span>
                <span className="text-xs text-zinc-500">Tổng chi tiêu</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded bg-red-500/20 text-[10px] text-red-500"><Utensils className="size-3"/></span> Ăn uống</div>
                <div className="flex items-center gap-3"><span className="font-semibold">$1,240.50</span> <span className="text-zinc-500 w-8 text-right">32.5%</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded bg-yellow-500/20 text-[10px] text-yellow-500"><ShoppingCart className="size-3"/></span> Mua sắm</div>
                <div className="flex items-center gap-3"><span className="font-semibold">$850.00</span> <span className="text-zinc-500 w-8 text-right">22.3%</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded bg-blue-500/20 text-[10px] text-blue-500"><Car className="size-3"/></span> Di chuyển</div>
                <div className="flex items-center gap-3"><span className="font-semibold">$620.00</span> <span className="text-zinc-500 w-8 text-right">16.2%</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded bg-purple-500/20 text-[10px] text-purple-500"><Tv className="size-3"/></span> Giải trí</div>
                <div className="flex items-center gap-3"><span className="font-semibold">$480.00</span> <span className="text-zinc-500 w-8 text-right">12.6%</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded bg-emerald-500/20 text-[10px] text-emerald-500"><FileText className="size-3"/></span> Hóa đơn</div>
                <div className="flex items-center gap-3"><span className="font-semibold">$380.00</span> <span className="text-zinc-500 w-8 text-right">9.9%</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded bg-zinc-500/20 text-[10px] text-zinc-500"><CircleEllipsis className="size-3"/></span> Khác</div>
                <div className="flex items-center gap-3"><span className="font-semibold">$250.00</span> <span className="text-zinc-500 w-8 text-right">6.5%</span></div>
              </div>
            </div>
            
            <button className="mt-2 text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center justify-center gap-1">
              Xem chi tiết <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Giao dịch gần đây</h3>
            <button className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1">
              Xem tất cả <ArrowRight className="size-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <ShoppingCart className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">Siêu thị Co.opmart</p>
                  <p className="text-xs text-zinc-500">Mua sắm</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-500">-$75.50</p>
                <p className="text-xs text-zinc-500">24/05/2025</p>
              </div>
            </div>
            {/* More transactions can be added here */}
          </div>
        </div>

        {/* Budgets */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Ngân sách</h3>
            <button className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1">
              Xem tất cả <ArrowRight className="size-3.5" />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <Utensils className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Ăn uống</p>
                    <p className="text-xs text-zinc-500">$1,240.50 / $2,000.00</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">62%</p>
                  <p className="text-xs text-zinc-500">Còn 11 ngày</p>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full rounded-full bg-red-500" style={{ width: '62%' }}></div>
              </div>
            </div>
            {/* More budgets can be added here */}
          </div>
        </div>
      </div>
    </div>
  )
}
