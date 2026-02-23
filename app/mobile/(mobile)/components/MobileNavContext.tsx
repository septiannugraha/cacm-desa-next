'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

export type Crumb = { label: string; href?: string }

type Ctx = {
  breadcrumb: Crumb[]
  setBreadcrumb: (items: Crumb[]) => void
  title?: string
  setTitle: (title?: string) => void
}

const MobileNavContext = createContext<Ctx | null>(null)

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<Crumb[]>([])
  const [title, setTitle] = useState<string | undefined>(undefined)

  const value = useMemo(
    () => ({ breadcrumb, setBreadcrumb, title, setTitle }),
    [breadcrumb, title]
  )

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext)
  if (!ctx) throw new Error('useMobileNav must be used within MobileNavProvider')
  return ctx
}

/**
 * Helper hook: set breadcrumb saat mount & bersihkan saat unmount
 */
export function useMobileBreadcrumb(items: Crumb[], title?: string) {
  const { setBreadcrumb, setTitle } = useMobileNav()

  React.useEffect(() => {
    setBreadcrumb(items || [])
    setTitle(title)
    return () => {
      setBreadcrumb([])
      setTitle(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items), title])
}
