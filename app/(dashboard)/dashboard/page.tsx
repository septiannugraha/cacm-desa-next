'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Activity,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/login')
  }

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: 'Total Atensi',
      value: '156',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Atensi Terbuka',
      value: '23',
      change: '-8%',
      trend: 'down',
      icon: AlertCircle,
      color: 'yellow'
    },
    {
      title: 'Atensi Selesai',
      value: '89',
      change: '+15%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Rata-rata Waktu',
      value: '4.2 hari',
      change: '-20%',
      trend: 'down',
      icon: Clock,
      color: 'purple'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'atensi_created',
      title: 'Atensi baru dibuat',
      description: 'Laporan keterlambatan pencairan dana desa',
      user: 'Ahmad Fauzi',
      village: 'Desa Sukamaju',
      time: '2 jam yang lalu',
      priority: 'HIGH'
    },
    {
      id: 2,
      type: 'response_added',
      title: 'Tanggapan ditambahkan',
      description: 'Penjelasan status pencairan dana BLT',
      user: 'Siti Rahayu',
      village: 'Desa Mekar Jaya',
      time: '5 jam yang lalu',
      priority: 'MEDIUM'
    },
    {
      id: 3,
      type: 'atensi_resolved',
      title: 'Atensi diselesaikan',
      description: 'Masalah SPJ telah diperbaiki',
      user: 'Budi Santoso',
      village: 'Desa Sejahtera',
      time: '1 hari yang lalu',
      priority: 'LOW'
    }
  ]

  const priorityData = [
    { name: 'Kritis', value: 5, color: 'bg-red-500' },
    { name: 'Tinggi', value: 18, color: 'bg-orange-500' },
    { name: 'Sedang', value: 45, color: 'bg-yellow-500' },
    { name: 'Rendah', value: 32, color: 'bg-gray-400' }
  ]

  const topVillages = [
    { name: 'Desa Sukamaju', atensi: 24, resolved: 18 },
    { name: 'Desa Mekar Jaya', atensi: 21, resolved: 15 },
    { name: 'Desa Sejahtera', atensi: 18, resolved: 16 },
    { name: 'Desa Harapan', atensi: 15, resolved: 10 },
    { name: 'Desa Mandiri', atensi: 12, resolved: 11 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang kembali, {session?.user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Buat Atensi Baru</span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="font-medium">Lihat Laporan</span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Kelola Pengguna</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Distribusi Prioritas Atensi</h2>
          <div className="space-y-3">
            {priorityData.map((item, index) => {
              const percentage = (item.value / 100) * 100
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-gray-600">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Villages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Desa Paling Aktif</h2>
          <div className="space-y-3">
            {topVillages.map((village, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{village.name}</p>
                    <p className="text-xs text-gray-500">
                      {village.resolved}/{village.atensi} diselesaikan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{village.atensi}</p>
                  <p className="text-xs text-gray-500">Atensi</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Aktivitas Terkini</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Lihat Semua
          </button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                {activity.type === 'atensi_created' && <FileText className="w-5 h-5 text-blue-600" />}
                {activity.type === 'response_added' && <Activity className="w-5 h-5 text-blue-600" />}
                {activity.type === 'atensi_resolved' && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {activity.user}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {activity.village}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {activity.time}
                  </span>
                </div>
              </div>
              <div>
                <span className={`px-2 py-1 text-xs rounded-full border ${
                  activity.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                  activity.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  'bg-gray-100 text-gray-800 border-gray-300'
                }`}>
                  {activity.priority === 'HIGH' ? 'Tinggi' :
                   activity.priority === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}