import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { WalletsClient } from '@/components/wallets/wallets-client'

export async function generateMetadata() {
  const t = await getTranslations('wallets')
  return {
    title: `${t('title')} - Finlo`,
    description: t('subtitle'),
  }
}

async function WalletsData() {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    redirect('/login')
  }

  const wallets = await prisma.wallet.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      transactions: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          category: { select: { name: true, type: true } },
        },
      },
    },
  })

  // Serialize for client component
  const serializedWallets = wallets.map((w) => ({
    id: w.id,
    name: w.name,
    balance: w.balance.toString(),
    type: w.type,
    status: w.status,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
    transactions: w.transactions.map((tx) => ({
      id: tx.id,
      amount: tx.amount.toString(),
      type: tx.type,
      status: tx.status,
      note: tx.note,
      transactionDate: tx.transactionDate.toISOString(),
      createdAt: tx.createdAt.toISOString(),
      categoryName: tx.category?.name ?? null,
      categoryType: tx.category?.type ?? null,
    })),
  }))

  return <WalletsClient initialWallets={serializedWallets} />
}

export default function WalletsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#015C97]" />
        </div>
      }
    >
      <WalletsData />
    </Suspense>
  )
}
