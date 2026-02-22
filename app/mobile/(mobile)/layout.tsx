import MobileProviders from './providers'

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <MobileProviders>{children}</MobileProviders>
}
