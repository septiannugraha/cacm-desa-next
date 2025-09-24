'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Building,
  Search,
  MapPin,
  Users,
  FileText,
  Phone,
  Mail,
  Plus,
  Edit,
  Eye
} from 'lucide-react'

export default function VillagesPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [selectedPemda, setSelectedPemda] = useState('')

  // Mock data
  const villages = [
    {
      id: 1,
      name: 'Desa Sukamaju',
      pemda: 'Kabupaten Bandung',
      headName: 'H. Ahmad Supriyadi',
      phone: '0812-3456-7890',
      email: 'sukamaju@desa.go.id',
      population: 5420,
      atensiCount: 24,
      status: 'active'
    },
    {
      id: 2,
      name: 'Desa Mekar Jaya',
      pemda: 'Kabupaten Bandung',
      headName: 'Hj. Siti Aminah',
      phone: '0813-4567-8901',
      email: 'mekarjaya@desa.go.id',
      population: 4850,
      atensiCount: 21,
      status: 'active'
    },
    {
      id: 3,
      name: 'Desa Sejahtera',
      pemda: 'Kabupaten Garut',
      headName: 'Drs. Budi Santoso',
      phone: '0814-5678-9012',
      email: 'sejahtera@desa.go.id',
      population: 3200,
      atensiCount: 18,
      status: 'active'
    },
    {
      id: 4,
      name: 'Desa Harapan',
      pemda: 'Kabupaten Garut',
      headName: 'Ir. Dedi Mulyadi',
      phone: '0815-6789-0123',
      email: 'harapan@desa.go.id',
      population: 6100,
      atensiCount: 15,
      status: 'active'
    }
  ]

  const filteredVillages = villages.filter(village => {
    const matchesSearch = village.name.toLowerCase().includes(search.toLowerCase()) ||
                          village.headName.toLowerCase().includes(search.toLowerCase())
    const matchesPemda = !selectedPemda || village.pemda === selectedPemda
    return matchesSearch && matchesPemda
  })

  const pemdaList = [...new Set(villages.map(v => v.pemda))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Desa</h1>
          <p className="text-gray-600 mt-1">
            Daftar desa dalam wilayah pengawasan
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Desa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{villages.length}</p>
              <p className="text-sm text-gray-600">Total Desa</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {villages.reduce((acc, v) => acc + v.population, 0).toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-600">Total Penduduk</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {villages.reduce((acc, v) => acc + v.atensiCount, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Atensi</p>
            </div>
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{pemdaList.length}</p>
              <p className="text-sm text-gray-600">Pemda</p>
            </div>
            <MapPin className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari desa atau kepala desa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedPemda}
            onChange={(e) => setSelectedPemda(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Pemda</option>
            {pemdaList.map((pemda) => (
              <option key={pemda} value={pemda}>{pemda}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Villages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVillages.map((village) => (
          <div key={village.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{village.name}</h3>
                  <p className="text-sm text-gray-500">{village.pemda}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-300">
                  Aktif
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Kepala Desa:</span>
                  <span>{village.headName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{village.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{village.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">Penduduk</p>
                  <p className="text-lg font-semibold">{village.population.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Atensi</p>
                  <p className="text-lg font-semibold">{village.atensiCount}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Eye className="w-4 h-4" />
                  Detail
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}