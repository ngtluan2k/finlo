import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { checkIsAdmin, logActivity } from '@/lib/rbac'
import { notDeleted } from '@/lib/db-query'

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

  const { roleId } = body

  if (!roleId) {
    return NextResponse.json({ code: 'ROLE_ID_REQUIRED' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id, ...notDeleted },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ code: 'USER_NOT_FOUND' }, { status: 404 })
    }

    const newRole = await prisma.role.findFirst({
      where: { id: roleId, ...notDeleted },
    })

    if (!newRole) {
      return NextResponse.json({ code: 'ROLE_NOT_FOUND' }, { status: 400 })
    }

    const previousRoleName = user.userRoles[0]?.role.name || 'Không có'

    await prisma.$transaction(async (tx) => {
      // Clear previous roles
      await tx.userRole.deleteMany({
        where: { userId: id },
      })

      // Add new role
      await tx.userRole.create({
        data: {
          userId: id,
          roleId,
          assignedBy: requesterId,
        },
      })
    })

    await logActivity(
      requesterId,
      'CHANGE_ROLE',
      `Thay đổi vai trò của ${user.profile?.lastName} ${user.profile?.firstName} (từ: "${previousRoleName}" thành "${newRole.name}")`
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing user role:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
