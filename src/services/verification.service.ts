import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'
import { getAppBaseUrl } from '@/lib/app-url'
import type { Locale } from '@/i18n/config'
import {
  createRawVerificationToken,
  hashVerificationToken,
  RESEND_COOLDOWN_MS,
  VERIFICATION_TOKEN_TTL_MS,
} from '@/lib/verification-token'
import { sendVerificationEmail } from '@/services/email.service'
import { logActivity } from '@/lib/rbac'

export class VerificationError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'USER_NOT_FOUND'
      | 'ALREADY_VERIFIED'
      | 'TOKEN_INVALID'
      | 'TOKEN_EXPIRED'
      | 'RESEND_TOO_SOON'
      | 'SEND_FAILED',
  ) {
    super(message)
    this.name = 'VerificationError'
  }
}

async function invalidateChannelTokens(userId: string, channel: 'EMAIL' | 'PHONE') {
  await prisma.verificationToken.updateMany({
    where: { userId, channel, usedAt: null },
    data: { usedAt: new Date() },
  })
}

export async function issueEmailVerification(
  userId: string,
  email: string,
  locale: Locale,
) {
  const raw = createRawVerificationToken()
  const tokenHash = hashVerificationToken(raw)
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)

  await invalidateChannelTokens(userId, 'EMAIL')

  await prisma.verificationToken.create({
    data: {
      userId,
      channel: 'EMAIL',
      target: email,
      tokenHash,
      expiresAt,
    },
  })

  const verifyUrl = `${getAppBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(raw)}`

  try {
    await sendVerificationEmail(email, verifyUrl, locale)
  } catch (error) {
    console.error('[verification] send email failed', error)
    throw new VerificationError('Gửi email thất bại', 'SEND_FAILED')
  }

  return { verifyUrl }
}

export async function verifyEmailByToken(rawToken: string) {
  const tokenHash = hashVerificationToken(rawToken)

  const record = await prisma.verificationToken.findFirst({
    where: {
      tokenHash,
      channel: 'EMAIL',
      usedAt: null,
    },
    include: {
      user: true,
    },
  })

  if (!record) {
    throw new VerificationError('Liên kết không hợp lệ', 'TOKEN_INVALID')
  }

  if (record.expiresAt < new Date()) {
    throw new VerificationError('Liên kết đã hết hạn', 'TOKEN_EXPIRED')
  }

  if (record.user.deletedAt) {
    throw new VerificationError('Liên kết không hợp lệ', 'TOKEN_INVALID')
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    })

    await tx.user.update({
      where: { id: record.userId },
      data: {
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    })
  })

  await logActivity(record.userId, 'VERIFY_EMAIL', 'Xác thực email thành công')

  return { email: record.target }
}

type UserVerificationState = {
  status: string
  emailVerifiedAt: Date | null
}

export function isUserEmailVerified(user: UserVerificationState) {
  return Boolean(user.emailVerifiedAt) || user.status === 'ACTIVE'
}

export async function isEmailVerified(email: string) {
  const normalized = email.trim().toLowerCase()

  const user = await prisma.user.findFirst({
    where: { email: normalized, ...notDeleted },
    select: { status: true, emailVerifiedAt: true },
  })

  if (!user) {
    return false
  }

  return isUserEmailVerified(user)
}

export async function resendEmailVerification(email: string, locale: Locale) {
  const normalized = email.trim().toLowerCase()

  const user = await prisma.user.findFirst({
    where: { email: normalized, ...notDeleted },
  })

  if (!user) {
    throw new VerificationError('Không tìm thấy tài khoản', 'USER_NOT_FOUND')
  }

  if (isUserEmailVerified(user)) {
    throw new VerificationError('Email đã được xác thực', 'ALREADY_VERIFIED')
  }

  const latest = await prisma.verificationToken.findFirst({
    where: { userId: user.id, channel: 'EMAIL', usedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new VerificationError('Vui lòng đợi trước khi gửi lại', 'RESEND_TOO_SOON')
  }

  if (!user.email) {
    throw new VerificationError('Không tìm thấy tài khoản', 'USER_NOT_FOUND')
  }

  await logActivity(user.id, 'RESEND_VERIFICATION_EMAIL', `Yêu cầu gửi lại email xác thực tới ${normalized}`)

  return issueEmailVerification(user.id, user.email, locale)
}
