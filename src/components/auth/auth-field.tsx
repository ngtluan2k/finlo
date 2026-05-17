'use client'

import Link from 'next/link'
import { cloneElement, isValidElement, useState, type ReactElement } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export const authFormValidationOptions = {
  mode: 'onBlur' as const,
  reValidateMode: 'onChange' as const,
}

function fieldErrorId(id: string) {
  return `${id}-error`
}

/* ─── Field Wrapper ─── */

export function AuthField({
  label,
  id,
  error,
  trailing,
  children,
}: {
  label: string
  id: string
  error?: string
  trailing?: React.ReactNode
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
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-white/80">
          {label}
        </label>
        {trailing}
      </div>
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

/* ─── Input with left icon ─── */

export function AuthInput({
  icon: Icon,
  id,
  type = 'text',
  hasError,
  className,
  ...rest
}: {
  icon: LucideIcon
  id: string
  type?: string
  hasError?: { message?: string }
  className?: string
} & Omit<React.ComponentProps<'input'>, 'type' | 'id'>) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-white/35"
        aria-hidden
      />
      <input
        id={id}
        type={type}
        className={cn(
          'w-full rounded-xl border border-white/12 bg-white/6 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-white/35',
          'outline-none transition-all duration-200',
          'focus:border-[#54a4d7]/50 focus:bg-white/10 focus:ring-2 focus:ring-[#54a4d7]/20 focus:shadow-[0_0_0_4px_rgba(84,164,215,0.08)]',
          hasError && 'border-red-400/60 focus:border-red-400/60 focus:ring-red-400/15',
          className,
        )}
        {...rest}
      />
    </div>
  )
}

/* ─── Password Input with toggle ─── */

export function AuthPasswordInput({
  icon: Icon,
  id,
  hasError,
  className,
  ...rest
}: {
  icon: LucideIcon
  id: string
  hasError?: { message?: string }
  className?: string
} & Omit<React.ComponentProps<'input'>, 'type' | 'id'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-white/35"
        aria-hidden
      />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={cn(
          'w-full rounded-xl border border-white/12 bg-white/6 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/35',
          'outline-none transition-all duration-200',
          'focus:border-[#54a4d7]/50 focus:bg-white/10 focus:ring-2 focus:ring-[#54a4d7]/20 focus:shadow-[0_0_0_4px_rgba(84,164,215,0.08)]',
          hasError && 'border-red-400/60 focus:border-red-400/60 focus:ring-red-400/15',
          className,
        )}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  )
}

/* ─── Legacy input class (kept for compat) ─── */

export function authInputClass(hasError?: { message?: string }) {
  return cn(
    'w-full rounded-xl border border-white/12 bg-white/6 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35',
    'outline-none transition-all duration-200',
    'focus:border-[#54a4d7]/50 focus:bg-white/10 focus:ring-2 focus:ring-[#54a4d7]/20 focus:shadow-[0_0_0_4px_rgba(84,164,215,0.08)]',
    hasError && 'border-red-400/60 focus:border-red-400/60 focus:ring-red-400/15',
  )
}

/* ─── Submit Button ─── */

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
        'group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white',
        'bg-[linear-gradient(135deg,#015c97_0%,#2d82b9_50%,#54a4d7_100%)]',
        'shadow-lg shadow-[#015c97]/30 transition-all duration-300',
        'hover:shadow-[#015c97]/50 hover:brightness-110 hover:translate-y-[-1px]',
        'active:translate-y-0 active:brightness-95',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        'before:absolute before:inset-0 before:bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] before:opacity-0 before:transition-opacity before:duration-300 before:group-hover:opacity-100',
      )}
    >
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  )
}

/* ─── Error Banner ─── */

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

/* ─── Social Login Divider ─── */

export function AuthSocialDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-xs text-white/40">{text}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  )
}

/* ─── Social Login Buttons ─── */

export function AuthSocialButtons() {
  return (
    <div className="flex items-center justify-center gap-3">
      <SocialButton label="Google">
        <svg className="size-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.99 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      </SocialButton>
      <SocialButton label="Facebook">
        <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </SocialButton>
      <SocialButton label="Apple">
        <svg className="size-5" viewBox="0 0 24 24" fill="white">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.64-2.2.45-3.06-.4C3.79 16.17 4.36 9.53 8.82 9.28c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.3 4.11zM12.03 9.16C11.88 6.84 13.69 4.9 15.82 4.72c.29 2.7-2.46 4.7-3.79 4.44z" />
        </svg>
      </SocialButton>
    </div>
  )
}

function SocialButton({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/80',
        'transition-all duration-200 hover:bg-white/10 hover:border-white/20',
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

/* ─── Footer Link ─── */

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
    <p className="text-center text-sm text-white/45">
      {prompt}{' '}
      <Link
        href={href}
        className="font-semibold text-[#8bc8f6] transition-colors duration-200 hover:text-[#c0e8fb]"
      >
        {linkText}
      </Link>
    </p>
  )
}

/* ─── Terms Checkbox ─── */

export function AuthTermsCheckbox({
  checked,
  onChange,
  termsText,
  termsLink,
  termsAnd,
  privacyLink,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  termsText: string
  termsLink: string
  termsAnd: string
  privacyLink: string
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={cn(
            'size-4.5 rounded border border-white/20 bg-white/5 transition-all duration-200',
            'peer-checked:border-[#2d82b9] peer-checked:bg-[#015c97]',
            'group-hover:border-white/30',
          )}
        />
        {checked && (
          <svg
            className="pointer-events-none absolute inset-0 m-auto size-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-xs leading-relaxed text-white/50">
        {termsText}{' '}
        <a href="#" className="font-semibold text-[#8bc8f6] hover:text-[#c0e8fb] transition-colors">
          {termsLink}
        </a>{' '}
        {termsAnd}{' '}
        <a href="#" className="font-semibold text-[#8bc8f6] hover:text-[#c0e8fb] transition-colors">
          {privacyLink}
        </a>
      </span>
    </label>
  )
}
