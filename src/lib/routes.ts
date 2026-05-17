export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  dashboard: '/dashboard',
  systemUsers: '/dashboard/system/users',
  systemRoles: '/dashboard/system/roles',
  systemActivityLog: '/dashboard/system/activity-log',
} as const

export type AppRoute = (typeof routes)[keyof typeof routes]
