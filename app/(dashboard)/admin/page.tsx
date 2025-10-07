'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Landmark,
  Building,
  LinkIcon,
  Mail,
  Rocket,
  AlertCircle,
  Key,
  Users,
  Settings
} from 'lucide-react'

const adminModules = [
  {
    name: 'Pemerintah Daerah',
    description: 'Kelola data pemerintah daerah',
    href: '/admin/pemda',
    icon: Landmark,
    color: 'bg-blue-500'
  },
  {
    name: 'Desa',
    description: 'Kelola data desa',
    href: '/admin/desa',
    icon: Building,
    color: 'bg-green-500'
  },
  {
    name: 'Koneksi',
    description: 'Kelola koneksi database',
    href: '/admin/koneksi',
    icon: LinkIcon,
    color: 'bg-purple-500'
  },
  {
    name: 'Pesan',
    description: 'Kelola notifikasi dan pesan',
    href: '/admin/pesan',
    icon: Mail,
    color: 'bg-yellow-500'
  },
  {
    name: 'Status',
    description: 'Kelola status sistem',
    href: '/admin/status',
    icon: Rocket,
    color: 'bg-red-500'
  },
  {
    name: 'Atensi',
    description: 'Kelola atensi dan laporan',
    href: '/admin/atensi',
    icon: AlertCircle,
    color: 'bg-orange-500'
  },
  {
    name: 'Peran',
    description: 'Kelola peran dan hak akses',
    href: '/admin/peran',
    icon: Key,
    color: 'bg-indigo-500'
  },
  {
    name: 'Manajemen Pengguna',
    description: 'Kelola pengguna sistem',
    href: '/admin/users',
    icon: Users,
    color: 'bg-teal-500'
  },
  {
    name: 'Pengaturan Sistem',
    description: 'Konfigurasi sistem',
    href: '/admin/settings',
    icon: Settings,
    color: 'bg-gray-500'
  },
]

export default function AdminPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrasi Sistem</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang di panel administrasi, {session?.user?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module) => {
          const Icon = module.icon
          return (
            <Link
              key={module.href}
              href={module.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
            >
              <div className="flex items-start gap-4">
                <div className={`${module.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {module.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-blue-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">Informasi</h4>
            <p className="text-sm text-blue-800 mt-1">
              Panel administrasi ini memerlukan hak akses khusus. Pastikan Anda memiliki izin yang sesuai sebelum melakukan perubahan pada sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
