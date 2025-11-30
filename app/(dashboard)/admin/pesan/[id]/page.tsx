'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

interface TempPesanForm {
  APIServer: string
  Pesan?: string
}

export default function EditTempPesanPage() {
  const router = useRouter()
  const params = useParams()
  const server = params.server as string

  const [formData, setFormData] = useState<TempPesanForm>({
    APIServer: '',
    Pesan: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (server !== 'create') {
      fetchTempPesan()
    } else {
      setLoading(false)
    }
  }, [server])

  const fetchTempPesan = async () => {
    try {
      const response = await fetch(`/api/admin/temp-pesan/${server}`)
      if (response.ok) {
        const data = await response.json()
        setFormData(data)
      }
    } catch (error) {
      console.error('Failed to fetch temp pesan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = server === 'create' ? '/api/admin/temp-pesan' : `/api/admin/temp-pesan/${server}`
      const method = server === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/temp-pesan')
      }
    } catch (error) {
      console.error('Failed to save temp pesan:', error)
    } finally {
      setSaving(false)
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
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {server === 'create' ? 'Tambah' : 'Edit'} Temp Pesan
          </h1>
          <p className="text-gray-600 mt-1">
            {server === 'create' ? 'Tambah' : 'Edit'} data pesan sementara
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Server
            </label>
            <input
              type="text"
              value={formData.APIServer}
              onChange={(e) => setFormData({ ...formData, APIServer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={server !== 'create'} // hanya diisi saat create
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan
            </label>
            <input
              type="text"
              value={formData.Pesan || ''}
              onChange={(e) => setFormData({ ...formData, Pesan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}