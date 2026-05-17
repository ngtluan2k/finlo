import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'

// GET /api/wallets — list all wallets for the authenticated user
export async function GET() {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId, ...notDeleted },
      orderBy: { createdAt: 'desc' },
      include: {
        transactions: {
          where: { ...notDeleted },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { category: { select: { name: true, type: true } } },
        },
      },
    })

    const serialized = wallets.map((w) => ({
      id:        w.id,
      name:      w.name,
      balance:   w.balance.toString(),
      type:      w.type,
      status:    w.status,
      metadata:  w.metadata,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
      transactions: w.transactions.map((tx) => ({
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
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('[GET /api/wallets]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const VALID_TYPES    = ['CASH', 'BANK', 'E_WALLET', 'CREDIT_CARD', 'OTHER'] as const
const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const

// POST /api/wallets — create a new wallet
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name     = typeof body.name    === 'string' ? body.name.trim()    : ''
  const type     = typeof body.type    === 'string' ? body.type           : 'CASH'
  const balance  = typeof body.balance === 'string' ? parseFloat(body.balance) : 0
  const status   = typeof body.status  === 'string' ? body.status         : 'ACTIVE'
  const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : null

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
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        name,
        type:    type as typeof VALID_TYPES[number],
        balance,
        status:  status as typeof VALID_STATUSES[number],
        metadata: metadata ? (metadata as any) : undefined,
      },
    })

    return NextResponse.json(
      {
        id:           wallet.id,
        name:         wallet.name,
        balance:      wallet.balance.toString(),
        type:         wallet.type,
        status:       wallet.status,
        metadata:     wallet.metadata,
        createdAt:    wallet.createdAt.toISOString(),
        updatedAt:    wallet.updatedAt.toISOString(),
        transactions: [],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/wallets]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
