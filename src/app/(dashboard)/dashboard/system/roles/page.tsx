import { RolesManagement } from '@/components/system/roles-management'

import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('system.roles')
  return {
    title: `${t('title')} - Finlo Admin`,
    description: t('subtitle'),
  }
}

export default function SystemRolesPage() {
  return <RolesManagement />
}
