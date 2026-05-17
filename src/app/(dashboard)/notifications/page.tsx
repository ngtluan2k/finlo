import { redirect } from 'next/navigation'
import { getAuthenticatedUserId } from '@/lib/auth-session'
import { prisma } from '@/lib/prisma'
import { NotificationsClient } from './notifications-client'

export const metadata = {
  title: 'Thông báo | Finlo',
  description: 'Quản lý thông báo và các hoạt động quan trọng',
}

export default async function NotificationsPage() {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    redirect('/login')
  }

  // Fetch initial data (Page 1, Limit 20)
  const limit = 20
  
  const notifications = await prisma.notification.findMany({
    where: { userId, deleted: false },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const totalCount = await prisma.notification.count({
    where: { userId, deleted: false }
  })

  const counts = await Promise.all([
    prisma.notification.count({ where: { userId, deleted: false } }),
    prisma.notification.count({ where: { userId, deleted: false, status: 'UNREAD' } }),
    prisma.notification.count({ where: { userId, deleted: false, type: 'TRANSACTION' } }),
    prisma.notification.count({ where: { userId, deleted: false, type: 'BUDGET' } }),
    prisma.notification.count({ where: { userId, deleted: false, type: 'SYSTEM' } }),
    prisma.notification.count({ where: { userId, deleted: false, type: 'REMINDER' } }),
  ])

  const summary = {
    all: counts[0],
    unread: counts[1],
    transaction: counts[2],
    budget: counts[3],
    system: counts[4],
    promotion: counts[5],
  }

  return (
      <NotificationsClient 
        initialNotifications={notifications} 
        initialSummary={summary}
        initialTotalCount={totalCount}
        limit={limit}
      />
  )
}
