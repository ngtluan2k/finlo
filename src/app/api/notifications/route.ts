import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const type = searchParams.get('type')
  const status = searchParams.get('status')

  const where = {
    userId,
    deleted: false,
    ...(type && type !== 'all' ? { type: type as any } : {}),
    ...(status && status !== 'all' ? { status: status as any } : {}),
  }

  try {
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const totalCount = await prisma.notification.count({ where })

    // Provide detailed counts for the frontend filter tabs
    const counts = await Promise.all([
      prisma.notification.count({ where: { userId, deleted: false } }),
      prisma.notification.count({ where: { userId, deleted: false, status: 'UNREAD' } }),
      prisma.notification.count({ where: { userId, deleted: false, type: 'TRANSACTION' } }),
      prisma.notification.count({ where: { userId, deleted: false, type: 'BUDGET' } }),
      prisma.notification.count({ where: { userId, deleted: false, type: 'SYSTEM' } }),
      prisma.notification.count({ where: { userId, deleted: false, type: 'REMINDER' } }),
    ])

    const summary = {
      all: counts[0],
      unread: counts[1],
      transaction: counts[2],
      budget: counts[3],
      system: counts[4],
      promotion: counts[5], // Map REMINDER to "Khuyến mãi" in UI
    }

    return NextResponse.json({ 
      notifications, 
      unreadCount: counts[1], // For backward compatibility with dropdown
      summary,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, all } = body as { id?: string; all?: boolean }

    if (all) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId,
          status: 'UNREAD',
          deleted: false,
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      })
    } else if (id) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: {
          id,
          userId,
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      })
    } else {
      return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, all } = body as { id?: string; all?: boolean }

    if (all) {
      // Soft-delete all notifications
      await prisma.notification.updateMany({
        where: {
          userId,
          deleted: false,
        },
        data: {
          deleted: true,
        },
      })
    } else if (id) {
      // Soft-delete specific notification
      await prisma.notification.update({
        where: {
          id,
          userId,
        },
        data: {
          deleted: true,
        },
      })
    } else {
      return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
