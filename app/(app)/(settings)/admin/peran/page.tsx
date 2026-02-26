'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Peran {
  Peran: string
  Keterangan: string | null
  Menu: string | null
}

export default function PeranPage() {
  const router = useRouter()
  const [peranList, setPeranList] = useState<Peran[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPeran()
  }, [])

  const fetchPeran = async () => {
    try {
      const response = await fetch('/api/admin/peran')
      if (response.ok) {
        const data = await response.json()
        setPeranList(data)
      }
    } catch (error) {
      console.error('Failed to fetch peran:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (peranId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return

    try {
      const response = await fetch(`/api/admin/peran/${peranId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchPeran()
      }
    } catch (error) {
      console.error('Failed to delete peran:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Peran</h1>
          <p className="text-gray-600 mt-1">Kelola peran pengguna</p>
        </div>
        <button
          onClick={() => router.push('/admin/peran/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Peran
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peran</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {peranList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                peranList.map((item) => (
                  <tr key={item.Peran} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.Peran}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.Keterangan ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.Menu ?? '-'}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/peran/${item.Peran}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.Peran)}
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