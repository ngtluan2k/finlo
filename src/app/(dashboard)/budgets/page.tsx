import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'
import { BudgetsClient } from '@/components/budgets/budgets-client'

export async function generateMetadata() {
  const t = await getTranslations('budgets')
  return {
    title: `${t('title')} - Finlo`,
    description: t('subtitle'),
  }
}

async function BudgetsData({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const today = new Date()
  const month = resolvedParams.month ? parseInt(resolvedParams.month, 10) : today.getMonth() + 1
  const year = resolvedParams.year ? parseInt(resolvedParams.year, 10) : today.getFullYear()

  // Initial fetch matches the logic in /api/budgets/route.ts
  const budgets = await prisma.budget.findMany({
    where: { userId, year, month, ...notDeleted },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)
  const categoryIds = budgets.map((b) => b.categoryId)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      categoryId: { in: categoryIds },
      transactionDate: { gte: startDate, lt: endDate },
      ...notDeleted,
    },
    select: { categoryId: true, amount: true },
  })

  const spentByCategoryId: Record<string, number> = {}
  for (const tx of transactions) {
    if (!tx.categoryId) continue
    const amt = Number(tx.amount)
    if (!spentByCategoryId[tx.categoryId]) spentByCategoryId[tx.categoryId] = 0
    spentByCategoryId[tx.categoryId] += amt
  }

  const serializedBudgets = budgets.map((b) => ({
    id:         b.id,
    categoryId: b.categoryId,
    amount:     b.amount.toString(),
    month:      b.month,
    year:       b.year,
    status:     b.status,
    spent:      (spentByCategoryId[b.categoryId] || 0).toString(),
    category: {
      id:   b.category.id,
      name: b.category.name,
      type: b.category.type,
    },
    createdAt:  b.createdAt.toISOString(),
    updatedAt:  b.updatedAt.toISOString(),
  }))

  return <BudgetsClient initialBudgets={serializedBudgets} initialMonth={month} initialYear={year} />
}

export default function BudgetsPage(props: { searchParams: Promise<{ month?: string; year?: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#015C97]" />
        </div>
      }
    >
      <BudgetsData searchParams={props.searchParams} />
    </Suspense>
  )
}
