'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Building,
  Activity,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import BarChartDashboard from '@/components/charts/BarChartDashboard'
import LineChartDashboard from '@/components/charts/LineChartDashboard'
import PieChartDashboard from '@/components/charts/PieChartDashboard'
import AreaChartDashboard from '@/components/charts/AreaChartDashboard'

interface ChartData {
  Kategori1: string
  Kategori2: string
  Nilai1: number
  Nilai2: number
}

interface DashboardChartData {
  budgetRealizationByVillage: ChartData[]
  budgetByAccountType: ChartData[]
  monthlyTrend: ChartData[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [chartData, setChartData] = useState<DashboardChartData | null>(null)
  const [loadingCharts, setLoadingCharts] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchChartData()
    }
  }, [status])

  const fetchChartData = async () => {
    try {
      const response = await fetch('/api/dashboard/chart-data')
      if (response.ok) {
        const data = await response.json()
        setChartData(data)
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setLoadingCharts(false)
    }
  }

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

  // Financial summary data - replace with actual API calls
  const financialStats = [
    {
      title: 'PENDAPATAN DAERAH',
      anggaran: 1259753655839,
      realisasi: 659093758116.797,
      percentage: 52.32,
      color: 'bg-blue-500'
    },
    {
      title: 'BELANJA DAERAH',
      anggaran: 1320798731355.694,
      realisasi: 579382068213.787,
      percentage: 43.87,
      color: 'bg-green-500'
    },
    {
      title: 'PENERIMAAN PEMBIAYAAN',
      anggaran: 69079321337.618,
      realisasi: 43373783005.546,
      percentage: 63.50,
      color: 'bg-red-500'
    },
    {
      title: 'PENGELUARAN PEMBIAYAAN',
      anggaran: 8426019944193,
      realisasi: 4623908264045,
      percentage: 49.05,
      color: 'bg-orange-500'
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

  // Chart data is now fetched from API endpoint /api/dashboard/chart-data
  // Data structure: Kategori1, Kategori2, Nilai1, Nilai2
  // Kategori1 = NamaDesa/NamaRek2, Kategori2 = Category, Nilai1 = Anggaran, Nilai2 = Realisasi

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang kembali, {session?.user?.name}
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="space-y-4">
        {financialStats.map((stat, index) => {
          const formatCurrency = (value: number) => {
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          }

          return (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center p-4">
                {/* Percentage Box */}
                <div className={`${stat.color} text-white w-20 h-20 flex items-center justify-center rounded-lg mr-4 flex-shrink-0`}>
                  <span className="text-lg font-bold">{stat.percentage}%</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{stat.title}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-2 text-xs">
                    <div>
                      <span className="text-gray-500">Anggaran:</span>
                      <p className="font-medium text-gray-900">{formatCurrency(stat.anggaran)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Realisasi:</span>
                      <p className="font-medium text-gray-900">{formatCurrency(stat.realisasi)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${stat.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter Kecamatan */}
          <div>
            <label htmlFor="kecamatan" className="block text-sm font-medium text-gray-700 mb-2">
              Kecamatan
            </label>
            <select
              id="kecamatan"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Kecamatan</option>
              <option value="kec1">Kecamatan 1</option>
              <option value="kec2">Kecamatan 2</option>
              <option value="kec3">Kecamatan 3</option>
            </select>
          </div>

          {/* Filter Desa */}
          <div>
            <label htmlFor="desa" className="block text-sm font-medium text-gray-700 mb-2">
              Desa
            </label>
            <select
              id="desa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Desa</option>
              <option value="desa1">Desa Sukamaju</option>
              <option value="desa2">Desa Mekar Jaya</option>
              <option value="desa3">Desa Sejahtera</option>
            </select>
          </div>

          {/* Filter Sumber Dana */}
          <div>
            <label htmlFor="sumber-dana" className="block text-sm font-medium text-gray-700 mb-2">
              Sumber Dana
            </label>
            <select
              id="sumber-dana"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Sumber Dana</option>
              <option value="apbd">APBD</option>
              <option value="apbn">APBN</option>
              <option value="dak">DAK</option>
              <option value="dau">DAU</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Section - Using Recharts with data from database */}
      {loadingCharts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : chartData ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Budget vs Realization by Village */}
            <div className="bg-white rounded-lg shadow p-6">
              <BarChartDashboard
                data={chartData.budgetRealizationByVillage}
                title="Anggaran vs Realisasi per Desa"
                xAxisKey="Kategori1"
                nilai1Label="Anggaran"
                nilai2Label="Realisasi"
              />
            </div>

            {/* Pie Chart - Budget Distribution by Account Type */}
            <div className="bg-white rounded-lg shadow p-6">
              <PieChartDashboard
                data={chartData.budgetByAccountType}
                title="Distribusi Anggaran per Jenis Belanja"
                dataKey="Nilai1"
                nameKey="Kategori1"
                label="Anggaran"
              />
            </div>
          </div>

          {/* Line and Area Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart - Monthly Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <LineChartDashboard
                data={chartData.monthlyTrend}
                title="Tren Bulanan Anggaran & Realisasi"
                xAxisKey="Kategori1"
                nilai1Label="Anggaran"
                nilai2Label="Realisasi"
              />
            </div>

            {/* Area Chart - Cumulative Monthly */}
            <div className="bg-white rounded-lg shadow p-6">
              <AreaChartDashboard
                data={chartData.monthlyTrend}
                title="Akumulasi Realisasi per Bulan"
                xAxisKey="Kategori1"
                nilai1Label="Target"
                nilai2Label="Capaian"
                stacked={false}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Gagal memuat data grafik</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Prioritas Atensi</h2>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Desa Paling Aktif</h2>
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
          <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terkini</h2>
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