import { prisma } from '@/lib/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import sql from 'mssql'
import { NextAuthOptions, User } from 'next-auth'
import { Adapter } from 'next-auth/adapters'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'

// Direct SQL connection config
const dbConfig = {
  server: '31.220.73.89',
  port: 14317,
  database: 'Siswaskeudes_Baru',
  user: 'sa',
  password: '1',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
}



interface CustomUser extends User {
  username: string
  role: string
  roleCode: string
  permissions: string[]
  pemdaId: string
  pemdaName: string
  pemdakd: string
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

          console.log("Received credentials:", credentials);

          // Connect to database with direct SQL
          await sql.connect(dbConfig)

          // Find user with role and pemda data
          const userResult = await sql.query`
            SELECT TOP 1
              u.*,
              r.name as roleName,
              r.code as roleCode,
              r.permission as rolePermissions,
              p.name as pemdaName,
              p.code as pemdaCode
            FROM CACM_User u
            LEFT JOIN CACM_Role r ON u.roleId = r.id
            LEFT JOIN CACM_Pemda p ON u.pemdaId = p.id
            WHERE u.username = ${username}
          `

          const user = userResult.recordset[0]

          if (!user || !user.active) {
            throw new Error('User tidak ditemukan atau tidak aktif')
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password)
          if (!isValidPassword) {
            throw new Error('Password salah')
          }

          // Update last login
          await sql.query`
            UPDATE CACM_User
            SET lastLogin = ${new Date()}
            WHERE id = ${user.id}
          `

          // Parse permissions from JSON string
          let permissions = []
          try {
            permissions = JSON.parse(user.rolePermissions || '[]')
          } catch {
            permissions = []
          }

          // Create session with fiscal year
          const sessionId = crypto.randomUUID()
          const sessionToken = crypto.randomUUID()
          const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000)

          await sql.query`
            INSERT INTO CACM_Session (id, userId, fiscalYear, sessionToken, expires, createdAt, updatedAt)
            VALUES (${sessionId}, ${user.id}, ${fiscalYear}, ${sessionToken}, ${expiresAt}, ${new Date()}, ${new Date()})
          `

          // Close SQL connection

          return {
            id: user.id,
            username: user.username,
            email: user.email || '',
            name: user.name,
            role: user.roleName,
            roleCode: user.roleCode,
            permissions,
            pemdaId: user.pemdaId || '',
            pemdaName: user.pemdaName || '',
            pemdakd: user.pemdaCode || '',
            fiscalYear,
            sessionId: sessionId,
          } as CustomUser
        } catch (error) {
          console.error('Login error:', error)
          // Make sure to close connection on error
          try {
          } catch {}
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
        token.pemdakd=customUser.pemdakd
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
          pemdakd:token.pemdakd as string,
        },
        fiscalYear: token.fiscalYear as number,
        sessionId: token.sessionId as string,
      }
    },
  },
}
