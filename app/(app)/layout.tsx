import { ReactNode } from 'react'
import { LayoutProvider } from '@/components/layouts/LayoutContext'
import AppLayout from '@/components/layouts/AppLayout'

export default function AppGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <LayoutProvider>
      <AppLayout>{children}</AppLayout>
    </LayoutProvider>
  )
}