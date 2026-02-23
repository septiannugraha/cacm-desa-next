'use client'

import { SessionProvider } from 'next-auth/react'

export default function MobileProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider basePath="/mobile/api/mobile-auth">{children}</SessionProvider>
}
