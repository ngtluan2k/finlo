import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { checkIsAdmin } from '@/lib/rbac'

export async function GET(request: Request) {
  const requesterId = await getAuthenticatedUserId()
  if (!requesterId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const isAdmin = await checkIsAdmin(requesterId)
  if (!isAdmin) {
    return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim() || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10))
  const skip = (page - 1) * limit

  try {
    const whereConditions: any = {}

    if (query) {
      whereConditions.OR = [
        { action: { contains: query, mode: 'insensitive' } },
        { details: { contains: query, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
              {
                profile: {
                  OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { displayName: { contains: query, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          },
        },
      ]
    }

    const [logs, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              email: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where: whereConditions }),
    ])

    return NextResponse.json({
      logs,
      totalCount,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
