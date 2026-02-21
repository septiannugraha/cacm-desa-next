import MobileTopbar from '@/components/mobile/MobileTopbar'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <MobileTopbar />
      <main className="mx-auto max-w-md px-4 py-4 pb-24">{children}</main>
      <MobileBottomNav />
    </div>
  )
}
