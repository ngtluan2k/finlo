export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (databaseUrl) {
    return databaseUrl
  }

  const user = process.env.DB_USER
  const password = process.env.DB_PASSWORD
  const host = process.env.DB_HOST ?? 'localhost'
  const port = process.env.DB_PORT ?? '5432'
  const name = process.env.DB_NAME ?? 'finlo'

  if (!user || password === undefined) {
    throw new Error(
      'Missing DB config: set DATABASE_URL or DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME in .env',
    )
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`
}
