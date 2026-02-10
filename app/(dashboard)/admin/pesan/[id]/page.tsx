'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

interface TempPesanForm {
  APIServer: string
  Pesan?: string | null
}

async function safeReadJson(res: Response) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return await res.json()
  const text = await res.text()
  return { _nonJson: true, _text: text }
}

export default function EditTempPesanPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const idParam = params?.id

  const isCreate = useMemo(() => idParam === 'create', [idParam])
  const id = useMemo(() => (isCreate ? null : idParam), [isCreate, idParam])

  const [formData, setFormData] = useState<TempPesanForm>({
    APIServer: '',
    Pesan: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchTempPesan() {
      if (isCreate) {
        setLoading(false)
        return
      }
      if (!id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/admin/pesan/${encodeURIComponent(id)}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        })
        const json = await safeReadJson(res)

        if (!res.ok) throw new Error(json?.error || 'Gagal memuat data')

        if (!cancelled) {
          setFormData({
            APIServer: json?.APIServer ?? '',
            Pesan: json?.Pesan ?? '',
          })
        }
      } catch (error: any) {
        console.error('Failed to fetch temp pesan:', error)
        if (!cancelled) alert(error?.message || 'Gagal memuat data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTempPesan()
    return () => {
      cancelled = true
    }
  }, [id, isCreate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.APIServer.trim()) return alert('API Server wajib diisi')

    setSaving(true)
    try {
      const url = isCreate ? '/api/admin/pesan' : `/api/admin/pesan/${encodeURIComponent(id!)}` // edit by id
      const method = isCreate ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          APIServer: formData.APIServer.trim(),
          Pesan: (formData.Pesan ?? '').toString(),
        }),
      })

      const json = await safeReadJson(res)
      if (!res.ok) throw new Error(json?.error || 'Gagal simpan')

      router.push('/admin/pesan')
      router.refresh()
    } catch (error: any) {
      console.error('Failed to save temp pesan:', error)
      alert(error?.message || 'Gagal simpan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isCreate ? 'Tambah' : 'Edit'} Template Pesan</h1>
          <p className="text-gray-600 mt-1">{isCreate ? 'Tambah' : 'Edit'} data pesan sementara</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Server</label>
            <input
              type="text"
              value={formData.APIServer}
              onChange={(e) => setFormData({ ...formData, APIServer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
            <textarea
              rows={4} // ✅ 4 baris
              value={formData.Pesan ?? ''}
              onChange={(e) => setFormData({ ...formData, Pesan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Isi template pesan..."
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
