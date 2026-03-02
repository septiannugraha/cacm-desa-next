'use client'

import { useLayout } from '@/components/layouts/LayoutContext'
import dashboardNav from '@/lib/navigation/dashboardNav'
import pemdesNav from '@/lib/navigation/pemdesNav'
import redflagsNav from '@/lib/navigation/redflagsNav'
import settingsNav from '@/lib/navigation/settingsNav'
import { useRouter } from 'next/navigation'
import { themes, ThemeKey } from '@/lib/themes'

import {
  Home, User, Key,
  ChevronRight,
  Menu,
  Settings,
  LogOut,
} from 'lucide-react'

import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import MobileResponMenu from '@/components/layouts/MobileResponMenu'

/* =========================================================
   20 CLASSIC THEMES
========================================================= */
  
export default function DashboardLayout({ children }: { children: React.ReactNode }) {



  const { data: session } = useSession()
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = useState(false)


  /* ===== Dynamic Navigation ===== */
  let navigation = dashboardNav
  if (pathname.startsWith('/prodesa')) navigation = pemdesNav
  else if (pathname.startsWith('/redflags')) navigation = redflagsNav
  else if (pathname.startsWith('/admin')) navigation = settingsNav

  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  

  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {}
  
    navigation.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          pathname === child.href || pathname.startsWith(child.href + '/')
        )
  
        if (isChildActive) {
          newOpenMenus[item.name] = true
        }
      }
    })
  
    setOpenMenus(newOpenMenus)
  }, [pathname, navigation])
  
  const [showTheme, setShowTheme] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
 

  useEffect(() => {
    if (session?.user?.roleCode === 'DBAdmin') {
      redirect('/dbkoneksi')
    }
  }, [session])
 
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const breadcrumb = useMemo(() => {
    for (const item of navigation) {
      if (item.href && isActive(item.href)) return [item.name]
      if (item.children) {
        for (const child of item.children) {
          if (isActive(child.href))
            return [item.name, child.name]
        }
      }
    }
    return ['Dashboard']
  }, [pathname, navigation])


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true)   // collapse saat layar kecil
      } else {
        setCollapsed(false)  // expand saat besar
      }
    }
  
    handleResize() // run saat pertama load
    window.addEventListener('resize', handleResize)
  
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const router = useRouter()
  const { layout, setLayout, theme, setTheme } = useLayout()
  const activeTheme = themes[theme as ThemeKey]

  
  return (
    <div className={`min-h-screen transition-all duration-500 ${activeTheme.content}`}>

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-screen transition-all duration-500 z-100 ${collapsed ? 'w-18' : 'w-72'}`}>

        <div className="h-screen flex flex-col rounded-lg px-1 space-y-1">

          {/* HEADER */}
          <div className={`${activeTheme.sidebarHeader} pt-2 pb-2 h-16 ${activeTheme.text}`}>
            <div className="h-14 flex items-center justify-center">
            <Link href="/">

              <Image
                src="/cacm_logo.png"
                alt="logo"
                width={collapsed ? 50 : 80}
                height={collapsed ? 50 : 80}
                className="transition-all duration-500 ease-in-out"
                style={{ 
                  filter: `
                    drop-shadow(1px 0 white) 
                    drop-shadow(-1px 0 white) 
                    drop-shadow(0 1px white) 
                    drop-shadow(0 -1px white)
                  `
                
               
                }} 
              />
               </Link>
            </div>
          </div>


          {/* MENU */}
          <div className={`${activeTheme.sidebarMenu} p-2 pt-6 ${activeTheme.text} overflow-y-auto h-full`}>

            {navigation.map(item => {
              const Icon = item.icon

              if (!item.children) {
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm ${isActive(item.href!) ? 'bg-white/20' : 'hover:bg-white/10'}`}
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
                          className={`block px-3 py-2 rounded-lg text-sm transition ${isActive(child.href) ? 'bg-white/20' : 'hover:bg-white/10'}`}
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
      </aside>

      {/* TOPBAR */}
      <header className={`fixed top-0 z-900 ${collapsed ? 'left-18' : 'left-72'} right-0 h-16 flex items-center justify-between px-6 ${activeTheme.topbar} ${activeTheme.text} transition-all duration-500`}>

        <div className="flex items-center gap-4">
          <Menu onClick={() => setCollapsed(!collapsed)} className="cursor-pointer" />
          <div className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/" passHref>
            <Home className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
          </Link>
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 opacity-70" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
        <div className="hidden md:block text-center">
          <p className="text-sm font-bold whitespace-nowrap">
            {session?.user?.pemdaName} - {session?.fiscalYear}
          </p>
        </div>



          <div className="relative  " ref={dropdownRef}>
        <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                >
                  
                  <User className={`h-6 w-6 transition-transform   flex-shrink-0 ${userMenuOpen ? 'rotate-0' : ''}`} />
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







          <Settings onClick={() => setShowTheme(!showTheme)} className="cursor-pointer transition-transform   flex-shrink-0   rotate-180"  />

          {showTheme && (
            <div className="absolute right-1 top-9 w-72 rounded-xl shadow-2xl border border-gray-200 bg-white p-5 z-50">

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
                  className={`w-full text-left px-3 py-2 rounded-lg transition
                  ${
                    layout === 'alt'
                      ? 'bg-blue-900 text-white font-semibold'
                      : 'bg-blue-900 text-white hover:bg-blue-600'
                  }`}
                >
                  Formal
                </button>
              </div>
              <div className="h-px bg-gray-500 my-4"></div>
              {/* ===== CLASSIC ===== */}
              <div className="space-y-2">
              <button
                onClick={() => setLayout('standard')}
                className={`w-full text-left px-3 py-2 rounded-lg transition
                  ${
                    layout === 'standard'
                      ? `${themes[theme as ThemeKey].topbar} ${themes[theme as ThemeKey].text} font-semibold`
                      : `${themes[theme as ThemeKey].topbar} ${themes[theme as ThemeKey].text} opacity-80 hover:opacity-100`
                  }`}
              >
                Classic
              </button>
<br/>
              </div>

              {/* ===== COLOR PICKER (ONLY IF CLASSIC) ===== */}
              {layout === 'standard' && (
                <>
               

                  <div className="grid grid-cols-5 gap-3">
                    {Object.keys(themes).map(t => (
                      <div
                        key={t}
                        onClick={() => {
                          setTheme(t as ThemeKey)
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
                </>
              )}
            </div>
          )}
         




         
        </div>

        


      </header>

      {/* CONTENT */}
      <main className={`pt-20 transition-all duration-500 ${collapsed ? 'pl-18' : 'pl-72'} p-8`}>
        <div className="pl-6">{children}</div>
      </main>

      <MobileResponMenu />
    </div>
  )
}