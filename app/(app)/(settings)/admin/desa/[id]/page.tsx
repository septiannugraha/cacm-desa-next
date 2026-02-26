'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface TaDesa {
  Kd_Desa: string
  Nama_Desa: string | null
  Alamat: string | null
  Ibukota: string | null
  HP_Kades: string | null
}

export default function EditDesaPage() {
  const router = useRouter()
  const { id } = useParams()
  const [desa, setDesa] = useState<TaDesa | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/desa/${id}`)
      .then((res) => res.json())
      .then((data) => setDesa(data))
      .catch((err) => console.error('Gagal ambil data desa:', err))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/admin/desa/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(desa),
      })
      if (res.ok) {
        alert('Data berhasil diperbarui')
        router.push('/admin/desa')
      }
    } catch (err) {
      console.error('Gagal update desa:', err)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!desa) return <div className="p-6">Data tidak ditemukan</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Desa</h1>
      <div className="space-y-4">
        <Input label="Kode Desa" value={desa.Kd_Desa} disabled />
        <Input label="Nama Desa" value={desa.Nama_Desa} onChange={(v) => setDesa({ ...desa, Nama_Desa: v })} />
        <Input label="Alamat" value={desa.Alamat} onChange={(v) => setDesa({ ...desa, Alamat: v })} />
        <Input label="Ibukota" value={desa.Ibukota} onChange={(v) => setDesa({ ...desa, Ibukota: v })} />
        <Input label="HP Kades" value={desa.HP_Kades} onChange={(v) => setDesa({ ...desa, HP_Kades: v })} />
      </div>
      <div className="flex gap-4">
        <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
        <button onClick={() => router.push('/admin/desa')} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, disabled = false }: {
  label: string
  value: string | null
  onChange?: (val: string) => void
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`mt-1 block w-full border rounded p-2 ${disabled ? 'bg-gray-100' : ''}`}
      />
    </div>
  )
}