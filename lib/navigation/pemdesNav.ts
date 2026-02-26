import { Database, BarChart3, Info } from 'lucide-react'
import { NavigationItem } from './types'

const pemdesNav: NavigationItem[] = [
  {
    name: 'Prodesa',
    icon: Database,
    children: [
      { name: 'Data Umum', href: '/prodesa/dataumum', icon: Info },
      { name: 'Potensi', href: '/prodesa/potensi', icon: BarChart3 },
      { name: 'Statistik', href: '/prodesa/statistik', icon: BarChart3 },
    ],
  },
]

export default pemdesNav