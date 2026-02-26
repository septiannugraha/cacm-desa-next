import { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  name: string
  icon: LucideIcon
  href?: string
  children?: Array<{
    name: string
    href: string
    icon: LucideIcon
  }>
}