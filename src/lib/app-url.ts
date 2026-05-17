export function getAppBaseUrl() {
  const url = process.env.NEXTAUTH_URL ?? process.env.APP_URL
  if (!url) {
    throw new Error('NEXTAUTH_URL or APP_URL is required')
  }
  return url.replace(/\/$/, '')
}
