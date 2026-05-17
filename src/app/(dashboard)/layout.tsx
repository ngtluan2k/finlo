import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { authOptions } from '@/lib/auth'
import { routes } from '@/lib/routes'
import { getUserPermissions } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { notDeleted } from '@/lib/db-query'
import { formatProfileDisplayName } from '@/lib/profile-name'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !session.user.id) {
    redirect(routes.login)
  }

  const userId = session.user.id
  const permissions = await getUserPermissions(userId)
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        code: 'SUPER_ADMIN',
        status: 'ACTIVE',
        ...notDeleted,
      },
    },
  })
  const isSuperAdmin = Boolean(userRole)

  const profile = await prisma.profile.findUnique({
    where: { userId },
  })

  const currentName = profile 
    ? formatProfileDisplayName(profile.firstName, profile.lastName, profile.displayName)
    : session.user.name

  const userWithAuth = {
    ...session.user,
    name: currentName,
    image: profile?.avatarUrl || session.user.image,
    permissions,
    isSuperAdmin,
  }

  return <DashboardShell user={userWithAuth}>{children}</DashboardShell>
}
