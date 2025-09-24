'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  BarChart,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  Eye,
  FileSpreadsheet,
  PieChart
} from 'lucide-react'

export default function ReportsPage() {
  useSession()
  const [reportType, setReportType] = useState('monthly')
  const [selectedPeriod, setSelectedPeriod] = useState('')

  // Mock data
  const reports = [
    {
      id: 1,
      title: 'Laporan Bulanan Maret 2024',
      type: 'monthly',
      period: 'Maret 2024',
      generatedDate: '2024-04-01',
      status: 'ready',
      fileSize: '2.4 MB',
      downloads: 15
    },
    {
      id: 2,
      title: 'Laporan Triwulan I 2024',
      type: 'quarterly',
      period: 'Q1 2024',
      generatedDate: '2024-04-05',
      status: 'ready',
      fileSize: '5.8 MB',
      downloads: 23
    },
    {
      id: 3,
      title: 'Laporan Analisis Atensi Q1',
      type: 'analysis',
      period: 'Q1 2024',
      generatedDate: '2024-04-03',
      status: 'ready',
      fileSize: '1.2 MB',
      downloads: 8
    }
  ]

  const statistics = [
    { label: 'Total Atensi', value: '156', change: '+12%', trend: 'up' },
    { label: 'Rata-rata Penyelesaian', value: '4.2 hari', change: '-20%', trend: 'down' },
    { label: 'Tingkat Resolusi', value: '87%', change: '+5%', trend: 'up' },
    { label: 'Desa Aktif', value: '42', change: '+8%', trend: 'up' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-600 mt-1">
            Analisis dan laporan keuangan desa
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FileSpreadsheet className="w-4 h-4" />
          Generate Laporan
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {statistics.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <span className={`text-xs flex items-center gap-1 ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Report Types */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Jenis Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <BarChart className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Laporan Bulanan</h3>
            <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas bulanan</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
            <PieChart className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Laporan Triwulan</h3>
            <p className="text-sm text-gray-500 mt-1">Analisis per kuartal</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Laporan Khusus</h3>
            <p className="text-sm text-gray-500 mt-1">Laporan analisis mendalam</p>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Tipe</option>
            <option value="monthly">Bulanan</option>
            <option value="quarterly">Triwulan</option>
            <option value="analysis">Analisis</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Periode</option>
            <option value="2024-03">Maret 2024</option>
            <option value="2024-02">Februari 2024</option>
            <option value="2024-01">Januari 2024</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter Lanjutan
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {report.generatedDate}
                      </span>
                      <span>{report.fileSize}</span>
                      <span>{report.downloads} downloads</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}