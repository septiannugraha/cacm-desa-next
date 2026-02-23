'use client'

import MobileTopbar from '@/app/mobile/(mobile)/components/MobileTopbar'
import MobileBottomNav from '@/app/mobile/(mobile)/components/MobileBottomNav'
import { MobileBreadcrumb } from '@/app/mobile/(mobile)/components/MobileBreadcrumb'
import { MobileNavProvider, useMobileNav } from '@/app/mobile/(mobile)/components/MobileNavContext'

function ShellInner({ children }: { children: React.ReactNode }) {
  const { breadcrumb } = useMobileNav()

  return (
    <div className="min-h-dvh bg-gray-200 flex justify-center">
      <div className="w-full max-w-md min-h-dvh bg-gray-100 shadow-lg flex flex-col">
        <MobileTopbar />
        <MobileBreadcrumb items={breadcrumb} />

        <main className="flex-1 px-4 py-4 pb-24">{children}</main>

        <MobileBottomNav />
      </div>
    </div>
  )
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <ShellInner>{children}</ShellInner>
    </MobileNavProvider>
  )
}
