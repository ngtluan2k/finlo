import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { isLocale } from '@/i18n/config'

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
  }

  const { locale } = body as { locale?: string }

  if (!locale || !isLocale(locale)) {
    return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
  }

  try {
    await prisma.profile.update({
      where: { userId },
      data: { locale },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user profile locale:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
