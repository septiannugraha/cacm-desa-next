'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Building,
  ClipboardCheck,
  BarChart,
  User,
  Key,
  Landmark,
  Calendar,
  Printer,
  LinkIcon,
  Rocket,
  Edit,
  Mail,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Atensi', href: '/atensi', icon: FileText },
  { name: 'Inspeksi', href: '/inspection', icon: ClipboardCheck },
  { name: 'Laporan', href: '/reports', icon: BarChart },
  { name: 'Desa', href: '/villages', icon: Building },
]

import { LucideIcon } from 'lucide-react'

interface AdminNavigationItem {
  name: string
  icon: LucideIcon
  href?: string
  children?: Array<{ name: string; href: string; icon: LucideIcon }>
}

const adminNavigation: AdminNavigationItem[] = [
  {
    name: 'Pengaturan Umum',
    icon: Settings,
    children: [
      { name: 'Pemerintah Daerah', href: '/admin/pemda', icon: Landmark },
      { name: 'Pemerintah Desa', href: '/admin/villages', icon: Landmark },
      { name: 'Jenis Atensi', href: '/admin/atensi-types', icon: Calendar },
      { name: 'Laporan', href: '/admin/reports', icon: Printer },
      { name: 'Koneksi Siskeudes', href: '/admin/connections', icon: LinkIcon },
      { name: 'Status Tindak Lanjut', href: '/admin/status-tl', icon: Rocket },
      { name: 'Status Verifikasi', href: '/admin/status-ver', icon: Edit },
      { name: 'Template Pesan', href: '/admin/templates', icon: Mail },
    ]
  },
  {
    name: 'Manajemen Pengguna',
    href: '/admin/users',
    icon: Users
  },
  {
    name: 'Pengaturan Sistem',
    href: '/admin/settings',
    icon: Settings
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed on mobile, relative on desktop */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 flex-shrink-0 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ backgroundColor: '#051923' }}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header with Logo */}
          <div className="flex flex-col items-center justify-center px-6 py-6" style={{ backgroundColor: '#003554', borderBottom: '8px solid white' }}>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3" style={{ boxShadow: '0px 0px 6px rgba(0,0,0,0.3)' }}>
              <span className="text-2xl font-bold text-blue-600">CACM</span>
            </div>
            <span className="text-white font-bold text-center text-sm">
              {session?.user?.pemdaName || 'Provinsi Jawa Barat'}
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
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {/* Regular Navigation */}
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}

            {/* Admin Section - Only show for admin users */}
            {session?.user?.roleCode === 'ADMIN' && (
              <>
                <div className="pt-4 mt-4 border-t border-gray-700">
                  <p className="px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Admin
                  </p>
                </div>

                {/* Pengaturan Umum with submenu */}
                <div>
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      Pengaturan Umum
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${adminMenuOpen ? 'rotate-90' : ''}`} />
                  </button>

                  {adminMenuOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {adminNavigation[0].children?.map((child) => {
                        const ChildIcon = child.icon
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                              isActive(child.href)
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <ChildIcon className="h-4 w-4" />
                            {child.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Other admin items */}
                {adminNavigation.slice(1).map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href || '#'}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        item.href && isActive(item.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main content - takes full remaining width */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar with gradient */}
        <header className="sticky top-0 z-40 shadow-sm flex-shrink-0" style={{ background: 'linear-gradient(105.31deg, #0351B5 37.11%, #4AB6FF 93.5%)' }}>
          <div className="flex h-14 items-center gap-4 px-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-white" />
            </button>

            {/* Logo and Pemda Name (visible on mobile and desktop) */}
            <div className="flex items-center gap-4">
              <Image src="/logo-ssh.png" alt="Logo" width={32} height={32} className="hidden sm:block" />
              <div className="hidden lg:flex items-center gap-6 text-white">
                <div className="text-sm font-medium">
                  {session?.user?.pemdaName || 'Provinsi Jawa Barat'}
                </div>
                <div className="text-sm">
                  Tahun <span className="font-semibold">{session?.fiscalYear}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {/* Notifications */}
              <button className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="relative mr-2" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                >
                  <span className="text-sm">Selamat Datang, <b>{session?.user?.name || 'User'}</b>!</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
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
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 w-full overflow-x-auto bg-gray-50">
          <div className="w-full p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}