import { NextResponse } from 'next/server'
import { z } from 'zod'
import { localeFromRequest } from '@/lib/locale-from-request'
import {
  resendEmailVerification,
  VerificationError,
} from '@/services/verification.service'

const bodySchema = z.object({
  email: z.email(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ code: 'INVALID_DATA' }, { status: 400 })
  }

  try {
    const locale = localeFromRequest(request)
    await resendEmailVerification(parsed.data.email, locale)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof VerificationError) {
      const status =
        error.code === 'RESEND_TOO_SOON'
          ? 429
          : error.code === 'ALREADY_VERIFIED'
            ? 409
            : error.code === 'SEND_FAILED'
              ? 503
              : 404
      return NextResponse.json({ code: error.code }, { status })
    }
    console.error('[resend-verification]', error)
    return NextResponse.json({ code: 'SEND_FAILED' }, { status: 500 })
  }
}
