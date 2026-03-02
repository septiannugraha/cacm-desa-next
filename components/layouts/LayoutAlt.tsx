'use client'


import { useLayout } from '@/components/layouts/LayoutContext'
import dashboardNav from '@/lib/navigation/dashboardNav'
import pemdesNav from '@/lib/navigation/pemdesNav'
import redflagsNav from '@/lib/navigation/redflagsNav'
import settingsNav from '@/lib/navigation/settingsNav'
import { useRouter } from 'next/navigation'

import {
  AlertCircle,
  AlertTriangle,
  BarChart,
  Bell,
  Building,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  Edit,
  Eye,
  FileText,
  FileWarning,
  Flag,
  Key,
  Landmark,
  LayoutDashboard,
  LineChart,
  LinkIcon,
  LogOut,
  Mail,
  Menu,
  Minus,
  Plus,
  Printer,
  Rocket,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  User, Home,
  Users,
  Wallet,
  Receipt,
  X, ArrowLeft,
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useMemo } from 'react'
import MobileResponMenu from '@/components/layouts/MobileResponMenu'
import { themes, ThemeKey } from '@/lib/themes'




export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const dropdownRef = useRef<HTMLDivElement>(null)
 
    
    /* ===== Dynamic Navigation ===== */
    let navigation = dashboardNav
    if (pathname.startsWith('/prodesa')) navigation = pemdesNav
    else if (pathname.startsWith('/redflags')) navigation = redflagsNav
    else if (pathname.startsWith('/admin')) navigation = settingsNav
  
    const [collapsed, setCollapsed] = useState(false)
    
 
    const router = useRouter()
    const { layout, setLayout, theme, setTheme } = useLayout()
    const activeTheme = themes[theme as ThemeKey]
    
    

  useEffect(() => {
    if (session?.user?.roleCode == 'DBAdmin') {
      redirect('/dbkoneksi');
    }
  }, [session]);


  // Auto-expand menu if current path is a child route
  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {}
    navigation.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => pathname.startsWith(child.href))
        if (isChildActive) {
          newOpenMenus[item.name] = true
        }
      }
    })
    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }))
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => {
      // If clicking on already open menu, close it
      if (prev[menuName]) {
        return { ...prev, [menuName]: false }
      }
      // Otherwise, close all other menus and open the clicked one (accordion behavior)
      const allClosed: Record<string, boolean> = {}
      Object.keys(prev).forEach(key => {
        allClosed[key] = false
      })
      return { ...allClosed, [menuName]: true }
    })
  }



/* =========================================
   ACTIVE CHECK
========================================= */
function isActive(href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

/* =========================================
   BREADCRUMB GENERATOR
========================================= */
const breadcrumb = useMemo(() => {
  for (const item of navigation) {
    // Direct menu
    if (item.href && isActive(item.href)) {
      return [item.name]
    }

    // Submenu
    if (item.children) {
      for (const child of item.children) {
        if (isActive(child.href)) {
          return [item.name, child.name]
        }
      }
    }
  }

  return ['Dashboard']
}, [pathname])

const [showTheme, setShowTheme] = useState(false)
 

/* =========================================
   DYNAMIC BACK LINK BASED ON BREADCRUMB
========================================= */
const backHref = useMemo(() => {
  if (breadcrumb.length === 1) return '/'

  const parentName = breadcrumb[breadcrumb.length - 2]

  for (const item of navigation) {
    if (item.name === parentName && item.href) {
      return item.href
    }

    if (item.children) {
      for (const child of item.children) {
        if (child.name === parentName) {
          return child.href
        }
      }
    }
  }

  return '/'
}, [breadcrumb, navigation])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop - invisible but clickable */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed position on all screen sizes */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`} style={{ backgroundColor: '#051923' }}>
        <div className="flex flex-col h-screen">
          {/* Sidebar Header with Logo */}
          <div className="flex flex-col items-center justify-center px-6 py-6" style={{ backgroundColor: '#003554', borderBottom: '8px solid white' }}>
           
           
          <div className="flex items-center justify-center mb-2 p-2">
          <Link href="/" passHref>
          <Image 
            src="/logo.png" 
            alt="CACM Logo" 
            width={80} 
            height={80} 
            className="object-contain"
            style={{ 
              filter: 'drop-shadow(0 0 5px rgba(255,255,255,1))' 
            }}
          />
        </Link>

        </div>
            <span className="text-white font-bold text-center text-md">
              {session?.user?.pemdaName || 'Kabupaten/Kota'}
            </span>
          </div>

          {/* Close button for mobile */}
          <button
            className="absolute top-4 right-4 lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>



          {/* Navigation */}

          
          {/* MENU */}
          <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto pb-24">

            {navigation.map(item => {
              const Icon = item.icon

              if (!item.children) {
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href!)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
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
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
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
                          className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive(child.href)
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
 
 
 </div>
        </div>
      </div>

      {/* Top bar with gradient - fixed to stay at top, as direct sibling to sidebar */}
      <header className="fixed top-0 left-0 right-0 lg:left-64 z-50 shadow-sm" style={{ background: 'linear-gradient(105.31deg, #0351B5 37.11%, #4AB6FF 93.5%)' }}>
          <div className="flex h-14 items-center gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-white" />
            </button>

            {/* Logo and Pemda Name (visible on mobile and desktop) */}
            <div className="flex items-center gap-4">
              <Image src="/cacm_logo.png" alt="CACM Logo" width={50} height={50} className="hidden sm:block"            
                 style={{ 
                  filter: `
                    drop-shadow(1px 0 white) 
                    drop-shadow(-1px 0 white) 
                    drop-shadow(0 1px white) 
                    drop-shadow(0 -1px white)
                  `
                
               
                }} />
              <div className="hidden lg:flex items-center gap-6 text-white">
                <div className="text-sm font-medium">
                  {session?.user?.pemdaName || 'Kabupaten/Kota'}
                </div>
                <div className="text-sm">
                  Tahun <span className="font-semibold">{session?.fiscalYear}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
      
          

              {/* User menu */}
              <div className="relative mr-2" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                >
                  <span className="text-sm truncate max-w-[200px] sm:max-w-none">Selamat Datang, <b>{session?.user?.name || 'User'}</b>!</span>
                  <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500">{session?.user?.role}</p>
                    </div>

                    <button
                      onClick={async () => {
                        setUserMenuOpen(false)
                        try {
                          // Call logout API first
                          await fetch('/api/auth/logout', { method: 'POST' })
                          // Then sign out with NextAuth
                          await signOut({ callbackUrl: '/login', redirect: true })
                        } catch (error) {
                          console.error('Logout error:', error)
                          // Force redirect even on error
                          window.location.href = '/login'
                        }
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                    <hr className="my-1" />
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 text-blue-600" />
                      Update Profil
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Key className="h-4 w-4 text-yellow-600" />
                      Ganti Password
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <Settings onClick={() => setShowTheme(!showTheme)} className="cursor-pointer text-white" />

            {showTheme && (
              <div className="absolute right-12 top-8 w-72 rounded-xl shadow-2xl border border-gray-200 bg-white p-5 z-50">

                {/* TITLE */}
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-gray-800 text-center">
                    Pilih Tema Aplikasi
                  </h3>
                </div>
                <div className="h-px bg-gray-200 my-4"></div>
                {/* ===== MODERN (FIRST) ===== */}
                <div className="space-y-2 mb-4">
                <button
                  onClick={() => setLayout('alt')}
                  className={`w-full px-3 py-2 rounded-lg transition
                    ${
                      layout === 'alt'
                        ? 'bg-[#003554] text-white font-semibold'
                        : 'bg-blue-200 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Modern
                </button>

                <button
                  onClick={() => setLayout('standard')}
                  className={`w-full px-3 py-2 rounded-lg transition mt-2
                    ${
                      layout === 'standard'
                        ? 'bg-blue-700 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Classic
                </button>
            <br/>
                </div>

                {/* ===== COLOR PICKER (ONLY IF CLASSIC) ===== */}
                 
                
                    <div className="grid grid-cols-5 gap-3">
                      {Object.keys(themes).map(t => (
                        <div
                          key={t}
                          onClick={() => {
                            setTheme(t as ThemeKey)
                            setLayout('standard')
                            setShowTheme(false)
                          }}
                          className={`h-8 w-8 rounded-md cursor-pointer 
                          transition-all duration-200 hover:scale-110 border-2
                          ${
                            theme === t
                              ? 'border-black scale-110'
                              : 'border-transparent'
                          }
                          ${themes[t as ThemeKey].sidebarHeader}`}
                          title={t}
                        />
                      ))}
                    </div>
                 
              </div>
            )}
 
          </div>
      </header>

      {/* Main content area - with padding for fixed header and sidebar */}
      <main className="min-h-screen pt-14 lg:pl-64 bg-gray-50 ">
        {/* ==============================
   BREADCRUMB SECTION
============================== */}
<div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
  <div className="flex items-center justify-between">

    {/* LEFT SIDE - BREADCRUMB */}
    <div className="flex items-center gap-2 text-sm text-gray-600">

      <Link href="/" passHref>
        <Home className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
      </Link>

      {breadcrumb.map((item, index) => (
        <div key={index} className="flex items-center gap-2">

          <ChevronRight className="h-3 w-3 text-gray-400" />

          <span
            className={`${
              index === breadcrumb.length - 1
                ? 'font-semibold text-gray-900'
                : 'text-gray-600'
            }`}
          >
            {item}
          </span>

        </div>
      ))}

    </div>

    {/* RIGHT SIDE - BACK BUTTON */}
    {breadcrumb.length > 1 && (
      <Link href={backHref}>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
      </Link>
    )}

  </div>
</div>
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto pb-20 md:pb-4">
          {children}
        </div>
      </main>

      {/* Mobile Respon Menu - Shows only on mobile for respon routes */}
      <MobileResponMenu />
    </div>
  )
}