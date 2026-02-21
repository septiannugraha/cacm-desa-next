'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Bell, CheckCircle2 } from 'lucide-react'

const items = [
  { href: '/mobile/home', label: 'Home', icon: Home },
  { href: '/mobile/profil', label: 'Profil', icon: User },
  { href: '/mobile/atensi', label: 'Atensi', icon: Bell },
  { href: '/mobile/selesai', label: 'Selesai', icon: CheckCircle2 },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-md border-t bg-white">
        <div className="grid grid-cols-4 px-2 py-2">
          {items.map((it) => {
            const active = pathname.startsWith(it.href)
            const Icon = it.icon
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs ${
                  active ? 'text-slate-900' : 'text-slate-500'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? '' : ''}`} />
                <span className="text-[11px]">{it.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
