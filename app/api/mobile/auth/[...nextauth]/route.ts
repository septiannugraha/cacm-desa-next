import NextAuth from 'next-auth'
import { mobileAuthOptions } from '@/lib/mobile-auth'

const handler = NextAuth(mobileAuthOptions)

export { handler as GET, handler as POST }
