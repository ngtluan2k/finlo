import React, { useRef, useEffect } from 'react'
import { MoreVertical, Trash2, Check, Loader2, Activity, ArrowLeftRight } from 'lucide-react'
import type { Transaction, TransactionStatus } from './types'

// Map TransactionStatus → badge appearance
const STATUS_STYLES: Record<TransactionStatus, { bg: string; text: string; label_vi: string; label_en: string }> = {
  COMPLETED:  { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-500', label_vi: 'Hoàn thành', label_en: 'Completed' },
  PENDING:    { bg: 'bg-yellow-500/10  border-yellow-500/20',  text: 'text-yellow-500',  label_vi: 'Chờ xử lý',  label_en: 'Pending'   },
  CANCELLED:  { bg: 'bg-zinc-500/10   border-zinc-500/20',    text: 'text-zinc-500',    label_vi: 'Đã hủy',     label_en: 'Cancelled' },
  FAILED:     { bg: 'bg-red-500/10    border-red-500/20',     text: 'text-red-500',     label_vi: 'Thất bại',   label_en: 'Failed'    },
}

interface TableProps {
  isLoading: boolean
  transactions: Transaction[]
  page: number
  setPage: (v: number) => void
  limit: number
  setLimit: (v: number) => void
  totalCount: number
  totalPages: number
  activeActionsId: string | null
  setActiveActionsId: (v: string | null) => void
  handleDeleteTransaction: (id: string) => void
  formatMoney: (v: string | number) => string
  getCategoryColor: (name: string) => string
  getCategoryIcon: (name: string) => React.ReactNode
  t: any
  locale: string
}

export function TransactionTable({
  isLoading,
  transactions,
  page, setPage,
  limit, setLimit,
  totalCount,
  totalPages,
  activeActionsId, setActiveActionsId,
  handleDeleteTransaction,
  formatMoney,
  getCategoryColor,
  getCategoryIcon,
  t,
  locale,
}: TableProps) {
  const actionsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setActiveActionsId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setActiveActionsId])

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0e] overflow-hidden min-h-[400px] flex flex-col justify-between">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
              {[t('table.date'), t('table.note'), t('table.category'), t('table.wallet'), t('table.amount'), t('table.status'), ''].map((h, i) => (
                <th
                  key={i}
                  className={`px-5 py-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 ${i === 4 ? 'text-right' : i === 5 ? 'text-center' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-zinc-500">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 animate-spin text-[#015C97]" />
                    <span>{locale === 'vi' ? 'Đang tải giao dịch…' : 'Loading transactions…'}</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-zinc-500">
                  <div className="flex flex-col items-center gap-3">
                    <Activity className="size-10 text-zinc-400" />
                    <span>{t('table.noData')}</span>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isIncome   = tx.type === 'INCOME'
                const isTransfer = tx.type === 'TRANSFER'
                const statusStyle = STATUS_STYLES[tx.status]

                return (
                  <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    {/* Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(tx.transactionDate).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </td>

                    {/* Note */}
                    <td className="px-5 py-3.5 font-medium max-w-[200px] truncate">
                      {tx.note || (isIncome ? 'Nhận tiền' : isTransfer ? 'Chuyển khoản' : 'Chi tiêu')}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {tx.category ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryColor(tx.category.name)}`}>
                          {getCategoryIcon(tx.category.name)}
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                          <ArrowLeftRight className="size-3" />
                          {locale === 'vi' ? 'Chuyển khoản' : 'Transfer'}
                        </span>
                      )}
                    </td>

                    {/* Wallet name + type */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 text-xs">
                        <span className="size-2 rounded-full bg-[#015C97] shrink-0" />
                        {tx.wallet.name}
                      </span>
                    </td>

                    {/* Amount — Decimal arrives as string */}
                    <td className={`px-5 py-3.5 whitespace-nowrap text-right font-bold text-sm ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isIncome ? '+' : '−'} {formatMoney(tx.amount)}
                    </td>

                    {/* Status badge using TransactionStatus enum */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text}`}>
                        <Check className="size-3" />
                        {locale === 'vi' ? statusStyle.label_vi : statusStyle.label_en}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 relative">
                      <button
                        onClick={() => setActiveActionsId(activeActionsId === tx.id ? null : tx.id)}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {activeActionsId === tx.id && (
                        <div
                          ref={actionsRef}
                          className="absolute right-6 top-10 z-30 w-36 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in slide-in-from-top-1 duration-100"
                        >
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                            {locale === 'vi' ? 'Xóa giao dịch' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && transactions.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-zinc-100 px-5 py-4 dark:border-zinc-900 sm:flex-row sm:items-center sm:justify-between text-xs text-zinc-500">
          <span>
            {t('table.showing', {
              start: (page - 1) * limit + 1,
              end: Math.min(page * limit, totalCount),
              total: totalCount,
            })}
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>{locale === 'vi' ? 'Hàng:' : 'Rows:'}</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1) }}
                className="rounded border border-zinc-200 bg-transparent px-1.5 py-0.5 outline-none cursor-pointer dark:border-zinc-800"
              >
                {[5, 8, 12, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 font-semibold hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors"
              >
                {locale === 'vi' ? 'Trước' : 'Prev'}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                    page === p
                      ? 'bg-[#015C97] text-white'
                      : 'border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 font-semibold hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors"
              >
                {locale === 'vi' ? 'Tiếp' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
