import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  subLabel?: string
  icon?: React.ReactNode
}

interface SelectProps {
  label?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  searchable?: boolean
  size?: 'sm' | 'md'
  align?: 'top' | 'bottom'
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  error,
  className,
  searchable,
  size = 'md',
  align = 'bottom',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  const selectedOption = options.find((opt) => opt.value === value)

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(query))
    )
  })

  // Show search bar if explicitly requested OR options length is large (>= 6)
  const showSearch = searchable ?? options.length >= 6

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
              ? "rounded-xl border border-zinc-200/80 px-2 py-1 text-xs font-semibold dark:border-zinc-800 dark:hover:border-zinc-700 h-8"
              : "rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800 dark:hover:border-zinc-700 h-[48px]",
            isOpen ? "border-[#015C97] ring-4 ring-[#015C97]/10" : "hover:border-zinc-300",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            {selectedOption?.icon && (
              <span className={cn("shrink-0 text-zinc-400", size === 'sm' ? "size-3.5" : "size-4")}>
                {selectedOption.icon}
              </span>
            )}
            <div className="flex flex-col min-w-0">
              <span className={cn("truncate font-semibold", size === 'sm' ? "text-xs" : "text-sm")}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              {selectedOption?.subLabel && size !== 'sm' && (
                <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {selectedOption.subLabel}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className={cn(
            "text-zinc-400 transition-transform duration-300 shrink-0",
            size === 'sm' ? "size-3.5 ml-1" : "size-4 ml-2",
            isOpen && "rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className={cn(
            "absolute z-50 border border-zinc-200/85 bg-white p-1.5 shadow-xl dark:border-zinc-850 dark:bg-[#0c0c0e] duration-200 flex flex-col",
            align === 'top'
              ? "bottom-full mb-2 animate-in fade-in slide-in-from-bottom-2"
              : "top-full mt-2 animate-in fade-in slide-in-from-top-2",
            size === 'sm' ? "left-0 right-auto min-w-[100px] max-h-60 rounded-xl" : "left-0 right-0 max-h-68 rounded-2xl"
          )}>
            
            {/* Search input field */}
            {showSearch && (
              <div className="p-1 border-b border-zinc-100 dark:border-zinc-850 shrink-0 bg-white dark:bg-[#0c0c0e] rounded-t-xl mb-1">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 size-3.5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full rounded-xl border border-zinc-200/60 bg-zinc-50/50 py-2 pl-9 pr-8 text-xs font-semibold outline-none transition duration-200 focus:border-[#015C97] focus:bg-white focus:ring-2 focus:ring-[#015C97]/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:bg-[#0c0c0e] text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 p-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* List options container */}
            <div className="overflow-y-auto max-h-48 space-y-0.5 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3.5 text-xs text-zinc-400 dark:text-zinc-500 text-center italic select-none">
                  Không tìm thấy kết quả
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition cursor-pointer text-left min-w-0 gap-3",
                        size === 'sm' ? "px-2 py-1 text-xs font-semibold" : "px-3.5 py-2.5 text-sm font-semibold",
                        isSelected
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400"
                          : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {opt.icon && (
                          <span className={cn("shrink-0", isSelected ? "text-primary-500" : "text-zinc-400")}>
                            {opt.icon}
                          </span>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{opt.label}</span>
                          {opt.subLabel && size !== 'sm' && (
                            <span className={cn("text-[10px] truncate mt-0.5", isSelected ? "text-primary-600/70 dark:text-primary-400/70" : "text-zinc-400 dark:text-zinc-500")}>
                              {opt.subLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="size-4 stroke-[3] shrink-0 text-primary-600 dark:text-primary-400" />}
                    </button>
                  )
                })
              )}
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
