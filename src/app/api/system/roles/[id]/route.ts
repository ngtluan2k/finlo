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

  const { name, description, level, parentRoleId, permissionIds } = body

  try {
    const role = await prisma.role.findFirst({
      where: { id, ...notDeleted },
    })

    if (!role) {
      return NextResponse.json({ code: 'ROLE_NOT_FOUND' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update basic role metadata if provided
      await tx.role.update({
        where: { id },
        data: {
          name: name !== undefined ? name.trim() : undefined,
          description: description !== undefined ? (description?.trim() || null) : undefined,
          level: level !== undefined ? parseInt(level, 10) : undefined,
          parentRoleId: parentRoleId !== undefined ? (parentRoleId || null) : undefined,
        },
      })

      // 2. Update role permissions if provided in body
      if (Array.isArray(permissionIds)) {
        // Clear all previous permissions for this role
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        })

        // Add new permissions
        if (permissionIds.length > 0) {
          const createData = permissionIds.map((pId: string) => ({
            roleId: id,
            permissionId: pId,
          }))

          await tx.rolePermission.createMany({
            data: createData,
          })
        }
      }
    })

    await logActivity(
      requesterId,
      'UPDATE_ROLE_PERMISSIONS',
      `Cập nhật cấu hình quyền hạn cho vai trò: "${role.name}"`
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating role:', error)
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

  try {
    const role = await prisma.role.findFirst({
      where: { id, ...notDeleted },
    })

    if (!role) {
      return NextResponse.json({ code: 'ROLE_NOT_FOUND' }, { status: 404 })
    }

    // System critical roles cannot be deleted
    const protectedCodes = ['USER', 'ADMIN', 'SUPER_ADMIN']
    if (protectedCodes.includes(role.code)) {
      return NextResponse.json({ code: 'PROTECTED_ROLE' }, { status: 400 })
    }

    // Check if role is assigned to any user
    const assignedUserCount = await prisma.userRole.count({
      where: { roleId: id },
    })

    if (assignedUserCount > 0) {
      return NextResponse.json({ code: 'ROLE_ASSIGNED_TO_USERS' }, { status: 400 })
    }

    // Soft delete
    await prisma.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    })

    await logActivity(
      requesterId,
      'DELETE_ROLE',
      `Xóa vai trò hệ thống: "${role.name}" (${role.code})`
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
