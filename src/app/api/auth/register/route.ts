import { NextResponse } from 'next/server'
import { localeFromRequest } from '@/lib/locale-from-request'
import { registerSchema } from '@/validations/auth.schema'
import { AuthError, registerUser } from '@/services/auth.service'
import { VerificationError } from '@/services/verification.service'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { code: 'INVALID_DATA' },
      { status: 400 },
    )
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'INVALID_DATA' },
      { status: 400 },
    )
  }

  try {
    const locale = localeFromRequest(request)
    const user = await registerUser(parsed.data, locale)
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        requiresVerification: true,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof VerificationError && error.code === 'SEND_FAILED') {
      return NextResponse.json({ code: 'SEND_FAILED' }, { status: 503 })
    }
    if (error instanceof AuthError) {
      const code =
        error.code === 'EMAIL_EXISTS' ? 'EMAIL_EXISTS' : 'REGISTER_FAILED'
      return NextResponse.json({ code }, { status: 409 })
    }
    console.error('[register]', error)
    return NextResponse.json(
      { code: 'REGISTER_FAILED' },
      { status: 500 },
    )
  }
}
