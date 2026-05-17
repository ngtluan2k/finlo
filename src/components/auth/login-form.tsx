'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, LogIn, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  createLoginSchema,
  type LoginInput,
} from '@/validations/auth.schema'
import {
  AuthErrorBanner,
  AuthField,
  AuthFooterLink,
  AuthInput,
  AuthPasswordInput,
  AuthSocialButtons,
  AuthSocialDivider,
  AuthSubmitButton,
  authFormValidationOptions,
} from '@/components/auth/auth-field'
import { routes } from '@/lib/routes'

export function LoginForm() {
  const t = useTranslations('auth.login')
  const tValidation = useTranslations('auth.validation')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? routes.dashboard
  const verified = searchParams.get('verified')
  const verifyError = searchParams.get('error')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (verified === '1') {
      setNotice(t('verifiedSuccess'))
      return
    }
    if (verifyError === 'token_expired') {
      setError(t('verifyExpired'))
      return
    }
    if (verifyError === 'invalid_token' || verifyError === 'verify_failed') {
      setError(t('verifyInvalid'))
    }
  }, [verified, verifyError, t])

  const loginSchema = useMemo(
    () =>
      createLoginSchema({
        identifierRequired: tValidation('identifierRequired'),
        passwordRequired: tValidation('passwordRequired'),
      }),
    [tValidation],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    ...authFormValidationOptions,
    defaultValues: { identifier: '', password: '' },
  })

  async function onSubmit(data: LoginInput) {
    setError(null)
    const result = await signIn('credentials', {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    })

    if (result?.error === 'EMAIL_NOT_VERIFIED') {
      const email = data.identifier.includes('@') ? data.identifier.trim() : ''
      if (email) {
        router.push(
          `${routes.verifyEmail}?email=${encodeURIComponent(email)}`,
        )
        return
      }
      setError(t('emailNotVerified'))
      return
    }

    if (result?.error === 'USER_SUSPENDED') {
      setError(t('userSuspended'))
      return
    }

    if (result?.error === 'USER_INACTIVE') {
      setError(t('userInactive'))
      return
    }

    if (result?.error === 'USER_DELETED') {
      setError(t('userDeleted'))
      return
    }

    if (result?.error) {
      setError(t('invalidCredentials'))
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-300"
        >
          {notice}
        </p>
      )}
      {error && <AuthErrorBanner>{error}</AuthErrorBanner>}

      <AuthField
        label={t('identifierLabel')}
        id="identifier"
        error={errors.identifier?.message}
      >
        <AuthInput
          icon={Mail}
          id="identifier"
          autoComplete="username"
          placeholder="email@example.com"
          hasError={errors.identifier}
          {...register('identifier')}
        />
      </AuthField>

      <AuthField
        label={t('passwordLabel')}
        id="password"
        error={errors.password?.message}
        trailing={
          <Link
            href="#"
            className="text-xs font-medium text-[#8bc8f6] transition-colors hover:text-[#c0e8fb]"
          >
            {t('forgotPassword')}
          </Link>
        }
      >
        <AuthPasswordInput
          icon={Lock}
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          hasError={errors.password}
          {...register('password')}
        />
      </AuthField>

      <AuthSubmitButton disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('submitting')}
          </>
        ) : (
          <>
            <LogIn className="size-4" aria-hidden />
            {t('submit')}
          </>
        )}
      </AuthSubmitButton>

      <AuthSocialDivider text={t('socialDivider')} />
      <AuthSocialButtons />

      <AuthFooterLink
        prompt={t('noAccount')}
        linkText={t('registerLink')}
        href={routes.register}
      />
    </form>
  )
}
