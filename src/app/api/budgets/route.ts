import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const monthStr = searchParams.get('month')
  const yearStr = searchParams.get('year')

  if (!monthStr || !yearStr) {
    return NextResponse.json({ error: 'Missing month or year parameter' }, { status: 400 })
  }

  const month = parseInt(monthStr, 10)
  const year = parseInt(yearStr, 10)

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Invalid month or year parameter' }, { status: 400 })
  }

  try {
    // 1. Fetch budgets for the specific month/year
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        year,
        month,
        ...notDeleted,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 2. Fetch transactions in that month for the user
    // We only care about transactions that match the budget categories
    // and occurred in the specified month/year.
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const categoryIds = budgets.map((b) => b.categoryId)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        categoryId: { in: categoryIds },
        transactionDate: {
          gte: startDate,
          lt: endDate,
        },
        ...notDeleted,
      },
      select: {
        categoryId: true,
        amount: true,
        type: true,
      },
    })

    // 3. Aggregate spent amounts per category
    const spentByCategoryId: Record<string, number> = {}
    
    for (const tx of transactions) {
      if (!tx.categoryId) continue
      
      const amt = Number(tx.amount)
      if (!spentByCategoryId[tx.categoryId]) {
        spentByCategoryId[tx.categoryId] = 0
      }
      
      // For expense categories, EXPENSE transactions increase "spent"
      // For income/savings, INCOME transactions increase "spent" (progress)
      // Since budgets can be applied to both, we'll just sum the absolute amounts 
      // based on the transaction type matching the category type, or just sum all for simplicity.
      // Usually, a transaction type matches the category type.
      spentByCategoryId[tx.categoryId] += amt
    }

    // 4. Map budgets to include spent amount
    const serialized = budgets.map((b) => ({
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

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('[GET /api/budgets]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

  const categoryId = typeof body.categoryId === 'string' ? body.categoryId : ''
  const amountStr  = typeof body.amount     === 'string' ? body.amount : (typeof body.amount === 'number' ? body.amount.toString() : '0')
  const month      = typeof body.month      === 'number' ? body.month : parseInt(body.month as string, 10)
  const year       = typeof body.year       === 'number' ? body.year : parseInt(body.year as string, 10)

  const amount = parseFloat(amountStr)

  if (!categoryId) {
    return NextResponse.json({ error: 'Category ID is required.' }, { status: 422 })
  }
  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Valid budget amount is required.' }, { status: 422 })
  }
  if (isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Valid month (1-12) is required.' }, { status: 422 })
  }
  if (isNaN(year) || year < 2000) {
    return NextResponse.json({ error: 'Valid year is required.' }, { status: 422 })
  }

  try {
    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId, ...notDeleted },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
    }

    // Check if budget already exists for this category and month/year
    const existing = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId,
        month,
        year,
        ...notDeleted,
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'A budget for this category in the specified month already exists.' }, { status: 409 })
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount,
        month,
        year,
        status: 'ACTIVE',
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(
      {
        id:         budget.id,
        categoryId: budget.categoryId,
        amount:     budget.amount.toString(),
        month:      budget.month,
        year:       budget.year,
        status:     budget.status,
        spent:      "0", // Newly created budget has 0 spent (in this response, will be calculated on next GET)
        category: {
          id:   budget.category.id,
          name: budget.category.name,
          type: budget.category.type,
        },
        createdAt:  budget.createdAt.toISOString(),
        updatedAt:  budget.updatedAt.toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/budgets]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
