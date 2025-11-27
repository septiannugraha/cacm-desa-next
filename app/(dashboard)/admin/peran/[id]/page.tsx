'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Peran {
  Peran: string
  Keterangan: string | null
  Menu: string | null
}

export default function EditPeranPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [peran, setPeran] = useState<Peran | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ Keterangan: '', Menu: '' })

  const id = params.id   // ← FIX: gunakan param langsung

  useEffect(() => {
    fetchPeran()
  }, [id])

  const fetchPeran = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/peran/${encodeURIComponent(id)}`)
      if (response.ok) {
        const data = await response.json()
        setPeran(data)
        setForm({
          Keterangan: data.Keterangan ?? '',
          Menu: data.Menu ?? ''
        })
      } else {
        setPeran(null)
      }
    } catch (error) {
      console.error('Failed to fetch peran:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/peran/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        router.push('/admin/peran')
      } else {
        const err = await response.json()
        alert(err?.error ?? 'Gagal menyimpan')
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus peran ini?')) return

    try {
      const response = await fetch(`/api/admin/peran/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/peran')
      } else {
        const err = await response.json()
        alert(err?.error ?? 'Gagal menghapus')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Terjadi kesalahan saat menghapus')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!peran) {
    return <div className="p-4">Peran tidak ditemukan.</div>
  }

  return (
    <div className="max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Peran: {peran.Peran}</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Keterangan</label>
          <input
            type="text"
            value={form.Keterangan}
            onChange={(e) => setForm({ ...form, Keterangan: e.target.value })}
            className="mt-1 block w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Menu</label>
          <input
            type="text"
            value={form.Menu}
            onChange={(e) => setForm({ ...form, Menu: e.target.value })}
            className="mt-1 block w-full border rounded-md px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Hapus
          </button>

          <button
            onClick={() => router.push('/admin/peran')}
            className="px-4 py-2 border rounded-lg"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  )
}
