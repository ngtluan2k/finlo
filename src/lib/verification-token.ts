import { createHash, randomBytes } from 'crypto'

const TOKEN_BYTES = 32

export function createRawVerificationToken() {
  return randomBytes(TOKEN_BYTES).toString('hex')
}

export function hashVerificationToken(raw: string) {
  return createHash('sha256').update(raw).digest('hex')
}

export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

export const RESEND_COOLDOWN_MS = 60 * 1000
