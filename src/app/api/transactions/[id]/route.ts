import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'
import { logActivity } from '@/lib/rbac'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { id } = await params

  try {
    // 1. Run deletion and balance reversal inside a database transaction
    await prisma.$transaction(async (tx) => {
      // Find active transaction
      const transaction = await tx.transaction.findFirst({
        where: {
          id,
          userId,
          ...notDeleted,
        },
      })

      if (!transaction) {
        throw new Error('TRANSACTION_NOT_FOUND')
      }

      const amount = Number(transaction.amount)
      const isIncome = transaction.type === 'INCOME'

      // Revert wallet balance
      // If it was Income: decrement balance. If Expense: increment balance.
      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: isIncome 
            ? { decrement: amount } 
            : { increment: amount },
        },
      })

      // Soft delete transaction
      await tx.transaction.update({
        where: { id },
        data: { deletedAt: new Date() },
      })

      // Log system activity log
      await logActivity(userId, 'DELETE_TRANSACTION', `Đã xóa giao dịch loại ${transaction.type} trị giá ${amount.toLocaleString()} đ`)
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting transaction:', error)
    if (error.message === 'TRANSACTION_NOT_FOUND') {
      return NextResponse.json({ code: 'TRANSACTION_NOT_FOUND' }, { status: 404 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
