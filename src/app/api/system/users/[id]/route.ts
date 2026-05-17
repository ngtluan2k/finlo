import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { checkIsAdmin, logActivity } from '@/lib/rbac'
import { notDeleted } from '@/lib/db-query'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requesterId = await getAuthenticatedUserId()
  if (!requesterId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const isAdmin = await checkIsAdmin(requesterId)
  if (!isAdmin) {
    return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 })
  }

  const { id } = await params

  try {
    const user = await prisma.user.findFirst({
      where: { id, ...notDeleted },
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
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        id: true,
                        code: true,
                        name: true,
                        module: true,
                        action: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ code: 'USER_NOT_FOUND' }, { status: 404 })
    }

    // Fetch activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Extract flat permission list
    const roleObj = user.userRoles[0]?.role
    const permissions = roleObj
      ? roleObj.rolePermissions.map((rp) => rp.permission)
      : []

    return NextResponse.json({
      user: {
        ...user,
        role: roleObj ? { id: roleObj.id, code: roleObj.code, name: roleObj.name, level: roleObj.level } : null,
      },
      permissions,
      activityLogs,
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requesterId = await getAuthenticatedUserId()
  if (!requesterId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const isAdmin = await checkIsAdmin(requesterId)
  if (!isAdmin) {
    return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 })
  }

  const { id } = await params

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
  }

  const { firstName, lastName, displayName, phone, status } = body

  try {
    const user = await prisma.user.findFirst({
      where: { id, ...notDeleted },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json({ code: 'USER_NOT_FOUND' }, { status: 404 })
    }

    const previousStatus = user.status

    await prisma.$transaction(async (tx) => {
      // Update User fields
      await tx.user.update({
        where: { id },
        data: {
          phone: phone !== undefined ? (phone?.trim() || null) : undefined,
          status: status !== undefined ? status : undefined,
        },
      })

      // Update Profile fields
      await tx.profile.update({
        where: { userId: id },
        data: {
          firstName: firstName !== undefined ? firstName.trim() : undefined,
          lastName: lastName !== undefined ? lastName.trim() : undefined,
          displayName: displayName !== undefined ? (displayName?.trim() || null) : undefined,
        },
      })
    })

    // Log the change
    if (status && status !== previousStatus) {
      const actionMap: Record<string, string> = {
        ACTIVE: 'Kích hoạt tài khoản',
        SUSPENDED: 'Tạm khóa tài khoản',
        INACTIVE: 'Vô hiệu hóa tài khoản',
      }
      const actionText = actionMap[status] || `Thay đổi trạng thái thành ${status}`
      await logActivity(
        requesterId,
        'UPDATE_USER_STATUS',
        `${actionText} của ${user.profile?.lastName} ${user.profile?.firstName} (ID: ${user.id})`
      )
    } else {
      await logActivity(
        requesterId,
        'UPDATE_USER_PROFILE',
        `Cập nhật thông tin hồ sơ của ${user.profile?.lastName} ${user.profile?.firstName} (ID: ${user.id})`
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requesterId = await getAuthenticatedUserId()
  if (!requesterId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const isAdmin = await checkIsAdmin(requesterId)
  if (!isAdmin) {
    return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 })
  }

  const { id } = await params

  if (requesterId === id) {
    return NextResponse.json({ code: 'CANNOT_DELETE_SELF' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id, ...notDeleted },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json({ code: 'USER_NOT_FOUND' }, { status: 404 })
    }

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    })

    await logActivity(
      requesterId,
      'DELETE_USER',
      `Xóa tài khoản người dùng: ${user.profile?.lastName} ${user.profile?.firstName} (${user.email || user.username})`
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
