'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface JnsAtensi {
  Jns_Atensi: number
  Nama_Atensi: string | null
  Singkatan: string | null
  Tipe: number | null
  Kriteria_Jns: string | null
  Kriteria_Nilai: number | null
  Satuan: string | null
  Syntax: string | null
  Std_Caption: string | null
  Real_Caption: string | null
  Dif_Caption: string | null
}

export default function JnsAtensiPage() {
  const router = useRouter()
  const [data, setData] = useState<JnsAtensi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/jns-atensi')
      if (response.ok) {
        const json = await response.json()
        setData(json)
      }
    } catch (error) {
      console.error('Failed to fetch JnsAtensi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return
    try {
      const response = await fetch(`/api/admin/jns-atensi/${id}`, { method: 'DELETE' })
      if (response.ok) fetchData()
    } catch (error) {
      console.error('Failed to delete JnsAtensi:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Jenis Atensi</h1>
          <p className="text-gray-600">Kelola data jenis atensi</p>
        </div>
        <button
          onClick={() => router.push('/admin/jns-atensi/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Jenis Atensi
        </button>
      </div>

      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Atensi</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Singkatan</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-6 py-4 text-center text-gray-500">Tidak ada data</td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.Jns_Atensi} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{item.Jns_Atensi}</td>
                <td className="px-6 py-4 text-sm">{item.Nama_Atensi ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Singkatan ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Tipe ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Kriteria_Jns ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Kriteria_Nilai ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Satuan ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Std_Caption ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Real_Caption ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Dif_Caption ?? '-'}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    onClick={() => router.push(`/admin/jns-atensi/${item.Jns_Atensi}`)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.Jns_Atensi)}
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
  )
}