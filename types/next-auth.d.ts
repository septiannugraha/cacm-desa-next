// File: next-auth.d.ts (atau src/types/next-auth.d.ts)
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      role: string
      roleCode: string
      permissions: string[]
      pemdaId: string
      pemdaName: string
      pemdakd: string
    } & DefaultSession['user']
    fiscalYear: number
    sessionId: string

    mobile?: {
      username: string
      kd_desa: string
      nama_desa: string
      tahun: string
      kd_pemda?: string
    }


  }

  interface User extends DefaultUser {
    username: string
    role: string
    roleCode: string
    permissions: string[]
    pemdaId: string
    pemdaName: string
    pemdakd: string
    fiscalYear: number
    sessionId: string

    mobile?: {
      username: string
      kd_desa: string
      nama_desa: string
      tahun: string
      kd_pemda? : string
    }


  }

  
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    email?: string
    name?: string

    role: string
    roleCode: string
    permissions: string[]

    pemdaId: string
    pemdaName: string
    pemdakd: string

    fiscalYear: number
    sessionId: string

    mobile?: {
      username: string
      kd_desa: string
      nama_desa: string
      tahun: string
      kd_pemda?: string
    }

    
  }
}
