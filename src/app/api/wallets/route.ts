import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'

export async function GET() {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const wallets = await prisma.wallet.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        ...notDeleted,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(wallets)
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
