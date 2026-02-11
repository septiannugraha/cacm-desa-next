'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function TaPemdaPage() {
  const router = useRouter()

  const [taPemda, setTaPemda] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data when the page loads
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/pemda') // Make sure this endpoint is correct
        const data = await response.json()
        setTaPemda(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleEdit = (id: string) => {
    // Navigate to the edit page
    router.push(`/admin/pemda/${id}`)
  }

  const handleAdd = () => {
    // Navigate to the add page
    router.push('/admin/pemda/create')
  }

  const handleDelete = async (id: string) => {
    // Show confirmation before deleting
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        const response = await fetch(`/api/admin/pemda/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Remove the deleted record from the list
          setTaPemda((prevData) => prevData.filter((item) => item.id !== id))
          alert('Data berhasil dihapus')
        } else {
          const errorData = await response.json()
          alert(errorData.error || 'Gagal menghapus data')
        }
      } catch (error) {
        console.error('Failed to delete Ta_Pemda:', error)
        alert('Gagal menghapus data')
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pemda</h1>
          <p className="text-gray-600">Kelola data Pemda</p>
        </div>

        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah
        </button>
      </div>

      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Pemda</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Pemda</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ibukota</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {taPemda.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Tidak ada data</td>
            </tr>
          ) : (
            taPemda.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{item.Kd_Pemda}</td>
                <td className="px-6 py-4 text-sm">{item.Nama_Pemda}</td>
                <td className="px-6 py-4 text-sm">{item.Ibukota}</td>
                <td className="px-6 py-4 text-sm">{item.Alamat}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    onClick={() => handleEdit(item.id)}
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
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
