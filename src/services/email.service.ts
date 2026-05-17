import nodemailer from 'nodemailer'
import type { Locale } from '@/i18n/config'
import viMessages from '../../messages/vi.json'
import enMessages from '../../messages/en.json'

type EmailMessages = typeof viMessages.auth.verifyEmail.email

function getEmailMessages(locale: Locale): EmailMessages {
  return locale === 'en'
    ? enMessages.auth.verifyEmail.email
    : viMessages.auth.verifyEmail.email
}

function getTransporter() {
  const host = process.env.SMTP_HOST
  if (!host) return null

  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  })
}

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
  locale: Locale,
) {
  const t = getEmailMessages(locale)
  const from = process.env.SMTP_FROM ?? 'Finlo <noreply@finlo.local>'
  const transporter = getTransporter()

  const html = `
    <p>${t.greeting}</p>
    <p>${t.body}</p>
    <p><a href="${verifyUrl}">${t.button}</a></p>
    <p style="color:#666;font-size:12px">${t.expiry}</p>
    <p style="color:#666;font-size:12px;word-break:break-all">${verifyUrl}</p>
  `

  if (!transporter) {
    console.info(`[email] Verification link for ${to}: ${verifyUrl}`)
    return
  }

  await transporter.sendMail({
    from,
    to,
    subject: t.subject,
    html,
    text: `${t.body}\n\n${verifyUrl}\n\n${t.expiry}`,
  })
}
