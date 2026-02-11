'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface TaPemda {
  Tahun: string
  Kd_Pemda: string
  Nama_Pemda: string | null
  Ibukota: string | null
  Alamat: string | null
  Nm_Bupati: string | null
  Jbt_Bupati: string | null
  Nm_Inspektur: string | null
  NIP_Inspektur: string | null
  Jbt_Inspektur: string | null
  Alamat_Inspektorat: string | null
  Nm_Admin: string | null
  HP_Admin: string | null
  email_Admin: string | null
  isactive: boolean
}

export default function EditTaPemdaPage() {
  const router = useRouter()
  const { id } = useParams()
  const [formData, setFormData] = useState<TaPemda>({
    Tahun: '',
    Kd_Pemda: '',
    Nama_Pemda: null,
    Ibukota: null,
    Alamat: null,
    Nm_Bupati: null,
    Jbt_Bupati: null,
    Nm_Inspektur: null,
    NIP_Inspektur: null,
    Jbt_Inspektur: null,
    Alamat_Inspektorat: null,
    Nm_Admin: null,
    HP_Admin: null,
    email_Admin: null,
    isactive: true,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/pemda/${id}`)
        const data = await response.json()
        setFormData(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    setLoading(true)

    const method = id ? 'PUT' : 'POST'  // Determine if it's create or update
    const endpoint = id
      ? `/api/admin/pemda/${id}` // Update existing
      : '/api/admin/pemda' // Create new

    const body = id
      ? { // For update, exclude `id`, `Tahun`, `Kd_Pemda`
          ...formData,
          // Omit these fields
          Tahun: undefined,
          Kd_Pemda: undefined,
          id: undefined,
        }
      : formData  // For create, send the whole data

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        alert('Data berhasil diperbarui')
        router.push('/admin/pemda')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Gagal memperbarui data Pemda')
      }
    } catch (error) {
      console.error('Error updating data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!formData) return <div className="p-6">Data tidak ditemukan</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Pemda</h1>
      <div className="space-y-4">
        <Input label="Tahun" value={formData.Tahun} onChange={(v) => setFormData({ ...formData, Tahun: v })} />
        <Input label="Kode Pemda" value={formData.Kd_Pemda} onChange={(v) => setFormData({ ...formData, Kd_Pemda: v })} />
        <Input label="Nama Pemda" value={formData.Nama_Pemda ?? ''} onChange={(v) => setFormData({ ...formData, Nama_Pemda: v })} />
        <Input label="Ibukota" value={formData.Ibukota ?? ''} onChange={(v) => setFormData({ ...formData, Ibukota: v })} />
        <Input label="Alamat" value={formData.Alamat ?? ''} onChange={(v) => setFormData({ ...formData, Alamat: v })} />
        <Input label="Nama Bupati" value={formData.Nm_Bupati ?? ''} onChange={(v) => setFormData({ ...formData, Nm_Bupati: v })} />
        <Input label="Jabatan Bupati" value={formData.Jbt_Bupati ?? ''} onChange={(v) => setFormData({ ...formData, Jbt_Bupati: v })} />
        <Input label="Nama Inspektur" value={formData.Nm_Inspektur ?? ''} onChange={(v) => setFormData({ ...formData, Nm_Inspektur: v })} />
        <Input label="NIP Inspektur" value={formData.NIP_Inspektur ?? ''} onChange={(v) => setFormData({ ...formData, NIP_Inspektur: v })} />
        <Input label="Jabatan Inspektur" value={formData.Jbt_Inspektur ?? ''} onChange={(v) => setFormData({ ...formData, Jbt_Inspektur: v })} />
        <Input label="Alamat Inspektorat" value={formData.Alamat_Inspektorat ?? ''} onChange={(v) => setFormData({ ...formData, Alamat_Inspektorat: v })} />
        <Input label="Nama Admin" value={formData.Nm_Admin ?? ''} onChange={(v) => setFormData({ ...formData, Nm_Admin: v })} />
        <Input label="HP Admin" value={formData.HP_Admin ?? ''} onChange={(v) => setFormData({ ...formData, HP_Admin: v })} />
        <Input label="Email Admin" value={formData.email_Admin ?? ''} onChange={(v) => setFormData({ ...formData, email_Admin: v })} />
      </div>
      <div className="flex gap-4">
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
          Simpan
        </button>
        <button onClick={() => router.push('/admin/pemda')} className="px-4 py-2 bg-gray-300 rounded">
          Batal
        </button>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  disabled = false,
}: {
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
