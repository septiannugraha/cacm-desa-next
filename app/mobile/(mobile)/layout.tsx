import MobileProviders from './providers'
import MobileShell from './components/MobileShell'

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileProviders>
  
        <MobileShell>{children}</MobileShell>
    


    </MobileProviders>
  )
}
