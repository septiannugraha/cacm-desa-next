'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

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

export default function EditJnsAtensiPage() {
  const router = useRouter()
  const { id } = useParams() // Get the dynamic route param (ID)

  // Default formData is empty for Create
  const [formData, setFormData] = useState<JnsAtensi>({
    Jns_Atensi: 0,
    Nama_Atensi: '',
    Singkatan: '',
    Tipe: null,
    Kriteria_Jns: '',
    Kriteria_Nilai: null,
    Satuan: '',
    Syntax: '',
    Std_Caption: '',
    Real_Caption: '',
    Dif_Caption: '',
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id && id !== 'create') {
      fetchJnsAtensi()
    } else {
      setLoading(false) // For create page, no need to fetch data
    }
  }, [id])

  // Fetch data if it's an edit (when ID is provided)
  const fetchJnsAtensi = async () => {
    try {
      const response = await fetch(`/api/admin/jnsatensi/${id}`)
      const data = await response.json()
      if (response.ok) {
        setFormData(data)
      } else {
        setError(data.error || 'Failed to load data')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Handle form field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle form submit (POST for create, PUT for update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/jnsatensi/${id === 'create' ? '' : id}`, {
        method: id === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Data berhasil disimpan')
        router.push('/admin/jnsatensi')
      } else {
        setError(data.error || 'Failed to save data')
      }
    } catch (err) {
      console.error('Failed to update data:', err)
      setError('An error occurred while updating the data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6">{error}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {id === 'create' ? 'Tambah' : 'Edit'} Jenis Atensi
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="ID"           
        value={formData.Jns_Atensi !== null && formData.Jns_Atensi !== undefined ? String(formData.Jns_Atensi) : ''}
        onChange={(v) => setFormData({ ...formData, Jns_Atensi: v ? parseFloat(v) : 0 })} 
        />
      <Input label="Nama Atensi" value={formData.Nama_Atensi ?? ''} onChange={(v) => setFormData({ ...formData, Nama_Atensi: v })} />
      <Input label="Singkatan" value={formData.Singkatan ?? ''} onChange={(v) => setFormData({ ...formData, Singkatan: v })} />
        <Input label="Tipe" value={formData.Tipe !== null && formData.Tipe !== undefined ? String(formData.Tipe) : ''} onChange={(v) => setFormData({ ...formData, Tipe: v ? parseFloat(v) : null })} />
        <Input label="Kriteria Jenis" value={formData.Kriteria_Jns ?? ''} onChange={(v) => setFormData({ ...formData, Kriteria_Jns: v })} />
        <Input
          label="Kriteria Nilai"
          value={formData.Kriteria_Nilai !== null && formData.Kriteria_Nilai !== undefined ? String(formData.Kriteria_Nilai) : ''}
          onChange={(v) => setFormData({ ...formData, Kriteria_Nilai: v ? parseFloat(v) : null })}
        />
        <Input label="Satuan" value={formData.Satuan ?? ''} onChange={(v) => setFormData({ ...formData, Satuan: v })} />
        <div className="text-sm font-medium">Syntax</div>
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          rows={10}
          value={formData.Syntax ?? ''}
          onChange={(e) => setFormData({ ...formData, Syntax: e.target.value })}
          placeholder="Masukkan syntax..."
          disabled={loading}
        />
        <Input label="Std Caption" value={formData.Std_Caption ?? ''} onChange={(v) => setFormData({ ...formData, Std_Caption: v })} />
        <Input label="Real Caption" value={formData.Real_Caption ?? ''} onChange={(v) => setFormData({ ...formData, Real_Caption: v })} />
        <Input label="Dif Caption" value={formData.Dif_Caption ?? ''} onChange={(v) => setFormData({ ...formData, Dif_Caption: v })} />

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {id === 'create' ? 'Simpan' : 'Update'}
          </button>
          <button type="button" onClick={() => router.push('/admin/jnsatensi')} className="px-4 py-2 bg-gray-300 rounded">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

// Reusable input component
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
