import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ThemeScript } from '@/components/theme-script'
import { authOptions } from '@/lib/auth'
import { getOrCreateUserSettings } from '@/services/settings.service'
import { prisma } from '@/lib/prisma'
import { LocaleSync } from '@/components/locale-sync'
import type { Locale } from '@/i18n/config'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = (await getLocale()) as Locale
  const messages = await getMessages()
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null
  const initialTheme = userId
    ? (await getOrCreateUserSettings(userId)).theme
    : null

  let userLocale: Locale | null = null
  if (userId) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { locale: true },
    })
    userLocale = (profile?.locale as Locale) || null
  }

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col font-sans"
      >
        <ThemeScript />
        <LocaleSync userLocale={userLocale} currentLocale={locale} />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider userId={userId} initialTheme={initialTheme}>
            <AuthSessionProvider>{children}</AuthSessionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
