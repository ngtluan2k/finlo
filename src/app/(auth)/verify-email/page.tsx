import { redirect } from 'next/navigation'
import { Mail } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { AuthCard } from '@/components/auth/auth-card'
import { VerifyEmailPending } from '@/components/auth/verify-email-pending'
import { routes } from '@/lib/routes'
import { isEmailVerified } from '@/services/verification.service'

type PageProps = {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { email } = await searchParams
  const t = await getTranslations('auth.verifyEmail')

  if (!email?.includes('@')) {
    redirect(routes.register)
  }

  if (await isEmailVerified(email)) {
    redirect(
      `${routes.login}?verified=1&email=${encodeURIComponent(email)}`,
    )
  }

  return (
    <AuthCard icon={Mail} title={t('title')} subtitle={t('subtitle')} accent="emerald">
      <VerifyEmailPending email={email} />
    </AuthCard>
  )
}
