import {
    Settings,
    Landmark,
    LayoutDashboard,
    Building,
    Link as LinkIcon,
    Rocket,
    AlertCircle,
    Mail,
    Key,
    Users,
  } from 'lucide-react'
  
  import { NavigationItem } from './types'
  
  const settingsNav: NavigationItem[] = [
    {
      name: 'Pengaturan Umum',
      icon: Settings,
      children: [
        { name: 'Pemerintah Daerah', href: '/admin/pemda', icon: Landmark },
        { name: 'Custom Dashboard', href: '/admin/cstdashboard', icon: LayoutDashboard },
        { name: 'Desa', href: '/admin/desa', icon: Building },
        { name: 'Koneksi', href: '/admin/koneksi', icon: LinkIcon },
        { name: 'Status', href: '/admin/status', icon: Rocket },
        { name: 'Jenis Atensi', href: '/admin/jnsatensi', icon: AlertCircle },
        { name: 'Pesan', href: '/admin/pesan', icon: Mail },
        { name: 'Peran', href: '/admin/peran', icon: Key },
      ],
    },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ]
  
  export default settingsNav