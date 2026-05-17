export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  dashboard: '/dashboard',
} as const

export type AppRoute = (typeof routes)[keyof typeof routes]
