'use client'

import { useLayout } from '@/components/layouts/LayoutContext'

import {
  AlertCircle,
  AlertTriangle,
  Bell, Home ,
  CheckCircle,
  ChevronRight,
  DollarSign,
  Eye,
  FileText,
  FileWarning,
  Flag,
  Key,
  Landmark,
  LayoutDashboard,
  LineChart,
  LogOut,
  Mail,
  Menu,
  Receipt,
  Rocket,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
  
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import MobileResponMenu from '@/components/layouts/MobileResponMenu'

/* =========================================================
   9 GOVERNMENT THEMES
========================================================= */


const themes = {
  blue: { sidebarHeader: 'bg-blue-400', sidebarMenu: 'bg-blue-800', topbar: 'bg-blue-900', content: 'bg-blue-50', text: 'text-white' },
  emerald: { sidebarHeader: 'bg-emerald-400', sidebarMenu: 'bg-emerald-800', topbar: 'bg-emerald-900', content: 'bg-emerald-50', text: 'text-white' },
  violet: { sidebarHeader: 'bg-violet-400', sidebarMenu: 'bg-violet-800', topbar: 'bg-violet-900', content: 'bg-violet-50', text: 'text-white' },
  rose: { sidebarHeader: 'bg-rose-400', sidebarMenu: 'bg-rose-800', topbar: 'bg-rose-900', content: 'bg-rose-50', text: 'text-white' },
  amber: { sidebarHeader: 'bg-amber-400', sidebarMenu: 'bg-amber-700', topbar: 'bg-amber-800', content: 'bg-amber-50', text: 'text-white' },
  cyan: { sidebarHeader: 'bg-cyan-400', sidebarMenu: 'bg-cyan-800', topbar: 'bg-cyan-900', content: 'bg-cyan-50', text: 'text-white' },
  slate: { sidebarHeader: 'bg-slate-400', sidebarMenu: 'bg-slate-800', topbar: 'bg-slate-900', content: 'bg-slate-100', text: 'text-white' },
  navy: { sidebarHeader: 'bg-indigo-400', sidebarMenu: 'bg-indigo-900', topbar: 'bg-indigo-950', content: 'bg-indigo-50', text: 'text-white' },

  teal: { sidebarHeader: 'bg-teal-400', sidebarMenu: 'bg-teal-800', topbar: 'bg-teal-900', content: 'bg-teal-50', text: 'text-white' },
  forest: { 
    sidebarHeader: 'bg-green-600', 
    sidebarMenu: 'bg-green-950', 
    topbar: 'bg-black', 
    content: 'bg-green-100', 
    text: 'text-white' 
  }, 
  lime: { sidebarHeader: 'bg-lime-400', sidebarMenu: 'bg-lime-700', topbar: 'bg-lime-800', content: 'bg-lime-50', text: 'text-white' },
  orange: { sidebarHeader: 'bg-orange-400', sidebarMenu: 'bg-orange-800', topbar: 'bg-orange-900', content: 'bg-orange-50', text: 'text-white' },
  red: { sidebarHeader: 'bg-red-400', sidebarMenu: 'bg-red-800', topbar: 'bg-red-900', content: 'bg-red-50', text: 'text-white' },
  pink: { sidebarHeader: 'bg-pink-400', sidebarMenu: 'bg-pink-800', topbar: 'bg-pink-900', content: 'bg-pink-50', text: 'text-white' },
  purple: { sidebarHeader: 'bg-purple-400', sidebarMenu: 'bg-purple-800', topbar: 'bg-purple-900', content: 'bg-purple-50', text: 'text-white' },

  zinc: { sidebarHeader: 'bg-zinc-400', sidebarMenu: 'bg-zinc-800', topbar: 'bg-zinc-900', content: 'bg-zinc-100', text: 'text-white' },
  neutral: { sidebarHeader: 'bg-neutral-400', sidebarMenu: 'bg-neutral-800', topbar: 'bg-neutral-900', content: 'bg-neutral-100', text: 'text-white' },
  stone: { sidebarHeader: 'bg-stone-400', sidebarMenu: 'bg-stone-800', topbar: 'bg-stone-900', content: 'bg-stone-100', text: 'text-white' },

  dark: { sidebarHeader: 'bg-gray-500', sidebarMenu: 'bg-gray-900', topbar: 'bg-black', content: 'bg-gray-200', text: 'text-white' },
  midnight: { sidebarHeader: 'bg-slate-600', sidebarMenu: 'bg-slate-950', topbar: 'bg-black', content: 'bg-slate-200', text: 'text-white' },
}
type ThemeKey = keyof typeof themes

/* =========================================================
   NAVIGATION (INCLUDE ADMIN)
========================================================= */

interface NavigationItem {
  name: string
  icon: LucideIcon
  href?: string
  children?: Array<{ name: string; href: string; icon: LucideIcon }>
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'APBDes',
    icon: Wallet,
    children: [
      { name: 'Pendapatan', href: '/apbdes/pendapatan', icon: TrendingUp },
      { name: 'Belanja', href: '/apbdes/belanja', icon: TrendingDown },
      { name: 'Pembiayaan', href: '/apbdes/pembiayaan', icon: Wallet },
      { name: 'Perpajakan', href: '/apbdes/pajak', icon: Receipt },
    ]
  },
  {
    name: 'Trend',
    icon: LineChart,
    children: [
      { name: 'Pendapatan', href: '/trend/pendapatan', icon: TrendingUp },
      { name: 'Belanja', href: '/trend/belanja', icon: TrendingDown },
      { name: 'Pembiayaan', href: '/trend/pembiayaan', icon: Wallet },
      { name: 'Perpajakan', href: '/trend/pajak', icon: Receipt },
    ]
  },
  {
    name: 'Profil Risiko',
    icon: AlertTriangle,
    children: [
      { name: 'Keuangan', href: '/prorisk/keuangan', icon: DollarSign },
      { name: 'Nonkeuangan', href: '/prorisk/nonkeuangan', icon: FileWarning },
      { name: 'Anomali', href: '/prorisk/anomali', icon: AlertCircle },
    ]
  },
  {
    name: 'Red Flags',
    icon: Flag,
    children: [
      { name: 'Identifikasi', href: '/redflags/identifikasi', icon: Search },
      { name: 'Dokumentasi', href: '/redflags/dokumentasi', icon: FileText },
      { name: 'Atensi', href: '/redflags/atensi', icon: Bell },
      { name: 'Verifikasi', href: '/redflags/verifikasi', icon: CheckCircle },
      { name: 'Pemantauan', href: '/redflags/pemantauan', icon: Eye },
    ]
  },
]

const adminNavigation: NavigationItem[] = [
  {
    name: 'Pengaturan Umum',
    icon: Settings,
    children: [
      { name: 'Pemerintah Daerah', href: '/admin/pemda', icon: Landmark },
      { name: 'Custom Dashboard', href: '/admin/cstdashboard', icon: LayoutDashboard },
      { name: 'Desa', href: '/admin/desa', icon: Wallet },
      { name: 'Koneksi', href: '/admin/koneksi', icon: Rocket },
      { name: 'Status', href: '/admin/status', icon: AlertCircle },
      { name: 'Atensi', href: '/admin/jnsatensi', icon: Bell },
      { name: 'Pesan', href: '/admin/pesan', icon: Mail },
      { name: 'Peran', href: '/admin/peran', icon: Key },
    ]
  },
  { name: 'Manajemen Pengguna', href: '/admin/users', icon: Users },
  { name: 'Pengaturan Sistem', href: '/admin/settings', icon: Settings },
]

/* =========================================================
   LAYOUT
========================================================= */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
const { layout, setLayout } = useLayout()
  const { data: session } = useSession()
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const [theme, setTheme] = useState<ThemeKey>('blue')
  const [showTheme, setShowTheme] = useState(false)

  /* ===== Load Theme ===== */
  useEffect(() => {
    const saved = localStorage.getItem('gov-theme') as ThemeKey
    if (saved && themes[saved]) setTheme(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('gov-theme', theme)
  }, [theme])

  useEffect(() => {
    if (session?.user?.roleCode === 'DBAdmin') {
      redirect('/dbkoneksi')
    }
  }, [session])

  const isActive = (href: string) => pathname === href

  /* ===== Breadcrumb Logic ===== */
  const breadcrumb = useMemo(() => {
    for (const item of [...navigation, ...adminNavigation]) {
      if (item.href && isActive(item.href)) return [item.name]
      if (item.children) {
        for (const child of item.children) {
          if (isActive(child.href)) return [item.name, child.name]
        }
      }
    }
    return ['Dashboard']
  }, [pathname])

  return (
    <div className={`min-h-screen transition-all duration-500 ${themes[theme].content}`}>

      {/* SIDEBAR */}
{/* SIDEBAR */}
<aside className={`fixed top-0 left-0 h-screen transition-all duration-500 z-100
  ${collapsed ? 'w-18' : 'w-72'}
`}>

  <div className="h-screen flex flex-col rounded-lg px-1 space-y-1">

    {/* HEADER SECTION */}
    <div className={`${themes[theme].sidebarHeader} pt-2 pb-2 h-16 ${themes[theme].text}`}>
      <div className="h-14 flex items-center justify-center">
        <Image
          src="/cacm_logo.png"
          alt="logo"
          width={collapsed ? 50 : 80}
          height={collapsed ? 50 : 80}
          className="transition-all duration-500 ease-in-out"
        />
      </div>
    </div>

    {/* MAIN MENU SECTION */}
    <div className={`${themes[theme].sidebarMenu} p-2 pt-6 ${themes[theme].text} overflow-y-auto h-full`}>

{/* ===== MENU UTAMA ===== */}
{navigation.map(item => {
  const Icon = item.icon

  if (!item.children) {
    return (
      <Link
        key={item.name}
        href={item.href!}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm
        ${isActive(item.href!) ? 'bg-white/20' : 'hover:bg-white/10'}
        `}
      >
        <Icon
          onClick={() => setCollapsed(prev => !prev)}
          className="cursor-pointer transition-transform duration-300 ease-in-out"
        />
        {!collapsed && item.name}
      </Link>
    )
  }

  return (
    <div key={item.name}>
      <button
        onClick={() =>
          setOpenMenus(prev => ({ ...prev, [item.name]: !prev[item.name] }))
        }
        className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg hover:bg-white/10"
      >
        <div className="flex items-center gap-3">
        <Icon
          onClick={() => setCollapsed(prev => !prev)}
          className="cursor-pointer transition-transform duration-300 ease-in-out"
        />

          {!collapsed && item.name}
        </div>
        {!collapsed && (
          <ChevronRight className={`${openMenus[item.name] ? 'rotate-90' : ''}`} />
        )}
      </button>

      {!collapsed && openMenus[item.name] && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children.map(child => (
            <Link
              key={child.name}
              href={child.href}
              className={`block px-3 py-2 rounded-lg text-sm transition
              ${isActive(child.href) ? 'bg-white/20' : 'hover:bg-white/10'}
              `}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
})}

{/* ===== JARAK + GARIS PEMISAH ===== */}
{session?.user?.roleCode === 'ADMIN' && (
  <>
  <br/><br/>
    <div className="my-5 h-[3px] w-full bg-white/40 rounded"></div>

    {/* ===== MENU ADMIN ===== */}
    {adminNavigation.map(item => {
      const Icon = item.icon

      if (!item.children) {
        return (
          <Link
            key={item.name}
            href={item.href!}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm
            ${isActive(item.href!) ? 'bg-white/20' : 'hover:bg-white/10'}
            `}
          >
            <Icon />
            {!collapsed && item.name}
          </Link>
        )
      }

      return (
        <div key={item.name}>
          <button
            onClick={() =>
              setOpenMenus(prev => ({ ...prev, [item.name]: !prev[item.name] }))
            }
            className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <Icon />
              {!collapsed && item.name}
            </div>
            {!collapsed && (
              <ChevronRight className={`${openMenus[item.name] ? 'rotate-90' : ''}`} />
            )}
          </button>

          {!collapsed && openMenus[item.name] && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children?.map(child => (
                <Link
                  key={child.name}
                  href={child.href}
                  className={`block px-3 py-2 rounded-lg text-sm transition
                  ${isActive(child.href) ? 'bg-white/20' : 'hover:bg-white/10'}
                  `}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    })}
  </>
)}

</div>

  </div>
</aside>

      {/* TOPBAR */}
      <header className={`fixed top-0  z-900 ${collapsed ? 'left-18' : 'left-72'}
        right-0 h-16 flex items-center justify-between px-6
        ${themes[theme].topbar} ${themes[theme].text} transition-all duration-500`}>

        <div className="flex items-center gap-4">
          <Menu onClick={() => setCollapsed(!collapsed)} className="cursor-pointer" />
          <div className="flex items-center gap-2 text-sm font-semibold">

          {/* Home */}
          <span className="flex items-center gap-2">
            <Home  className="h-4 w-4" />
             
            {breadcrumb.length > 0 && <ChevronRight className="h-4 w-4 opacity-70" />}
          </span>

          {/* Menu & Submenu */}
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {item}
              {i !== breadcrumb.length - 1 && (
                <ChevronRight className="h-4 w-4 opacity-70" />
              )}
            </span>
          ))}

          </div>
        </div>

        <div className="flex items-center gap-4 relative">
        <div className="  text-center">
                <p className="text-sm font-bold">{session?.user?.pemdaName} - {session?.fiscalYear}</p>
            
              </div>
          <Settings onClick={() => setShowTheme(!showTheme)} className="cursor-pointer" />

          {showTheme && (
            <div className="absolute right-12 top-8 bg-white rounded-lg shadow-xl p-4 z-50 w-64">

              {/* Judul */}
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Pilih Tema Warna
                </h3>
                <p className="text-xs text-gray-500">
                  Sesuaikan tampilan aplikasi
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 mb-3"></div>
              <div className="mt-4">
  <div className="h-px bg-gray-200 mb-3"></div>

  <h4 className="text-sm font-semibold text-gray-800 mb-2">
    Pilih Layout
  </h4>

  <button
    onClick={() => setLayout('standard')}
    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
      layout === 'standard' ? 'bg-gray-200 font-semibold' : ''
    }`}
  >
    Standard Layout
  </button>

  <button
    onClick={() => setLayout('alt')}
    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
      layout === 'alt' ? 'bg-gray-200 font-semibold' : ''
    }`}
  >
    Alternative Layout
  </button>
</div>
              {/* Grid Warna */}
              <div className="grid grid-cols-4 gap-3">
                {Object.keys(themes).map(t => (
                  <div
                    key={t}
                    onClick={() => { 
                      setTheme(t as ThemeKey)
                      setShowTheme(false)
                    }}
                    className={`w-7 h-7 rounded-md cursor-pointer 
                    transition-all duration-200 hover:scale-110
                    ${themes[t as ThemeKey].sidebarHeader}`}
                    title={t}
                  />
                ))}
              </div>

              </div>
          )}

        

          <button onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut />
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className={`pt-20 transition-all duration-500
        ${collapsed ? 'pl-18' : 'pl-72'}
        p-8`}>
        <div className='pl-6'>
        {children}
        </div>
      </main>

      <MobileResponMenu />
    </div>
  )
}