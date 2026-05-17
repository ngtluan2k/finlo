import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, rows = 3, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition-all duration-300 font-semibold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-550 dark:border-zinc-800 dark:bg-[#0c0c0e] focus:border-[#015C97] focus:ring-4 focus:ring-[#015C97]/10 resize-none disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-semibold text-red-500 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
