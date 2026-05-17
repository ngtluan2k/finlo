import { UserPlus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { AuthCard } from '@/components/auth/auth-card'
import { RegisterForm } from '@/components/auth/register-form'

export default async function RegisterPage() {
  const t = await getTranslations('auth.register')

  return (
    <AuthCard icon={UserPlus} title={t('title')} subtitle={t('subtitle')} accent="cyan">
      <RegisterForm />
    </AuthCard>
  )
}
