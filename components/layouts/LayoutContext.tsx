'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from 'react'
import { themes, ThemeKey } from '@/lib/themes'

export type LayoutType = 'alt' | 'standard'

interface LayoutContextType {
  layout: LayoutType
  setLayout: (layout: LayoutType) => void
  theme: ThemeKey
  setTheme: (theme: ThemeKey) => void
  activeTheme: (typeof themes)[ThemeKey]
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<LayoutType>('standard')
  const [theme, setTheme] = useState<ThemeKey>('blue')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLayout = localStorage.getItem('app-layout') as LayoutType | null
    const savedTheme = localStorage.getItem('app-theme') as ThemeKey | null

    if (savedLayout === 'alt' || savedLayout === 'standard') {
      setLayout(savedLayout)
    }

    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme)
    }

    setMounted(true)
  }, [])

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

  /**
   * =============================
   * ADVANCED LAYOUT → THEME MAP
   * =============================
   */

  const activeTheme = useMemo(() => {
    const layoutThemeMap: Record<LayoutType, ThemeKey> = {
      alt: 'slate',     // ALT selalu dark premium
      standard: theme,     // STANDARD ikut theme user
    }

    return themes[layoutThemeMap[layout]]
  }, [layout, theme])

  if (!mounted) return null

  return (
    <LayoutContext.Provider
      value={{ layout, setLayout, theme, setTheme, activeTheme }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used inside LayoutProvider')
  }
  return context
}