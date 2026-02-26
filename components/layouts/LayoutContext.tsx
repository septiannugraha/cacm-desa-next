'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type LayoutType = 'alt' | 'standard'
type ThemeType = string

interface LayoutContextType {
  layout: LayoutType
  setLayout: (layout: LayoutType) => void
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<LayoutType>('alt')
  const [theme, setTheme] = useState<ThemeType>('blue')
  const [mounted, setMounted] = useState(false)

  // LOAD ONCE
  useEffect(() => {
    const savedLayout = localStorage.getItem('app-layout') as LayoutType | null
    const savedTheme = localStorage.getItem('app-theme')

    if (savedLayout === 'alt' || savedLayout === 'standard') {
      setLayout(savedLayout)
    }

    if (savedTheme) {
      setTheme(savedTheme)
    }

    setMounted(true)
  }, [])

  // SAVE
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('app-layout', layout)
    }
  }, [layout, mounted])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('app-theme', theme)
    }
  }, [theme, mounted])

  if (!mounted) return null

  return (
    <LayoutContext.Provider value={{ layout, setLayout, theme, setTheme }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayout must be used inside LayoutProvider')
  return context
}