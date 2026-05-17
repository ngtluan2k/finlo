import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  setPage: (page: number) => void
  limit: number
  setLimit?: (limit: number) => void
  totalCount: number
  totalPages: number
  locale?: string
  limitOptions?: number[]
}

export function Pagination({
  page,
  setPage,
  limit,
  setLimit,
  totalCount,
  totalPages,
  locale = 'vi',
  limitOptions = [5, 8, 12, 20],
}: PaginationProps) {
  const showingStart = totalCount === 0 ? 0 : (page - 1) * limit + 1
  const showingEnd = Math.min(page * limit, totalCount)

  const tShowing = locale === 'vi' 
    ? `Hiển thị từ ${showingStart} đến ${showingEnd} trong tổng số ${totalCount}`
    : `Showing ${showingStart} to ${showingEnd} of ${totalCount}`

  const tRows = locale === 'vi' ? 'Hàng:' : 'Rows:'

  // Generate beautiful pagination range
  const getRange = (): (number | string)[] => {
    const siblingCount = 1 // number of pages on each side of the active page

    // If totalPages is 7 or less, show all page numbers
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1)
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages)

    // Check if we need to show ellipses
    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1

    // Case 1: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
      return [...leftRange, '...', totalPages]
    }

    // Case 2: Left dots, but no right dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1)
      return [1, '...', ...rightRange]
    }

    // Case 3: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i)
      return [1, '...', ...middleRange, '...', totalPages]
    }

    return []
  }

  const range = getRange()

  return (
    <div className="flex flex-col gap-4 border-t border-zinc-100 px-5 py-4 dark:border-zinc-900 text-xs text-zinc-500">
      {/* 1. Mobile View (Compact & Never Overflows) */}
      <div className="flex sm:hidden w-full items-center justify-between gap-3">
        {setLimit && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span>{tRows}</span>
            <div className="w-16">
              <Select
                value={limit.toString()}
                searchable={false}
                size="sm"
                align="top"
                options={limitOptions.map((n) => ({
                  value: n.toString(),
                  label: n.toString(),
                }))}
                onChange={(val) => {
                  setLimit(parseInt(val, 10))
                  setPage(1)
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="rounded-xl border border-zinc-200 p-2 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white transition-all active:scale-95 duration-200 transform cursor-pointer text-zinc-500 dark:text-zinc-400 size-8 flex items-center justify-center"
            title={locale === 'vi' ? 'Trang đầu' : 'First page'}
          >
            <ChevronsLeft className="size-4 shrink-0" />
          </button>

          {/* Prev Page */}
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-xl border border-zinc-200 p-2 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white transition-all active:scale-95 duration-200 transform cursor-pointer text-zinc-500 dark:text-zinc-400 size-8 flex items-center justify-center"
          >
            <ChevronLeft className="size-4 shrink-0" />
          </button>

          {/* Sleek Middle indicator */}
          <span className="font-bold text-zinc-700 dark:text-zinc-300 px-2 select-none whitespace-nowrap text-xs">
            {page} / {totalPages}
          </span>

          {/* Next Page */}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-zinc-200 p-2 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white transition-all active:scale-95 duration-200 transform cursor-pointer text-zinc-500 dark:text-zinc-400 size-8 flex items-center justify-center"
          >
            <ChevronRight className="size-4 shrink-0" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="rounded-xl border border-zinc-200 p-2 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white transition-all active:scale-95 duration-200 transform cursor-pointer text-zinc-500 dark:text-zinc-400 size-8 flex items-center justify-center"
            title={locale === 'vi' ? 'Trang cuối' : 'Last page'}
          >
            <ChevronsRight className="size-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* 2. Desktop View (Rich, Fully Featured) */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
        <span className="font-medium select-none">{tShowing}</span>

        <div className="flex items-center gap-4">
          {setLimit && (
            <div className="flex items-center gap-1.5">
              <span>{tRows}</span>
              <div className="w-16">
                <Select
                  value={limit.toString()}
                  searchable={false}
                  size="sm"
                  align="top"
                  options={limitOptions.map((n) => ({
                    value: n.toString(),
                    label: n.toString(),
                  }))}
                  onChange={(val) => {
                    setLimit(parseInt(val, 10))
                    setPage(1)
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="rounded-xl border border-zinc-200 p-1.5 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white transition-all active:scale-95 duration-200 transform cursor-pointer text-zinc-500 dark:text-zinc-400 size-8 flex items-center justify-center"
              title={locale === 'vi' ? 'Trang đầu' : 'First page'}
            >
              <ChevronsLeft className="size-4 shrink-0" />
            </button>

            {/* Prev Page */}
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-xl border border-zinc-200 p-1.5 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white transition-all active:scale-95 duration-200 transform cursor-pointer text-zinc-500 dark:text-zinc-400 size-8 flex items-center justify-center"
            >
              <ChevronLeft className="size-4 shrink-0" />
            </button>
            
            {range.map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-1.5 text-zinc-400 select-none text-xs">
                    ...
                  </span>
                )
              }
              const pNum = p as number
              const isActive = page === pNum
              return (
                <button
                  key={`page-${pNum}`}
                  onClick={() => setPage(pNum)}
                  className={cn(
                    "rounded-xl font-bold transition-all duration-300 cursor-pointer text-xs size-8 flex items-center justify-center select-none active:scale-95 transform",
                    isActive
                      ? 'bg-gradient-to-r from-[#015C97] to-[#0172B2] text-white shadow-lg shadow-blue-500/10 scale-105 border border-transparent'
                      : 'border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white text-zinc-700 dark:text-zinc-300'
                  )}
                >
                  {pNum}
                </button>
              )
            })}

            {/* Next Page */}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-zinc-200 p-1.5 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white transition-all active:scale-95 duration-200 transform cursor-pointer text-zinc-500 dark:text-zinc-400 size-8 flex items-center justify-center"
            >
              <ChevronRight className="size-4 shrink-0" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="rounded-xl border border-zinc-200 p-1.5 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white transition-all active:scale-95 duration-200 transform cursor-pointer text-zinc-500 dark:text-zinc-400 size-8 flex items-center justify-center"
              title={locale === 'vi' ? 'Trang cuối' : 'Last page'}
            >
              <ChevronsRight className="size-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
