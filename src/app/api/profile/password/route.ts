import { NextResponse } from 'next/server'
import { hash, compare } from 'bcryptjs'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/rbac'
import { notDeleted } from '@/lib/db-query'

const BCRYPT_ROUNDS = 12

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ code: 'MISSING_FIELDS' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ code: 'PASSWORD_TOO_SHORT' }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ code: 'PASSWORD_MISMATCH' }, { status: 400 })
    }

    // Fetch user with password hash
    const user = await prisma.user.findFirst({
      where: { id: userId, ...notDeleted },
    })

    if (!user) {
      return NextResponse.json({ code: 'USER_NOT_FOUND' }, { status: 404 })
    }

    // Verify current password
    const isCurrentValid = await compare(currentPassword, user.passwordHash)
    if (!isCurrentValid) {
      return NextResponse.json({ code: 'INCORRECT_CURRENT_PASSWORD' }, { status: 400 })
    }

    // Hash and save new password
    const newPasswordHash = await hash(newPassword, BCRYPT_ROUNDS)

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    })

    await logActivity(userId, 'UPDATE_PASSWORD', 'Đã thay đổi mật khẩu tài khoản thành công')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing user password:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
