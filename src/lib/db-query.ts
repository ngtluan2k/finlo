import type { UserStatus } from '@/generated/prisma/client'

/** Filter non–soft-deleted records */
export const notDeleted = { deletedAt: null } as const

/** Active user account for login / session */
export function activeUserWhere(identifier: {
  email?: string
  phone?: string
  username?: string
}) {
  const or = [
    identifier.email ? { email: identifier.email } : null,
    identifier.phone ? { phone: identifier.phone } : null,
    identifier.username ? { username: identifier.username } : null,
  ].filter(Boolean)

  return {
    deletedAt: null,
    status: 'ACTIVE' satisfies UserStatus,
    OR: or,
  }
}

/** Soft-delete payload for business entities */
export function softDeleteData() {
  return {
    deletedAt: new Date(),
    status: 'ARCHIVED' as const,
  }
}
