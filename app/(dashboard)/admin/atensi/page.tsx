'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Atensi {
  id: string | null
  id_Pemda: string | null
  Tahun: string
  Kd_Pemda: string
  No_Atensi: string
  Tgl_Atensi: string
  Tgl_CutOff: string
  Keterangan: string | null
  Jlh_Desa: number | null
  Jlh_RF: number | null
  Jlh_TL: number | null
  isSent: boolean | null
  create_at: string | null
  create_by: string | null
  update_at: string | null
  update_by: string | null
}

export default function AtensiPage() {
  const router = useRouter()
  const [atensi, setAtensi] = useState<Atensi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAtensi()
  }, [])

  const fetchAtensi = async () => {
    try {
      const response = await fetch('/api/admin/atensi')
      if (response.ok) {
        const data = await response.json()
        setAtensi(data.atensi || [])
      }
    } catch (error) {
      console.error('Failed to fetch atensi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (No_Atensi: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus periode atensi ini?')) return

    try {
      const response = await fetch(`/api/admin/atensi?No_Atensi=${No_Atensi}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchAtensi()
      }
    } catch (error) {
      console.error('Failed to delete atensi:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Atensi</h1>
          <p className="text-gray-600 mt-1">Kelola periode atensi dan temuan audit</p>
        </div>
        <button
          onClick={() => router.push('/admin/atensi/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Periode Atensi
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Atensi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tgl Atensi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tgl Cut-Off
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Desa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Red Flags
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
              {atensi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                atensi.map((item) => (
                  <tr key={`${item.Tahun}-${item.Kd_Pemda}-${item.No_Atensi}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.No_Atensi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.Tgl_Atensi).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.Tgl_CutOff).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {item.Jlh_Desa || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {item.Jlh_RF || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.isSent
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.isSent ? 'Terkirim' : 'Belum Terkirim'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/atensi/${item.No_Atensi}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.No_Atensi)}
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
