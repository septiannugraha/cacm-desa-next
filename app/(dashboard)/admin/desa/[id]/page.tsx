'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditDesaPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [desa, setDesa] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDesa()
  }, [])

  const fetchDesa = async () => {
    try {
      const res = await fetch(`/api/admin/desa/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDesa(data)
      }
    } catch (err) {
      console.error('Failed to fetch desa:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesa({ ...desa, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/desa/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(desa),
      })
      if (res.ok) router.push('/admin/desa')
    } catch (err) {
      console.error('Failed to update desa:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>
  if (!desa) return <div className="p-6 text-center text-gray-500">Data desa tidak ditemukan</div>

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Desa</h1>
      <div className="space-y-4">
        <input type="text" name="Kd_Desa" value={desa.Kd_Desa} disabled className="w-full px-3 py-2 bg-gray-100 rounded" />
        <input type="text" name="Nama_Desa" value={desa.Nama_Desa ?? ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="Nama Desa" />
        <input type="text" name="Alamat" value={desa.Alamat ?? ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="Alamat" />
        <input type="text" name="Ibukota" value={desa.Ibukota ?? ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="Ibukota" />
        <input type="text" name="HP_Kades" value={desa.HP_Kades ?? ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="HP Kades" />
        <div className="flex justify-end gap-4">
          <button onClick={() => router.push('/admin/desa')} className="px-4 py-2 border rounded">Batal</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </div>
  )
}