import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { routes } from '@/lib/routes'
import { formatProfileDisplayName } from '@/lib/profile-name'
import { loginSchema } from '@/validations/auth.schema'
import { AuthError, verifyCredentials } from '@/services/auth.service'
import { logActivity } from '@/lib/rbac'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: routes.login,
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email / Phone / Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        try {
          const user = await verifyCredentials(
            parsed.data.identifier,
            parsed.data.password,
          )
          return {
            id: user.id,
            email: user.email,
            name: user.profile
              ? formatProfileDisplayName(
                  user.profile.firstName,
                  user.profile.lastName,
                  user.profile.displayName,
                )
              : user.email,
          }
        } catch (error) {
          if (error instanceof AuthError) {
            if (error.code === 'EMAIL_NOT_VERIFIED') {
              throw new Error('EMAIL_NOT_VERIFIED')
            }
            if (error.code === 'USER_SUSPENDED') {
              throw new Error('USER_SUSPENDED')
            }
            if (error.code === 'USER_INACTIVE') {
              throw new Error('USER_INACTIVE')
            }
            if (error.code === 'USER_DELETED') {
              throw new Error('USER_DELETED')
            }
            return null
          }
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      if (user && user.id) {
        await logActivity(user.id, 'LOGIN', 'Đăng nhập vào hệ thống thành công')
      }
    },
  },
}
