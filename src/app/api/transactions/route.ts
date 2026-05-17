import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'
import { logActivity } from '@/lib/rbac'
import { TransactionType } from '@/generated/prisma/client'

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim() || ''
  const type = searchParams.get('type') || ''
  const walletId = searchParams.get('walletId') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const startDateStr = searchParams.get('startDate') || ''
  const endDateStr = searchParams.get('endDate') || ''
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10))
  const skip = (page - 1) * limit

  try {
    // 1. Build where conditions
    const whereConditions: any = {
      userId,
      ...notDeleted,
    }

    if (type) {
      whereConditions.type = type as TransactionType
    }

    if (walletId) {
      whereConditions.walletId = walletId
    }

    if (categoryId) {
      if (categoryId === 'null') {
        whereConditions.categoryId = null
      } else {
        whereConditions.categoryId = categoryId
      }
    }

    if (startDateStr || endDateStr) {
      whereConditions.transactionDate = {}
      if (startDateStr) {
        whereConditions.transactionDate.gte = new Date(startDateStr)
      }
      if (endDateStr) {
        // Set end of day for the end date to ensure all transactions of that day are included
        const endOfDay = new Date(endDateStr)
        endOfDay.setHours(23, 59, 59, 999)
        whereConditions.transactionDate.lte = endOfDay
      }
    }

    if (query) {
      whereConditions.OR = [
        { note: { contains: query, mode: 'insensitive' } },
        {
          category: {
            name: { contains: query, mode: 'insensitive' },
          },
        },
      ]
    }

    // 2. Fetch paginated transactions and total count
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereConditions,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          wallet: {
            select: {
              id: true,
              name: true,
              type: true,
              balance: true,
            },
          },
        },
        orderBy: {
          transactionDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: whereConditions,
      }),
    ])

    // 3. Aggregate statistics for the filtered period (or default current calendar month)
    const statsWhere: any = {
      userId,
      ...notDeleted,
    }

    // If no date range filters are passed, default stats to current calendar month
    if (!startDateStr && !endDateStr) {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      statsWhere.transactionDate = {
        gte: firstDay,
        lte: lastDay,
      }
    } else {
      statsWhere.transactionDate = whereConditions.transactionDate
    }

    const allStatsTransactions = await prisma.transaction.findMany({
      where: statsWhere,
      select: {
        amount: true,
        type: true,
      },
    })

    let totalIncome = 0
    let totalExpense = 0

    allStatsTransactions.forEach((tx) => {
      const val = Number(tx.amount)
      if (tx.type === 'INCOME') {
        totalIncome += val
      } else if (tx.type === 'EXPENSE') {
        totalExpense += val
      }
    })

    // Balance is the sum of all active wallet balances in real-time
    const wallets = await prisma.wallet.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        ...notDeleted,
      },
      select: {
        balance: true,
      },
    })
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0)

    const savingsRate = totalIncome > 0 
      ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) 
      : 0

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalIncome,
        totalExpense,
        balance: totalBalance,
        savingsRate,
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { amount, type, walletId, categoryId, transactionDate, note, toWalletId } = data

    if (!amount || isNaN(amount) || amount <= 0 || !type || !walletId) {
      return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 })
    }

    const parsedDate = transactionDate ? new Date(transactionDate) : new Date()

    // 1. Run creation inside a transaction lock to adjust balances safely
    const result = await prisma.$transaction(async (tx) => {
      // Verify origin wallet ownership
      const originWallet = await tx.wallet.findFirst({
        where: { id: walletId, userId, ...notDeleted },
      })
      if (!originWallet) {
        throw new Error('ORIGIN_WALLET_NOT_FOUND')
      }

      if (type === 'TRANSFER') {
        if (!toWalletId) {
          throw new Error('DESTINATION_WALLET_REQUIRED')
        }
        // Verify destination wallet ownership
        const destWallet = await tx.wallet.findFirst({
          where: { id: toWalletId, userId, ...notDeleted },
        })
        if (!destWallet) {
          throw new Error('DESTINATION_WALLET_NOT_FOUND')
        }

        // Subtract from origin wallet
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        })

        // Add to destination wallet
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: { increment: amount } },
        })

        // Create transaction out for origin wallet
        const txOut = await tx.transaction.create({
          data: {
            userId,
            walletId,
            categoryId: categoryId || null,
            amount,
            type: 'EXPENSE', // Logged as out/expense for statistical balance
            status: 'COMPLETED',
            note: note || `Chuyển tiền sang ${destWallet.name}`,
            transactionDate: parsedDate,
          },
        })

        // Create transaction in for destination wallet
        const txIn = await tx.transaction.create({
          data: {
            userId,
            walletId: toWalletId,
            categoryId: categoryId || null,
            amount,
            type: 'INCOME', // Logged as in/income for statistical balance
            status: 'COMPLETED',
            note: note || `Nhận tiền từ ${originWallet.name}`,
            transactionDate: parsedDate,
          },
        })

        return txOut
      } else {
        // Income or Expense
        const isIncome = type === 'INCOME'

        // Adjust balance
        await tx.wallet.update({
          where: { id: walletId },
          data: {
            balance: isIncome 
              ? { increment: amount } 
              : { decrement: amount },
          },
        })

        // Create transaction
        const newTx = await tx.transaction.create({
          data: {
            userId,
            walletId,
            categoryId: categoryId || null,
            amount,
            type,
            status: 'COMPLETED',
            note: note || '',
            transactionDate: parsedDate,
          },
        })

        return newTx
      }
    })

    // Log Activity
    await logActivity(userId, 'CREATE_TRANSACTION', `Đã tạo giao dịch loại ${type} trị giá ${Number(amount).toLocaleString()} đ`)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    if (error.message === 'ORIGIN_WALLET_NOT_FOUND') {
      return NextResponse.json({ code: 'ORIGIN_WALLET_NOT_FOUND' }, { status: 400 })
    }
    if (error.message === 'DESTINATION_WALLET_REQUIRED') {
      return NextResponse.json({ code: 'DESTINATION_WALLET_REQUIRED' }, { status: 400 })
    }
    if (error.message === 'DESTINATION_WALLET_NOT_FOUND') {
      return NextResponse.json({ code: 'DESTINATION_WALLET_NOT_FOUND' }, { status: 400 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
