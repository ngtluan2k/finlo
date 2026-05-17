import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, type = 'text', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-zinc-400 pointer-events-none select-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full rounded-2xl border border-zinc-200 bg-white py-3 outline-none transition-all duration-300 font-semibold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-550 dark:border-zinc-800 dark:bg-[#0c0c0e] focus:border-[#015C97] focus:ring-4 focus:ring-[#015C97]/10 disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon ? "pl-11" : "pl-4",
              rightIcon ? "pr-11" : "pr-4",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 text-zinc-400 flex items-center justify-center">
              {rightIcon}
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
)
Input.displayName = 'Input'
