import type { Prisma } from '@/generated/prisma/client'
import { notDeleted } from '@/lib/db-query'
import { buildUsernameBase, buildUsernameCandidates } from '@/lib/username'

type DbClient = Prisma.TransactionClient

export async function resolveAvailableUsername(
  db: DbClient,
  firstName: string,
  lastName: string,
) {
  const base = buildUsernameBase(firstName, lastName)
  const candidates = buildUsernameCandidates(base)

  for (const candidate of candidates) {
    const taken = await db.user.findFirst({
      where: { username: candidate, ...notDeleted },
      select: { id: true },
    })
    if (!taken) {
      return candidate
    }
  }

  throw new Error('Không thể tạo username khả dụng')
}
