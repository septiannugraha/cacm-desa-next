'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Dashboard {
  No: number
  Nama_Grafik?: string
  Keterangan?: string
  Syntax?: string
}

export default function CstDashboardPage() {
  const router = useRouter()
  const [items, setItems] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/cstdashboard')
      if (response.ok) {
        const data = await response.json()
        setItems(data || [])
      }
    } catch (error) {
      console.error('Gagal mengambil data dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (no: number) => {
    if (!confirm('Yakin ingin menghapus grafik ini?')) return

    try {
      const response = await fetch(`/api/admin/cstdashboard/${no}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchDashboard()
      }
    } catch (error) {
      console.error('Gagal menghapus grafik:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Grafik Dashboard</h1>
          <p className="text-gray-600 mt-1">Kelola grafik dan query dashboard</p>
        </div>
        <button
          onClick={() => router.push('/admin/cstdashboard/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Grafik
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Grafik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Tidak ada data</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.No} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.No}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Nama_Grafik || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.Keterangan || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/cstdashboard/${item.No}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.No)}
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