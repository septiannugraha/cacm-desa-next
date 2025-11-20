'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Zap } from 'lucide-react'

interface KoneksiForm {
  id?: string
  Tahun: string
  id_Koneksi: string
  Kd_Pemda?: string
  Con_Stat?: boolean
}

interface KoneksiOption {
  id: string
  Nama_Koneksi: string
}

export default function EditKoneksiPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [formData, setFormData] = useState<KoneksiForm>({
    Tahun: '',
    id_Koneksi: '',
  })

  const [daftarKoneksi, setDaftarKoneksi] = useState<KoneksiOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isCreate = id === 'create'

  useEffect(() => {
    fetchDaftarKoneksi()
    if (!isCreate) {
      fetchKoneksi()
    } else {
      const defaultYear = new Date().getFullYear().toString()
      setFormData((prev) => ({ ...prev, Tahun: defaultYear }))
      setLoading(false)
    }
  }, [id])

  const fetchDaftarKoneksi = async () => {
    try {
      const res = await fetch('/api/dbkoneksi')
      if (res.ok) {
        const data = await res.json()
        setDaftarKoneksi(data)
      }
    } catch (error) {
      console.error('Gagal mengambil daftar koneksi:', error)
    }
  }

  const fetchKoneksi = async () => {
    try {
      const res = await fetch(`/api/admin/koneksi/${id}`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          id: data.id,
          Tahun: data.Tahun,
          id_Koneksi: data.id_Koneksi,
          Kd_Pemda: data.Kd_Pemda,
          Con_Stat: data.Con_Stat,
        })
        setSaved(true)
      }
    } catch (error) {
      console.error('Gagal mengambil koneksi:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTahunOptions = () => {
    const currentYear = new Date().getFullYear()
    const start = currentYear - 5
    const end = currentYear + 5
    const years = []
    for (let y = start; y <= end; y++) {
      years.push(y.toString())
    }
    return years
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = isCreate ? '/api/admin/koneksi' : `/api/admin/koneksi/${id}`
      const method = isCreate ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        if (isCreate) {
          const result = await res.json()
          setSaved(true)
          fetchKoneksi() // refresh data
        }
        router.refresh()
      }
    } catch (error) {
      console.error('Gagal menyimpan koneksi:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleActivate = async () => {
    if (!id) return

    try {
      const res = await fetch(`/api/admin/koneksi/activate/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
        }),
      })

      if (res.ok) {
        router.push('/admin/koneksi')
      }
    } catch (error) {
      console.error('Gagal mengaktifkan koneksi:', error)
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
            {isCreate ? 'Tambah' : 'Edit'} Koneksi
          </h1>
          <p className="text-gray-600 mt-1">
            {isCreate ? 'Tambah' : 'Edit'} koneksi database
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <select
              value={formData.Tahun}
              onChange={(e) => setFormData({ ...formData, Tahun: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Pilih Tahun --</option>
              {generateTahunOptions().map((tahun) => (
                <option key={tahun} value={tahun}>
                  {tahun}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Koneksi</label>
            <select
              value={formData.id_Koneksi}
              onChange={(e) => setFormData({ ...formData, id_Koneksi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Pilih Koneksi --</option>
              {daftarKoneksi.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.Nama_Koneksi}
                </option>
              ))}
            </select>
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

            {(saved || !isCreate) && (
              <button
                type="button"
                onClick={handleActivate}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Aktifkan Koneksi
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}