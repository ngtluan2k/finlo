import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { getUserPermissions, logActivity } from '@/lib/rbac'
import { notDeleted } from '@/lib/db-query'

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Tên không được để trống').max(100, 'Tên tối đa 100 ký tự'),
  lastName: z.string().min(1, 'Họ không được để trống').max(100, 'Họ tối đa 100 ký tự'),
  displayName: z.string().max(255, 'Tên hiển thị tối đa 255 ký tự').optional().nullable(),
  bio: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  address: z.string().max(500, 'Địa chỉ tối đa 500 ký tự').optional().nullable(),
  city: z.string().max(100, 'Thành phố tối đa 100 ký tự').optional().nullable(),
  country: z.string().max(2, 'Mã quốc gia tối đa 2 ký tự (Ví dụ: VN, US)').optional().nullable(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().max(500, 'Đường dẫn ảnh tối đa 500 ký tự').optional().nullable(),
})

export async function GET() {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, ...notDeleted },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            bio: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            city: true,
            country: true,
            locale: true,
            timezone: true,
            avatarUrl: true,
            updatedAt: true,
          },
        },
        userRoles: {
          where: {
            role: {
              deletedAt: null,
              status: 'ACTIVE',
            },
          },
          select: {
            role: {
              select: {
                id: true,
                code: true,
                name: true,
                level: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ code: 'USER_NOT_FOUND' }, { status: 404 })
    }

    // 1. Fetch permissions
    const permissions = await getUserPermissions(userId)

    // 2. Fetch stats
    const [loginsCount, operationsCount, walletsCount, budgetsCount, categoriesCount, transactionsCount] = await Promise.all([
      prisma.activityLog.count({ where: { userId, action: 'LOGIN' } }),
      prisma.activityLog.count({ where: { userId, NOT: { action: 'LOGIN' } } }),
      prisma.wallet.count({ where: { userId, deletedAt: null } }),
      prisma.budget.count({ where: { userId, deletedAt: null } }),
      prisma.category.count({ where: { userId, deletedAt: null } }),
      prisma.transaction.count({ where: { userId, deletedAt: null } }),
    ])

    const dataCreatedCount = walletsCount + budgetsCount + categoriesCount
    const dataUpdatedCount = transactionsCount // using transactions count as operations placeholder or dynamic updated metrics

    // 3. Fetch latest 5 activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        action: true,
        details: true,
        ipAddress: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        profile: user.profile,
        roles: user.userRoles.map((ur) => ur.role),
        permissions,
      },
      stats: {
        logins: loginsCount,
        operations: operationsCount,
        created: dataCreatedCount,
        updated: dataUpdatedCount,
      },
      activityLogs,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
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
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ code: 'INVALID_DATA', errors: parsed.error.format() }, { status: 400 })
    }

    const data = parsed.data

    // Check unique phone number if provided
    if (data.phone && data.phone.trim() !== '') {
      const formattedPhone = data.phone.trim()
      const existingPhoneUser = await prisma.user.findFirst({
        where: {
          phone: formattedPhone,
          id: { not: userId },
          deletedAt: null,
        },
      })
      if (existingPhoneUser) {
        return NextResponse.json({ code: 'PHONE_EXISTS' }, { status: 400 })
      }
    }

    // Run updates in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update user fields
      await tx.user.update({
        where: { id: userId },
        data: {
          phone: data.phone?.trim() || null,
        },
      })

      // 2. Update profile fields
      await tx.profile.update({
        where: { userId },
        data: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          displayName: data.displayName?.trim() || null,
          bio: data.bio?.trim() || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender || null,
          address: data.address?.trim() || null,
          city: data.city?.trim() || null,
          country: data.country ? data.country.trim().substring(0, 2).toUpperCase() : null,
          avatarUrl: data.avatarUrl?.trim() || null,
        },
      })
    })

    await logActivity(userId, 'UPDATE_PROFILE', 'Đã cập nhật thông tin hồ sơ cá nhân')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
