import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    email?: string
    name: string
    role: string
    roleCode: string
    permissions: string[]
    pemdaId?: string
    pemdaName?: string
    fiscalYear: number
    sessionId: string
  }

  interface Session {
    user: {
      id: string
      username: string
      email?: string
      name: string
      role: string
      roleCode: string
      permissions: string[]
      pemdaId?: string
      pemdaName?: string
    }
    fiscalYear: number
    sessionId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    role: string
    roleCode: string
    permissions: string[]
    pemdaId?: string
    pemdaName?: string
    fiscalYear: number
    sessionId: string
  }
}