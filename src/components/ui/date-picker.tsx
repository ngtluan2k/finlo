import React, { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  label?: string
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  error?: string
  locale?: string
  placeholder?: string
  size?: 'sm' | 'md'
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  locale = 'vi',
  placeholder,
  size = 'md',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'months' | 'years'>('calendar')
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse current value safely
  const parsedDate = value ? new Date(value) : new Date()
  const [currentMonth, setCurrentMonth] = useState(isNaN(parsedDate.getTime()) ? new Date().getMonth() : parsedDate.getMonth())
  const [currentYear, setCurrentYear] = useState(isNaN(parsedDate.getTime()) ? new Date().getFullYear() : parsedDate.getFullYear())
  const [yearPageStart, setYearPageStart] = useState(currentYear - 6)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync state with value when value changes or when opening picker
  useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth())
        setCurrentYear(d.getFullYear())
        setYearPageStart(d.getFullYear() - 6)
      }
    }
  }, [value, isOpen])

  // Reset view mode when picker closes
  useEffect(() => {
    if (!isOpen) {
      setViewMode('calendar')
    }
  }, [isOpen])

  // Calendar logic helpers
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
  const startDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay()

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handlePrevHeader = () => {
    if (viewMode === 'calendar') {
      handlePrevMonth()
    } else if (viewMode === 'months') {
      setCurrentYear(currentYear - 1)
    } else if (viewMode === 'years') {
      setYearPageStart(yearPageStart - 12)
    }
  }

  const handleNextHeader = () => {
    if (viewMode === 'calendar') {
      handleNextMonth()
    } else if (viewMode === 'months') {
      setCurrentYear(currentYear + 1)
    } else if (viewMode === 'years') {
      setYearPageStart(yearPageStart + 12)
    }
  }

  const handleToggleYears = () => {
    setYearPageStart(currentYear - 6)
    setViewMode(viewMode === 'years' ? 'calendar' : 'years')
  }

  const handleSelectDay = (day: number) => {
    // Generate YYYY-MM-DD string safely in local calendar time
    const monthStr = String(currentMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateString = `${currentYear}-${monthStr}-${dayStr}`
    onChange(dateString)
    setIsOpen(false)
  }

  const monthNamesVi = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const weekdaysVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const weekdaysEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const monthLabel = locale === 'vi' ? monthNamesVi[currentMonth] : monthNamesEn[currentMonth]
  
  const defaultPlaceholder = locale === 'vi' ? 'Chọn ngày...' : 'Select date...'
  let displayLabel = placeholder || defaultPlaceholder
  if (value) {
    const parts = value.split('-')
    if (parts.length === 3) {
      // YYYY-MM-DD to DD/MM/YYYY or MM/DD/YYYY
      displayLabel = locale === 'vi' 
        ? `${parts[2]}/${parts[1]}/${parts[0]}` 
        : `${parts[1]}/${parts[2]}/${parts[0]}`
    }
  }

  // Generate calendar grid array
  const totalDays = daysInMonth(currentMonth, currentYear)
  const startOffset = startDayOfMonth(currentMonth, currentYear)
  
  const daysArray = []
  // Offset paddings
  for (let i = 0; i < startOffset; i++) {
    daysArray.push(null)
  }
  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d)
  }

  // Determine selected day
  let selectedDayNum: number | null = null
  if (value) {
    const d = new Date(value)
    if (!isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      selectedDayNum = d.getDate()
    }
  }

  const today = new Date()
  const isTodayNum = today.getMonth() === currentMonth && today.getFullYear() === currentYear
    ? today.getDate()
    : null

  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full bg-white transition-all duration-300 text-left focus:outline-none flex items-center justify-between cursor-pointer select-none dark:bg-[#0c0c0e] text-zinc-800 dark:text-zinc-100",
            size === 'sm'
              ? "rounded-xl border border-zinc-200/80 px-2 py-1.5 text-xs font-semibold dark:border-zinc-800 dark:hover:border-zinc-700 h-8"
              : "rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800 dark:hover:border-zinc-700 h-[48px]",
            isOpen ? "border-[#015C97] ring-4 ring-[#015C97]/10" : "hover:border-zinc-300",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50"
          )}
        >
          <span className={cn(
            "font-semibold truncate whitespace-nowrap mr-1",
            size === 'sm' ? "text-xs" : "text-sm"
          )}>
            {displayLabel}
          </span>
          <CalendarIcon className={cn(
            "text-zinc-400 shrink-0",
            size === 'sm' ? "size-3.5 ml-1" : "size-4 ml-2"
          )} />
        </button>

        {isOpen && (
          <div className={cn(
            "absolute z-50 left-0 mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-850 dark:bg-[#0c0c0e] animate-in fade-in slide-in-from-top-2 duration-200",
            size === 'sm' ? "left-0 right-auto" : ""
          )}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5 shrink-0">
              <button
                type="button"
                onClick={handlePrevHeader}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              
              <div className="flex items-center gap-1 text-sm font-bold text-zinc-800 dark:text-zinc-100 select-none">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'months' ? 'calendar' : 'months')}
                  className={cn(
                    "hover:text-[#015C97] dark:hover:text-blue-400 px-1.5 py-0.5 rounded transition cursor-pointer",
                    viewMode === 'months' && "text-[#015C97] dark:text-blue-400 bg-blue-500/5"
                  )}
                >
                  {monthLabel}
                </button>
                <button
                  type="button"
                  onClick={handleToggleYears}
                  className={cn(
                    "hover:text-[#015C97] dark:hover:text-blue-400 px-1.5 py-0.5 rounded transition cursor-pointer",
                    viewMode === 'years' && "text-[#015C97] dark:text-blue-400 bg-blue-500/5"
                  )}
                >
                  {currentYear}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextHeader}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0 cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {viewMode === 'calendar' ? (
              <>
                {/* Weekdays Labels */}
                <div className="grid grid-cols-7 text-center gap-y-1 mb-2">
                  {(locale === 'vi' ? weekdaysVi : weekdaysEn).map((day) => (
                    <span key={day} className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center animate-in fade-in zoom-in-95 duration-150">
                  {daysArray.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="size-8" />
                    }
                    const isSelected = selectedDayNum === day
                    const isCurrentToday = isTodayNum === day
                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={cn(
                          "size-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer select-none",
                          isSelected
                            ? "bg-[#015C97] text-white shadow-md shadow-blue-500/20"
                            : isCurrentToday
                            ? "border border-[#015C97] text-[#015C97] dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                            : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        )}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : viewMode === 'months' ? (
              <div className="grid grid-cols-3 gap-2 py-2 text-center animate-in fade-in zoom-in-95 duration-150">
                {(locale === 'vi' ? monthNamesVi : monthNamesEn).map((mName, mIdx) => {
                  const isSelected = mIdx === currentMonth
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setCurrentMonth(mIdx)
                        setViewMode('calendar')
                      }}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-bold transition cursor-pointer select-none",
                        isSelected
                          ? "bg-[#015C97] text-white shadow-md"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100/50 dark:border-zinc-800/50"
                      )}
                    >
                      {locale === 'vi' ? `Th. ${mIdx + 1}` : mName.slice(0, 3)}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 py-2 text-center animate-in fade-in zoom-in-95 duration-150">
                {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((yr) => {
                  const isSelected = yr === currentYear
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setCurrentYear(yr)
                        setViewMode('months')
                      }}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-bold transition cursor-pointer select-none",
                        isSelected
                          ? "bg-[#015C97] text-white shadow-md"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100/50 dark:border-zinc-800/50"
                      )}
                    >
                      {yr}
                    </button>
                  )
                })}
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-4 pt-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setIsOpen(false)
                }}
                className="font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                {locale === 'vi' ? 'Xóa' : 'Clear'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const todayStr = new Date().toISOString().split('T')[0]
                  onChange(todayStr)
                  setIsOpen(false)
                }}
                className="font-bold text-[#015C97] dark:text-blue-400 hover:underline cursor-pointer"
              >
                {locale === 'vi' ? 'Hôm nay' : 'Today'}
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs font-semibold text-red-500 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  )
}
