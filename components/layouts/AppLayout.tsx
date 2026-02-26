'use client'

import { ReactNode } from 'react'
import { useLayout } from './LayoutContext'
import LayoutStandard from './LayoutStandard'
import LayoutAlt from './LayoutAlt'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { layout } = useLayout()

  if (layout === 'alt') {
    return <LayoutAlt>{children}</LayoutAlt>
  }

  return <LayoutStandard>{children}</LayoutStandard>
}