'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

interface DashboardForm {
  No?: number
  Nama_Grafik?: string
  Keterangan?: string
  Nama_Kolom?: string
  Syntax?: string
}

export default function EditCstDashboardPage() {
  const router = useRouter()
  const params = useParams()
  const no = params.no as string

  const [formData, setFormData] = useState<DashboardForm>({
    No: 0,
    Nama_Grafik: '',
    Keterangan: '',
    Nama_Kolom: '',
    Syntax: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isCreate = no === 'create'

  useEffect(() => {
    if (!isCreate) {
      fetchDashboard()
    } else {
      fetchNextNo()
    }
  }, [no])

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/admin/cstdashboard/${no}`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          No: data.No,
          Nama_Grafik: data.Nama_Grafik,
          Keterangan: data.Keterangan,
          Nama_Kolom: data.Nama_Kolom,
          Syntax: data.Syntax,
        })
        setSaved(true)
      }
    } catch (error) {
      console.error('Gagal mengambil data grafik:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNextNo = async () => {
    try {
      const res = await fetch('/api/admin/cstdashboard')
      if (res.ok) {
        const data = await res.json()
        const lastNo = data.length > 0
          ? Math.max(...data.map((item: { No: number }) => item.No))
          : 0
        setFormData((prev) => ({ ...prev, No: lastNo + 1 }))
      }
    } catch (error) {
      console.error('Gagal mengambil nomor terakhir:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {

const isCreate = !params.no || params.no === 'create'

      const url = isCreate
        ? '/api/admin/cstdashboard'
        : `/api/admin/cstdashboard/${no}`
      const method = isCreate ? 'POST' : 'PUT'

   
   
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const result = await res.json()
        setSaved(true)
        router.push(`/admin/cstdashboard`)
      }
    } catch (error) {
      console.error('Gagal menyimpan grafik:', error)
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
            {isCreate ? 'Tambah' : 'Edit'} Grafik Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {isCreate ? 'Buat grafik baru' : `Ubah grafik #${formData.No}`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor
            </label>
            <input
              type="number"
              value={formData.No || ''}
              onChange={(e) =>
                setFormData({ ...formData, No: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Grafik
            </label>
            <input
              value={formData.Nama_Grafik || ''}
              onChange={(e) =>
                setFormData({ ...formData, Nama_Grafik: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <input
              value={formData.Keterangan || ''}
              onChange={(e) =>
                setFormData({ ...formData, Keterangan: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kolom
              </label>
            <input
             value={formData.Nama_Kolom || ''}
             onChange={(e) =>
            setFormData({ ...formData, Nama_Kolom: e.target.value })
             }
               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
             />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Syntax
            </label>
            <textarea
              value={formData.Syntax || ''}
              onChange={(e) =>
                setFormData({ ...formData, Syntax: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={8}
              required
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
          </div>
        </form>
      </div>
    </div>
  )
}