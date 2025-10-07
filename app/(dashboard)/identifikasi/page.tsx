'use client'

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Clock,
  FileText,
  Filter,
  MapPin,
  Plus,
  Search
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function IdentificationPage() {
  useSession()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Mock data
  const inspections = [
    {
      id: 1,
      title: 'Inspeksi Rutin Q1 2024',
      village: 'Desa Sukamaju',
      date: '2024-03-15',
      status: 'completed',
      inspector: 'Ahmad Fauzi',
      findings: 5,
      critical: 1
    },
    {
      id: 2,
      title: 'Inspeksi Khusus Dana BLT',
      village: 'Desa Mekar Jaya',
      date: '2024-03-20',
      status: 'in_progress',
      inspector: 'Siti Rahayu',
      findings: 3,
      critical: 0
    },
    {
      id: 3,
      title: 'Inspeksi Tahunan 2024',
      village: 'Desa Sejahtera',
      date: '2024-03-25',
      status: 'scheduled',
      inspector: 'Budi Santoso',
      findings: 0,
      critical: 0
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Identifikasi Permasalahan (RedFlags)</h1>
          <p className="text-gray-600 mt-1">
            Kelola dan pantau permasalahan yang terjadi di desa
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Jadwalkan Inspeksi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Total Inspeksi</p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Sedang Berjalan</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-600">Selesai</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">15</p>
              <p className="text-sm text-gray-600">Temuan Kritis</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari inspeksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="scheduled">Terjadwal</option>
            <option value="in_progress">Sedang Berjalan</option>
            <option value="completed">Selesai</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter Lanjutan
          </button>
        </div>
      </div>

      {/* Inspections List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {inspections.map((inspection) => (
            <div key={inspection.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {inspection.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {inspection.village}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {inspection.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {inspection.findings} Temuan
                    </span>
                    {inspection.critical > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {inspection.critical} Kritis
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full border ${
                    inspection.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                    inspection.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                    'bg-gray-100 text-gray-800 border-gray-300'
                  }`}>
                    {inspection.status === 'completed' ? 'Selesai' :
                     inspection.status === 'in_progress' ? 'Berlangsung' : 'Terjadwal'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}