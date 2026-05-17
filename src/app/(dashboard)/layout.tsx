import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { authOptions } from '@/lib/auth'
import { routes } from '@/lib/routes'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect(routes.login)
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>
}
