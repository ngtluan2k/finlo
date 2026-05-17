import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'

const VALID_TYPES    = ['CASH', 'BANK', 'E_WALLET', 'CREDIT_CARD', 'OTHER'] as const
const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const

type Params = { params: Promise<{ id: string }> }

// PATCH /api/wallets/[id] — update wallet fields
export async function PATCH(request: Request, { params }: Params) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Verify ownership
  const existing = await prisma.wallet.findFirst({
    where: { id, userId, ...notDeleted },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Wallet not found.' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name     = typeof body.name    === 'string' ? body.name.trim()    : existing.name
  const type     = typeof body.type    === 'string' ? body.type           : existing.type
  const balance  = typeof body.balance === 'string' ? parseFloat(body.balance) : Number(existing.balance)
  const status   = typeof body.status  === 'string' ? body.status         : existing.status
  const metadata = body.metadata !== undefined ? (body.metadata && typeof body.metadata === 'object' ? body.metadata : null) : existing.metadata

  if (!name) {
    return NextResponse.json({ error: 'Wallet name is required.' }, { status: 422 })
  }
  if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
    return NextResponse.json({ error: 'Invalid wallet type.' }, { status: 422 })
  }
  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 422 })
  }
  if (isNaN(balance)) {
    return NextResponse.json({ error: 'Invalid balance.' }, { status: 422 })
  }

  try {
    const wallet = await prisma.wallet.update({
      where: { id },
      data: {
        name,
        type:   type as typeof VALID_TYPES[number],
        balance,
        status: status as typeof VALID_STATUSES[number],
        metadata: metadata as any,
      },
      include: {
        transactions: {
          where: { ...notDeleted },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { category: { select: { name: true, type: true } } },
        },
      },
    })

    return NextResponse.json({
      id:        wallet.id,
      name:      wallet.name,
      balance:   wallet.balance.toString(),
      type:      wallet.type,
      status:    wallet.status,
      metadata:  wallet.metadata,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
      transactions: wallet.transactions.map((tx) => ({
        id:              tx.id,
        amount:          tx.amount.toString(),
        type:            tx.type,
        status:          tx.status,
        note:            tx.note,
        transactionDate: tx.transactionDate.toISOString(),
        createdAt:       tx.createdAt.toISOString(),
        categoryName:    tx.category?.name ?? null,
        categoryType:    tx.category?.type ?? null,
      })),
    })
  } catch (error) {
    console.error('[PATCH /api/wallets/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/wallets/[id] — soft-delete wallet
export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.wallet.findFirst({
    where: { id, userId, ...notDeleted },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Wallet not found.' }, { status: 404 })
  }

  try {
    await prisma.wallet.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/wallets/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
