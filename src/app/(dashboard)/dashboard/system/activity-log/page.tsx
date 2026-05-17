import { ActivityLogManagement } from '@/components/system/activity-log-management'

import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('system.activityLog')
  return {
    title: `${t('title')} - Finlo Admin`,
    description: t('subtitle'),
  }
}

export default function SystemActivityLogPage() {
  return <ActivityLogManagement />
}
