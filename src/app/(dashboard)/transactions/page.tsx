import { TransactionsManagement } from '@/components/transactions/transactions-management'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('transactions')
  return {
    title: `${t('title')} - Finlo`,
    description: t('subtitle'),
  }
}

export default function TransactionsPage() {
  return <TransactionsManagement />
}
