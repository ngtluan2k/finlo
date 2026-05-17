import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { checkIsAdmin, logActivity } from '@/lib/rbac'
import { notDeleted } from '@/lib/db-query'
import type { UserStatus } from '@/generated/prisma/client'

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
  const status = searchParams.get('status') || ''
  const roleId = searchParams.get('roleId') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10))
  const skip = (page - 1) * limit

  try {
    // 1. Build where conditions
    const whereConditions: any = {
      ...notDeleted,
    }

    if (status) {
      whereConditions.status = status as UserStatus
    }

    if (roleId) {
      whereConditions.userRoles = {
        some: {
          roleId,
        },
      }
    }

    if (query) {
      whereConditions.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        {
          profile: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
      ]
    }

    // 2. Fetch paginated users
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        select: {
          id: true,
          email: true,
          phone: true,
          username: true,
          status: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              displayName: true,
              locale: true,
              timezone: true,
              avatarUrl: true,
            },
          },
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  level: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereConditions }),
    ])

    // 3. Compute stats for summary cards
    const [totalUsers, activeUsers, suspendedUsers, inactiveUsers] = await Promise.all([
      prisma.user.count({ where: notDeleted }),
      prisma.user.count({ where: { status: 'ACTIVE', ...notDeleted } }),
      prisma.user.count({ where: { status: 'SUSPENDED', ...notDeleted } }),
      prisma.user.count({ where: { status: 'INACTIVE', ...notDeleted } }),
    ])

    return NextResponse.json({
      users,
      totalCount,
      page,
      limit,
      stats: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        inactive: inactiveUsers,
      },
    })
  } catch (error) {
    console.error('Error fetching system users:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const requesterId = await getAuthenticatedUserId()
  if (!requesterId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const isAdmin = await checkIsAdmin(requesterId)
  if (!isAdmin) {
    return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
  }

  const { email, username, firstName, lastName, phone, password, roleId, status } = body

  if (!email || !firstName || !lastName || !password || !roleId) {
    return NextResponse.json({ code: 'MISSING_FIELDS' }, { status: 400 })
  }

  try {
    const formattedEmail = email.trim().toLowerCase()
    const formattedUsername = username?.trim().toLowerCase() || formattedEmail.split('@')[0]

    // Check unique email & username
    const existingUser = await prisma.user.findFirst({
      where: {
        ...notDeleted,
        OR: [
          { email: formattedEmail },
          { username: formattedUsername },
        ],
      },
    })

    if (existingUser) {
      if (existingUser.email === formattedEmail) {
        return NextResponse.json({ code: 'EMAIL_EXISTS' }, { status: 400 })
      }
      return NextResponse.json({ code: 'USERNAME_EXISTS' }, { status: 400 })
    }

    // Verify role exists
    const role = await prisma.role.findFirst({
      where: { id: roleId, ...notDeleted },
    })
    if (!role) {
      return NextResponse.json({ code: 'ROLE_NOT_FOUND' }, { status: 400 })
    }

    const passwordHash = await hash(password, 12)

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: formattedEmail,
          username: formattedUsername,
          phone: phone?.trim() || null,
          passwordHash,
          status: (status as any) || 'ACTIVE',
          emailVerifiedAt: new Date(), // Admin created accounts are verified by default
        },
      })

      await tx.profile.create({
        data: {
          userId: createdUser.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          locale: 'vi',
          timezone: 'Asia/Ho_Chi_Minh',
        },
      })

      await tx.userRole.create({
        data: {
          userId: createdUser.id,
          roleId: role.id,
        },
      })

      await tx.userSettings.create({
        data: {
          userId: createdUser.id,
          theme: 'SYSTEM',
        },
      })

      return createdUser
    })

    await logActivity(
      requesterId,
      'CREATE_USER',
      `Tạo tài khoản nhân viên mới cho ${lastName.trim()} ${firstName.trim()} (${formattedEmail}) với vai trò: ${role.name}`
    )

    return NextResponse.json({ success: true, id: newUser.id })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
