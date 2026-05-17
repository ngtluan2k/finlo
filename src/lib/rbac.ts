import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'

/**
 * Checks if a user has administrative privileges (ADMIN or SUPER_ADMIN)
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        code: { in: ['ADMIN', 'SUPER_ADMIN'] },
        status: 'ACTIVE',
        ...notDeleted,
      },
    },
  })
  return !!userRole
}

/**
 * Gets all active permission codes assigned to a user through their roles
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  })

  const permissions = new Set<string>()
  for (const ur of userRoles) {
    if (ur.role.status !== 'ACTIVE' || ur.role.deletedAt !== null) {
      continue
    }
    for (const rp of ur.role.rolePermissions) {
      if (rp.permission.status === 'ACTIVE' && rp.permission.deletedAt === null) {
        permissions.add(rp.permission.code)
      }
    }
  }

  return Array.from(permissions)
}

/**
 * Checks if a user has a specific permission
 */
export async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  // Admins with SUPER_ADMIN role automatically bypass permission checks
  const isSuperAdmin = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        code: 'SUPER_ADMIN',
        status: 'ACTIVE',
        ...notDeleted,
      },
    },
  })
  if (isSuperAdmin) return true

  const permissions = await getUserPermissions(userId)
  return permissions.includes(permissionCode)
}

/**
 * Creates an audit log entry for user activities
 */
export async function logActivity(
  userId: string,
  action: string,
  details?: string,
  ipAddress = '127.0.0.1'
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
      },
    })
  } catch (error) {
    console.error('Failed to write activity log:', error)
  }
}
