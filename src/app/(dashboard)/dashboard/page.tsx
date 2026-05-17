import { LayoutDashboard } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('dashboard')

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <LayoutDashboard
            className="size-5 text-zinc-700 dark:text-zinc-300"
            aria-hidden
          />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {t('greeting', { name: session?.user?.name ?? '' })}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {session?.user?.email}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {t('placeholder')}
        </p>
      </section>
    </div>
  )
}
