import { NextResponse } from 'next/server'
import { getAppBaseUrl } from '@/lib/app-url'
import { routes } from '@/lib/routes'
import {
  verifyEmailByToken,
  VerificationError,
} from '@/services/verification.service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  const loginUrl = new URL(routes.login, getAppBaseUrl())

  if (!token) {
    loginUrl.searchParams.set('error', 'invalid_token')
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { email } = await verifyEmailByToken(token)
    loginUrl.searchParams.set('verified', '1')
    if (email) {
      loginUrl.searchParams.set('email', email)
    }
    return NextResponse.redirect(loginUrl)
  } catch (error) {
    if (error instanceof VerificationError) {
      if (error.code === 'TOKEN_EXPIRED') {
        loginUrl.searchParams.set('error', 'token_expired')
      } else {
        loginUrl.searchParams.set('error', 'invalid_token')
      }
      return NextResponse.redirect(loginUrl)
    }
    console.error('[verify-email]', error)
    loginUrl.searchParams.set('error', 'verify_failed')
    return NextResponse.redirect(loginUrl)
  }
}
