'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Bell, CheckCircle2, MessageSquare } from 'lucide-react'

const items = [
  { href: '/mobile/home', label: 'Home', icon: Home },
  { href: '/mobile/profil', label: 'Profil', icon: User },
  { href: '/mobile/atensidesa', label: 'Atensi', icon: Bell },
  { href: '/mobile/respon', label: 'Respon', icon: MessageSquare },
  { href: '/mobile/selesai', label: 'Selesai', icon: CheckCircle2 },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="rounded-3xl bg-gradient-to-r from-sky-100 via-blue-100 to-sky-100 backdrop-blur border border-blue-200 shadow-lg p-2">
          {/* Flex container agar menu selalu satu baris */}
          <div className="flex justify-between">
            {items.map((it) => {
              const active =
                pathname === it.href || pathname.startsWith(it.href)
              const Icon = it.icon

              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`
                    flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-2 text-xs transition-all duration-200
                    ${
                      active
                        ? 'bg-blue-500 text-white shadow-md scale-105'
                        : 'text-blue-700 hover:bg-blue-200/60'
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 transition-all ${
                      active ? 'text-white' : 'text-blue-600'
                    }`}
                  />
                  <span className="text-[11px] font-medium">
                    {it.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}