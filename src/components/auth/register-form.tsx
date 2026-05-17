'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Mail, Phone, User, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  createRegisterSchema,
  type RegisterInput,
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
  AuthTermsCheckbox,
  authFormValidationOptions,
} from '@/components/auth/auth-field'
import { routes } from '@/lib/routes'

const AUTH_ERROR_CODES = [
  'INVALID_DATA',
  'EMAIL_EXISTS',
  'REGISTER_FAILED',
  'SEND_FAILED',
] as const

type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number]

function isAuthErrorCode(value: string): value is AuthErrorCode {
  return AUTH_ERROR_CODES.includes(value as AuthErrorCode)
}

export function RegisterForm() {
  const t = useTranslations('auth.register')
  const tValidation = useTranslations('auth.validation')
  const tErrors = useTranslations('auth.errors')
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const registerSchema = useMemo(
    () =>
      createRegisterSchema({
        emailInvalid: tValidation('emailInvalid'),
        passwordMin: tValidation('passwordMin'),
        passwordMax: tValidation('passwordMax'),
        firstNameRequired: tValidation('firstNameRequired'),
        firstNameMax: tValidation('firstNameMax'),
        lastNameRequired: tValidation('lastNameRequired'),
        lastNameMax: tValidation('lastNameMax'),
      }),
    [tValidation],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    ...authFormValidationOptions,
    defaultValues: { email: '', password: '', firstName: '', lastName: '' },
  })

  function resolveApiError(code: string) {
    if (code === 'EMAIL_EXISTS') return tErrors('emailExists')
    if (code === 'INVALID_DATA') return tErrors('invalidData')
    if (code === 'REGISTER_FAILED') return tErrors('registerFailed')
    if (code === 'SEND_FAILED') return tErrors('sendFailed')
    return t('failed')
  }

  async function onSubmit(data: RegisterInput) {
    setError(null)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const payload = (await res.json()) as { code?: string }

    if (!res.ok) {
      const code = payload.code ?? 'REGISTER_FAILED'
      setError(isAuthErrorCode(code) ? resolveApiError(code) : t('failed'))
      return
    }

    router.push(
      `${routes.verifyEmail}?email=${encodeURIComponent(data.email)}`,
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <AuthErrorBanner>{error}</AuthErrorBanner>}

      <div className="grid grid-cols-2 gap-3">
        <AuthField
          label={t('lastNameLabel')}
          id="lastName"
          error={errors.lastName?.message}
        >
          <AuthInput
            icon={User}
            id="lastName"
            autoComplete="family-name"
            placeholder="Nguyen"
            hasError={errors.lastName}
            {...register('lastName')}
          />
        </AuthField>

        <AuthField
          label={t('firstNameLabel')}
          id="firstName"
          error={errors.firstName?.message}
        >
          <AuthInput
            icon={User}
            id="firstName"
            autoComplete="given-name"
            placeholder="Luan"
            hasError={errors.firstName}
            {...register('firstName')}
          />
        </AuthField>
      </div>

      <AuthField label={t('emailLabel')} id="email" error={errors.email?.message}>
        <AuthInput
          icon={Mail}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          hasError={errors.email}
          {...register('email')}
        />
      </AuthField>

      <AuthField label={t('phoneLabel')} id="phone">
        <AuthInput
          icon={Phone}
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="0123 456 789"
        />
      </AuthField>

      <AuthField label={t('passwordLabel')} id="password" error={errors.password?.message}>
        <AuthPasswordInput
          icon={Lock}
          id="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hasError={errors.password}
          {...register('password')}
        />
      </AuthField>

      <AuthField label={t('confirmPasswordLabel')} id="confirmPassword">
        <AuthPasswordInput
          icon={Lock}
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </AuthField>

      <AuthTermsCheckbox
        checked={termsAccepted}
        onChange={setTermsAccepted}
        termsText={t('termsText')}
        termsLink={t('termsLink')}
        termsAnd={t('termsAnd')}
        privacyLink={t('privacyLink')}
      />

      <AuthSubmitButton disabled={isSubmitting || !termsAccepted}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('submitting')}
          </>
        ) : (
          <>
            <UserPlus className="size-4" aria-hidden />
            {t('submit')}
          </>
        )}
      </AuthSubmitButton>

      <AuthSocialDivider text={t('socialDivider')} />
      <AuthSocialButtons />

      <AuthFooterLink
        prompt={t('hasAccount')}
        linkText={t('loginLink')}
        href={routes.login}
      />
    </form>
  )
}
