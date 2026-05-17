import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import {
  getOrCreateUserSettings,
  updateUserSettings,
} from '@/services/settings.service'
import { patchSettingsSchema } from '@/validations/settings.schema'
import { logActivity } from '@/lib/rbac'

export async function GET() {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const settings = await getOrCreateUserSettings(userId)
  return NextResponse.json(settings)
}

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

  const parsed = patchSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
  }

  if (parsed.data.theme === undefined && parsed.data.preferences === undefined) {
    return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
  }

  const settings = await updateUserSettings(userId, parsed.data)

  await logActivity(
    userId,
    'UPDATE_SETTINGS',
    `Cập nhật cấu hình giao diện/tùy chọn cá nhân${parsed.data.theme ? ` (Giao diện: ${parsed.data.theme})` : ''}`
  )

  return NextResponse.json(settings)
}
