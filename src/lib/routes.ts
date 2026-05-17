export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  dashboard: '/dashboard',
  profile: '/profile',
  systemUsers: '/dashboard/system/users',
  systemRoles: '/dashboard/system/roles',
  systemActivityLog: '/dashboard/system/activity-log',
  transactions: '/transactions',
  notifications: '/dashboard/notifications',
  wallets: '/wallets',
  budgets: '/budgets',
} as const

export type AppRoute = (typeof routes)[keyof typeof routes]
