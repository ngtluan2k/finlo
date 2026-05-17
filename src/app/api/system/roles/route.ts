import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { checkIsAdmin, logActivity } from '@/lib/rbac'
import { notDeleted } from '@/lib/db-query'

export async function GET(request: Request) {
  const requesterId = await getAuthenticatedUserId()
  if (!requesterId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const isAdmin = await checkIsAdmin(requesterId)
  if (!isAdmin) {
    return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 })
  }

  try {
    const roles = await prisma.role.findMany({
      where: notDeleted,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: {
              where: {
                user: notDeleted,
              },
            },
          },
        },
      },
      orderBy: { level: 'desc' },
    })

    // Format role permission mapping cleanly
    const formattedRoles = roles.map((role) => {
      const permissions = role.rolePermissions
        .filter((rp) => rp.permission.status === 'ACTIVE' && rp.permission.deletedAt === null)
        .map((rp) => rp.permission)

      return {
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        level: role.level,
        status: role.status,
        parentRoleId: role.parentRoleId,
        userCount: role._count.userRoles,
        permissions,
      }
    })

    return NextResponse.json(formattedRoles)
  } catch (error) {
    console.error('Error fetching roles:', error)
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

  const { code, name, description, level, parentRoleId } = body

  if (!code || !name) {
    return NextResponse.json({ code: 'MISSING_FIELDS' }, { status: 400 })
  }

  try {
    const formattedCode = code.toUpperCase().trim()

    // Check duplicate code
    const existing = await prisma.role.findFirst({
      where: { code: formattedCode, ...notDeleted },
    })

    if (existing) {
      return NextResponse.json({ code: 'ROLE_CODE_EXISTS' }, { status: 400 })
    }

    const createdRole = await prisma.role.create({
      data: {
        code: formattedCode,
        name: name.trim(),
        description: description?.trim() || null,
        level: level ? parseInt(level, 10) : 10,
        parentRoleId: parentRoleId || null,
      },
    })

    await logActivity(
      requesterId,
      'CREATE_ROLE',
      `Tạo vai trò hệ thống mới: "${name.trim()}" (${formattedCode})`
    )

    return NextResponse.json({ success: true, id: createdRole.id })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
