'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Koneksi {
  id: string | null
  id_Pemda: string | null
  Tahun: string
  Kd_Pemda: string
  Server: string | null
  DB: string | null
  UserID: string | null
  Password: string | null
  Con_Stat: boolean | null
  create_at: string | null
  create_by: string | null
  update_at: string | null
  update_by: string | null
}

export default function KoneksiPage() {
  const router = useRouter()
  const [koneksi, setKoneksi] = useState<Koneksi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKoneksi()
  }, [])

  const fetchKoneksi = async () => {
    try {
      const response = await fetch('/api/admin/koneksi')
      if (response.ok) {
        const data = await response.json()
        setKoneksi(data.connections || [])
      }
    } catch (error) {
      console.error('Failed to fetch koneksi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus koneksi ini?')) return

    try {
      const response = await fetch('/api/admin/koneksi', {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchKoneksi()
      }
    } catch (error) {
      console.error('Failed to delete koneksi:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Koneksi</h1>
          <p className="text-gray-600 mt-1">Kelola koneksi database</p>
        </div>
        <button
          onClick={() => router.push('/admin/koneksi/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Koneksi
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Server
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Database
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {koneksi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                koneksi.map((item, index) => (
                  <tr key={`${item.Tahun}-${item.Kd_Pemda}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.Server || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.DB || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.UserID || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.Con_Stat
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.Con_Stat ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push('/admin/koneksi/edit')}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete()}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
