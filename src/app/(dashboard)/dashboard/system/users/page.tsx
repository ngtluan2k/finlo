import { UsersManagement } from '@/components/system/users-management'

import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('system.users')
  return {
    title: `${t('title')} - Finlo Admin`,
    description: t('subtitle'),
  }
}

export default function SystemUsersPage() {
  return <UsersManagement />
}
