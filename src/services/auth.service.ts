import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'
import type { Locale } from '@/i18n/config'
import type { RegisterInput } from '@/validations/auth.schema'
import { createDefaultUserSettings } from '@/services/settings.service'
import { issueEmailVerification } from '@/services/verification.service'
import { resolveAvailableUsername } from '@/services/username.service'
import { logActivity } from '@/lib/rbac'

const BCRYPT_ROUNDS = 12

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'INVALID_CREDENTIALS'
      | 'EMAIL_EXISTS'
      | 'USER_INACTIVE'
      | 'EMAIL_NOT_VERIFIED',
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

function parseIdentifier(identifier: string) {
  const value = identifier.trim()
  if (value.includes('@')) {
    return { email: value.toLowerCase() }
  }
  if (/^\+?\d[\d\s-]{7,}$/.test(value)) {
    return { phone: value.replace(/\s/g, '') }
  }
  return { username: value.toLowerCase() }
}

export async function registerUser(input: RegisterInput, locale: Locale) {
  const email = input.email.toLowerCase()

  const existing = await prisma.user.findFirst({
    where: { email, ...notDeleted },
  })
  if (existing) {
    throw new AuthError('Email đã được sử dụng', 'EMAIL_EXISTS')
  }

  const passwordHash = await hash(input.password, BCRYPT_ROUNDS)

  const userRole = await prisma.role.findFirst({
    where: { code: 'USER', deletedAt: null, status: 'ACTIVE' },
  })
  if (!userRole) {
    throw new Error('Vai trò USER chưa được seed. Chạy: npm run db:seed')
  }

  const user = await prisma.$transaction(async (tx) => {
    const username = await resolveAvailableUsername(
      tx,
      input.firstName,
      input.lastName,
    )

    const created = await tx.user.create({
      data: {
        email,
        username,
        passwordHash,
      },
    })

    await tx.profile.create({
      data: {
        userId: created.id,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        locale,
      },
    })

    await tx.userRole.create({
      data: { userId: created.id, roleId: userRole.id },
    })

    await createDefaultUserSettings(tx, created.id)

    return created
  })

  await logActivity(user.id, 'REGISTER', 'Đăng ký tài khoản thành công')

  await issueEmailVerification(user.id, email, locale)

  return user
}

export async function verifyCredentials(identifier: string, password: string) {
  const where = parseIdentifier(identifier)

  const user = await prisma.user.findFirst({
    where: {
      ...notDeleted,
      OR: [
        where.email ? { email: where.email } : undefined,
        where.phone ? { phone: where.phone } : undefined,
        where.username ? { username: where.username } : undefined,
      ].filter((clause): clause is NonNullable<typeof clause> => Boolean(clause)),
    },
    include: { profile: true },
  })

  if (!user) {
    throw new AuthError('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS')
  }

  const valid = await compare(password, user.passwordHash)
  if (!valid) {
    throw new AuthError('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS')
  }

  if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
    throw new AuthError('Tài khoản không khả dụng', 'USER_INACTIVE')
  }

  if (user.status !== 'ACTIVE' || !user.emailVerifiedAt) {
    throw new AuthError('Email chưa được xác thực', 'EMAIL_NOT_VERIFIED')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return user
}
