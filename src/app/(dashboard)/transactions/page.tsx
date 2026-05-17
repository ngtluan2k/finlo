import { Suspense } from 'react'
import { TransactionsManagement } from '@/components/transactions/transactions-management'
import { getTranslations } from 'next-intl/server'
import { Loader2 } from 'lucide-react'

export async function generateMetadata() {
  const t = await getTranslations('transactions')
  return {
    title: `${t('title')} - Finlo`,
    description: t('subtitle'),
  }
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#015C97]" />
        </div>
      }
    >
      <TransactionsManagement />
    </Suspense>
  )
}
