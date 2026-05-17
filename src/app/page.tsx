import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { routes } from '@/lib/routes'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  redirect(session?.user ? routes.dashboard : routes.login)
}
