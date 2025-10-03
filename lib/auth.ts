import { NextAuthOptions, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Adapter } from 'next-auth/adapters'

interface CustomUser extends User {
  username: string
  role: string
  roleCode: string
  permissions: string[]
  pemdaId: string
  pemdaName: string
  fiscalYear: number
  sessionId: string
}

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  fiscalYear: z.number().int().min(2020).max(2030),
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        fiscalYear: { label: 'Tahun', type: 'number' },
      },
      async authorize(credentials) {
        try {
          const { username, password, fiscalYear } = loginSchema.parse({
            username: credentials?.username,
            password: credentials?.password,
            fiscalYear: credentials?.fiscalYear ? parseInt(credentials.fiscalYear as string) : new Date().getFullYear(),
          })

          // Find user in local User table (use CACM_User when on Dian's network)
          const user = await prisma.user.findUnique({
            where: { username },
            include: {
              role: true,
              pemda: true,
            },
          })

          if (!user || !user.active) {
            throw new Error('User tidak ditemukan atau tidak aktif')
          }

          // Verify password with bcrypt
          const isValidPassword = await bcrypt.compare(password, user.password)
          if (!isValidPassword) {
            throw new Error('Password salah')
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          })

          // Parse permissions from JSON string
          let permissions = []
          try {
            permissions = JSON.parse(user.role.permissions)
          } catch {
            permissions = []
          }

          // Create session with fiscal year
          const session = await prisma.session.create({
            data: {
              userId: user.id,
              fiscalYear,
              sessionToken: crypto.randomUUID(),
              expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
            },
          })

          return {
            id: user.id,
            username: user.username,
            email: user.email || '',
            name: user.name,
            role: user.role.name,
            roleCode: user.role.code,
            permissions,
            pemdaId: user.pemdaId || '',
            pemdaName: user.pemda?.name || '',
            fiscalYear,
            sessionId: session.id,
          } as CustomUser
        } catch (error) {
          console.error('Login error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const customUser = user as CustomUser
        token.id = user.id
        token.username = customUser.username
        token.role = customUser.role
        token.roleCode = customUser.roleCode
        token.permissions = customUser.permissions
        token.pemdaId = customUser.pemdaId
        token.pemdaName = customUser.pemdaName
        token.fiscalYear = customUser.fiscalYear
        token.sessionId = customUser.sessionId
      }

      // Handle session update (e.g., fiscal year change)
      if (trigger === 'update' && session) {
        token.fiscalYear = session.fiscalYear
      }

      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id as string,
          username: token.username as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          roleCode: token.roleCode as string,
          permissions: token.permissions as string[],
          pemdaId: token.pemdaId as string,
          pemdaName: token.pemdaName as string,
        },
        fiscalYear: token.fiscalYear as number,
        sessionId: token.sessionId as string,
      }
    },
  },
}