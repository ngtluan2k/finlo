import { Suspense } from 'react'
import { LogIn } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage() {
  const t = await getTranslations('auth.login')

  return (
    <AuthCard icon={LogIn} title={t('title')} subtitle={t('subtitle')} accent="emerald">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
