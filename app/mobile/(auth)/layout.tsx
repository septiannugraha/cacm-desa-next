import MobileProviders from '../(mobile)/providers' // atau path sesuai lokasi providers kamu

export default function MobileAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileProviders>
      <div className="min-h-dvh bg-slate-50">{children}</div>
    </MobileProviders>
  )
}
