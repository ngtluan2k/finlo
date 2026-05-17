'use client'

import Link from 'next/link'
import { cloneElement, isValidElement, type ReactElement } from 'react'
import { cn } from '@/lib/utils'

export const authFormValidationOptions = {
  mode: 'onBlur' as const,
  reValidateMode: 'onChange' as const,
}

function fieldErrorId(id: string) {
  return `${id}-error`
}

export function AuthField({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
}) {
  const errorId = fieldErrorId(id)
  const hasError = Boolean(error)

  const control =
    isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          'aria-invalid': hasError || undefined,
          'aria-describedby': hasError ? errorId : undefined,
        })
      : children

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      {control}
      <p
        id={errorId}
        role={hasError ? 'alert' : undefined}
        aria-hidden={!hasError}
        className={cn(
          'min-h-5 text-sm leading-5 text-red-400',
          !hasError && 'invisible',
        )}
      >
        {error ?? '\u00A0'}
      </p>
    </div>
  )
}

export function authInputClass(hasError?: { message?: string }) {
  return cn(
    'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500',
    'outline-none transition focus:border-emerald-400/50 focus:bg-white/8 focus:ring-2 focus:ring-emerald-400/15',
    hasError && 'border-red-400/60 focus:border-red-400/60 focus:ring-red-400/15',
  )
}

export function AuthSubmitButton({
  children,
  disabled,
  type = 'submit',
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  type?: 'submit' | 'button'
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-zinc-950',
        'bg-linear-to-r from-emerald-400 via-emerald-300 to-cyan-400',
        'shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 hover:brightness-110',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'before:absolute before:inset-0 before:bg-linear-to-r before:from-white/0 before:via-white/25 before:to-white/0 before:opacity-0 before:transition before:group-hover:opacity-100',
      )}
    >
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  )
}

export function AuthErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      aria-live="assertive"
      className="rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
    >
      {children}
    </p>
  )
}

export function AuthFooterLink({
  prompt,
  linkText,
  href,
}: {
  prompt: string
  linkText: string
  href: string
}) {
  return (
    <p className="text-center text-sm text-zinc-500">
      {prompt}{' '}
      <Link
        href={href}
        className="font-semibold text-emerald-400 transition hover:text-emerald-300"
      >
        {linkText}
      </Link>
    </p>
  )
}

