import {
  Flag,
  Search,
  FileText,
  Bell,
  CheckCircle,
  Eye,
} from 'lucide-react'

import { NavigationItem } from './types'

const redflagsNav: NavigationItem[] = [
  {
    name: 'Red Flags',
    icon: Flag,
    children: [
      { name: 'Identifikasi', href: '/redflags/identifikasi', icon: Search },
      { name: 'Dokumentasi', href: '/redflags/dokumentasi', icon: FileText },
      { name: 'Atensi', href: '/redflags/atensi', icon: Bell },
      { name: 'Verifikasi', href: '/redflags/verifikasi', icon: CheckCircle },
      { name: 'Pemantauan', href: '/redflags/pemantauan', icon: Eye },
    ],
  },
]

export default redflagsNav