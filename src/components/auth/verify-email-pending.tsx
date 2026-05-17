'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AuthErrorBanner, AuthSubmitButton } from '@/components/auth/auth-field'
import { routes } from '@/lib/routes'

const POLL_INTERVAL_MS = 4_000

export function VerifyEmailPending({ email }: { email: string }) {
  const t = useTranslations('auth.verifyEmail')
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const redirectingRef = useRef(false)

  const goToLoginVerified = useCallback(() => {
    if (redirectingRef.current) return
    redirectingRef.current = true
    setIsRedirecting(true)
    setError(null)
    setMessage(t('redirectingToLogin'))
    router.replace(
      `${routes.login}?verified=1&email=${encodeURIComponent(email)}`,
    )
  }, [email, router, t])

  const checkVerificationStatus = useCallback(async () => {
    if (redirectingRef.current) return

    try {
      const res = await fetch(
        `/api/auth/verification-status?email=${encodeURIComponent(email)}`,
        { cache: 'no-store' },
      )
      if (!res.ok) return

      const payload = (await res.json()) as { verified?: boolean }
      if (payload.verified) {
        goToLoginVerified()
      }
    } catch {
      // ignore polling errors
    }
  }, [email, goToLoginVerified])

  useEffect(() => {
    void checkVerificationStatus()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkVerificationStatus()
      }
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void checkVerificationStatus()
      }
    }, POLL_INTERVAL_MS)

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [checkVerificationStatus])

  async function handleResend() {
    if (redirectingRef.current || isRedirecting) return

    setMessage(null)
    setError(null)
    setIsResending(true)

    try {
      const statusRes = await fetch(
        `/api/auth/verification-status?email=${encodeURIComponent(email)}`,
        { cache: 'no-store' },
      )
      if (statusRes.ok) {
        const statusPayload = (await statusRes.json()) as { verified?: boolean }
        if (statusPayload.verified) {
          goToLoginVerified()
          return
        }
      }

      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const payload = (await res.json()) as { code?: string }

      if (res.ok) {
        setMessage(t('resendSuccess'))
        return
      }

      if (payload.code === 'ALREADY_VERIFIED') {
        goToLoginVerified()
        return
      }
      if (payload.code === 'RESEND_TOO_SOON') {
        setError(t('resendTooSoon'))
        return
      }
      if (payload.code === 'USER_NOT_FOUND') {
        setError(t('notFound'))
        return
      }
      if (payload.code === 'SEND_FAILED') {
        setError(t('sendFailed'))
        return
      }
      setError(t('notFound'))
    } catch {
      setError(t('notFound'))
    } finally {
      setIsResending(false)
    }
  }

  const actionsDisabled = isResending || isRedirecting

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center">
        <Mail className="mx-auto mb-2 size-8 text-emerald-400" aria-hidden />
        <p className="text-sm font-medium text-emerald-200">{t('sentTo', { email })}</p>
      </div>

      <p className="text-center text-sm leading-relaxed text-zinc-400">{t('instructions')}</p>

      {message && (
        <p
          role="status"
          className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-300"
        >
          {message}
        </p>
      )}
      {error && <AuthErrorBanner>{error}</AuthErrorBanner>}

      <AuthSubmitButton
        type="button"
        disabled={actionsDisabled}
        onClick={handleResend}
      >
        {isRedirecting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('redirectingToLogin')}
          </>
        ) : isResending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('resending')}
          </>
        ) : (
          t('resend')
        )}
      </AuthSubmitButton>

      <p className="text-center text-sm text-zinc-500">
        <Link
          href={`${routes.login}?email=${encodeURIComponent(email)}`}
          className="font-semibold text-emerald-400 transition hover:text-emerald-300"
        >
          {t('backToLogin')}
        </Link>
      </p>
    </div>
  )
}
