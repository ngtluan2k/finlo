import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { authOptions } from '@/lib/auth'
import { routes } from '@/lib/routes'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (session?.user) {
    redirect(routes.dashboard)
  }

  return <AuthShell>{children}</AuthShell>
}
