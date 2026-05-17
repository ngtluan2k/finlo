import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isEmailVerified } from '@/services/verification.service'

const querySchema = z.object({
  email: z.email(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    email: searchParams.get('email'),
  })

  if (!parsed.success) {
    return NextResponse.json({ verified: false }, { status: 400 })
  }

  const verified = await isEmailVerified(parsed.data.email)
  return NextResponse.json({ verified })
}
