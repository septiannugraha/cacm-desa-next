'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import type { Crumb } from './MobileNavContext'

export function MobileBreadcrumb({ items }: { items: Crumb[] }) {
  if (!items || items.length === 0) return null

  return (
    <div className="bg-gray-100/90 backdrop-blur border-b">
      <div className="mx-auto max-w-md px-4 py-2">
        <nav className="flex items-center gap-1 text-[12px] text-gray-600 overflow-x-auto">
          <Home className="h-4 w-4 shrink-0 text-gray-500" />
          {items.map((it, idx) => {
            const isLast = idx === items.length - 1
            return (
              <div key={`${it.label}-${idx}`} className="flex items-center gap-1 shrink-0">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {it.href && !isLast ? (
                  <Link href={it.href} className="hover:text-gray-900 whitespace-nowrap">
                    {it.label}
                  </Link>
                ) : (
                  <span className={`whitespace-nowrap ${isLast ? 'text-gray-900 font-medium' : ''}`}>
                    {it.label}
                  </span>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
