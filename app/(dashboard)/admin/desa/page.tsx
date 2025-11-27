'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface TaDesa {
  id: string
  Tahun: string
  Kd_Pemda: string
  Kd_Desa: string
  Nama_Desa: string | null
  Alamat: string | null
  Ibukota: string | null
  HP_Kades: string | null
}

export default function DesaPage() {
  const router = useRouter()
  const [desa, setDesa] = useState<TaDesa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDesa()
  }, [])

  const fetchDesa = async () => {
    try {
      const response = await fetch('/api/admin/desa')
      if (response.ok) {
        const data = await response.json()
        setDesa(data)
      }
    } catch (error) {
      console.error('Failed to fetch desa:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return
    try {
      const response = await fetch(`/api/admin/desa/${id}`, { method: 'DELETE' })
      if (response.ok) fetchDesa()
    } catch (error) {
      console.error('Failed to delete desa:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Desa</h1>
          <p className="text-gray-600">Kelola data desa</p>
        </div>
        <button
          onClick={() => router.push('/admin/desa/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Desa
        </button>
      </div>

      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Desa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Desa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ibukota</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HP Kades</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {desa.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Tidak ada data</td>
            </tr>
          ) : (
            desa.map((item) => {
               
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{item.Kd_Desa}</td>
                  <td className="px-6 py-4 text-sm">{item.Nama_Desa ?? '-'}</td>
                  <td className="px-6 py-4 text-sm">{item.Alamat ?? '-'}</td>
                  <td className="px-6 py-4 text-sm">{item.Ibukota ?? '-'}</td>
                  <td className="px-6 py-4 text-sm">{item.HP_Kades ?? '-'}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => router.push(`/admin/desa/${item.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}