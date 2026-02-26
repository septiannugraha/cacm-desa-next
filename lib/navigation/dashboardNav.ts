import {
    LayoutDashboard,
    Wallet,
    TrendingUp,
    TrendingDown,
    Receipt,
    LineChart,
    AlertTriangle,
    DollarSign,
    FileWarning,
    AlertCircle,
    FileText,
    User,
    Settings,
  } from 'lucide-react'
  
  import { NavigationItem } from './types'
  
  const dashboardNav: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  
    {
      name: 'APBDes',
      icon: Wallet,
      children: [
        { name: 'Pendapatan', href: '/apbdes/pendapatan', icon: TrendingUp },
        { name: 'Belanja', href: '/apbdes/belanja', icon: TrendingDown },
        { name: 'Pembiayaan', href: '/apbdes/pembiayaan', icon: Wallet },
        { name: 'Perpajakan', href: '/apbdes/pajak', icon: Receipt },
      ],
    },
  
    {
      name: 'Trend',
      icon: LineChart,
      children: [
        { name: 'Pendapatan', href: '/trend/pendapatan', icon: TrendingUp },
        { name: 'Belanja', href: '/trend/belanja', icon: TrendingDown },
        { name: 'Pembiayaan Terima', href: '/trend/pembiayaan-terima', icon: Wallet },
        { name: 'Pembiayaan Keluar', href: '/trend/pembiayaan-keluar', icon: Wallet },
      ],
    },
  
    {
      name: 'Profil Risiko',
      icon: AlertTriangle,
      children: [
        { name: 'Keuangan', href: '/prorisk/keuangan', icon: DollarSign },
        { name: 'Nonkeuangan', href: '/prorisk/nonkeuangan', icon: FileWarning },
        { name: 'Anomali', href: '/prorisk/anomali', icon: AlertCircle },
      ],
    },
  
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]
  
  export default dashboardNav