import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { notDeleted, softDeleteData } from '@/lib/db-query'

const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 })
  }

  const existing = await prisma.budget.findFirst({
    where: { id, userId, ...notDeleted },
    include: { category: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const amountStr = body.amount !== undefined ? (typeof body.amount === 'string' ? body.amount : String(body.amount)) : existing.amount.toString()
  const status    = typeof body.status === 'string' ? body.status : existing.status
  const amount = parseFloat(amountStr)

  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Valid budget amount is required.' }, { status: 422 })
  }
  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 422 })
  }

  try {
    const budget = await prisma.budget.update({
      where: { id },
      data: {
        amount,
        status: status as typeof VALID_STATUSES[number],
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      id:         budget.id,
      categoryId: budget.categoryId,
      amount:     budget.amount.toString(),
      month:      budget.month,
      year:       budget.year,
      status:     budget.status,
      // For PATCH response, spent is not strictly necessary or we can default to 0 for the UI optimistic update
      // Since UI will just update the amount in place, it already knows the old `spent` value.
      category: {
        id:   budget.category.id,
        name: budget.category.name,
        type: budget.category.type,
      },
      createdAt:  budget.createdAt.toISOString(),
      updatedAt:  budget.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[PATCH /api/budgets/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 })
  }

  const existing = await prisma.budget.findFirst({
    where: { id, userId, ...notDeleted },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
  }

  try {
    await prisma.budget.update({
      where: { id },
      data: softDeleteData(),
    })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('[DELETE /api/budgets/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
