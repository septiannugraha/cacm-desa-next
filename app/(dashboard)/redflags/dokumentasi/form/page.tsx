// File: app/(dashboard)/dokumentasi/form/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save } from 'lucide-react'

type Atensi = {
  id: string
  No_Atensi: string
  Tgl_Atensi: string
  Tgl_CutOff: string
  Keterangan: string | null
  isSent: boolean | null
}

export default function DokumentasiFormPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const id = sp.get('id')
  const isEdit = useMemo(() => !!id, [id])

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [No_Atensi, setNoAtensi] = useState('')
  const [Tgl_Atensi, setTglAtensi] = useState('')
  const [Tgl_CutOff, setTglCutoff] = useState('')
  const [Keterangan, setKeterangan] = useState('')

  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/dokumentasi/${id}`, { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Gagal memuat detail')

        const data: Atensi = json.data
        setNoAtensi(data.No_Atensi || '')
        // Untuk input datetime-local: harus format "YYYY-MM-DDTHH:mm"
        const tA = data.Tgl_Atensi ? new Date(data.Tgl_Atensi) : null
        const tC = data.Tgl_CutOff ? new Date(data.Tgl_CutOff) : null
        setTglAtensi(tA ? new Date(tA.getTime() - tA.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '')
        setTglCutoff(tC ? new Date(tC.getTime() - tC.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '')
        setKeterangan(data.Keterangan || '')
      } catch (e: any) {
        console.error(e)
        alert(e?.message || 'Gagal memuat detail')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isEdit])

  async function save() {
    if (!No_Atensi.trim()) return alert('No_Atensi wajib diisi')
    if (!Tgl_Atensi) return alert('Tgl_Atensi wajib diisi')
    if (!Tgl_CutOff) return alert('Tgl_CutOff wajib diisi')

    setSubmitting(true)
    try {
      if (isEdit) {
        const res = await fetch(`/api/dokumentasi/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // No_Atensi tidak saya izinkan diubah karena PK komposit
            Tgl_Atensi,
            Tgl_CutOff,
            Keterangan: Keterangan.trim() || null,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Gagal update')
      } else {
        const res = await fetch(`/api/dokumentasi/new`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            No_Atensi: No_Atensi.trim(),
            Tgl_Atensi,
            Tgl_CutOff,
            Keterangan: Keterangan.trim() || null,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Gagal create')
      }

      router.push('/dokumentasi')
      router.refresh()
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Gagal simpan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dokumentasi">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-semibold mt-3">{isEdit ? 'Edit Atensi' : 'Tambah Atensi'}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Ubah informasi Atensi (tanpa mengubah No_Atensi).' : 'Tambahkan Atensi baru.'}
          </p>
        </div>
        <Button onClick={save} disabled={loading || submitting}>
          <Save className="mr-2 h-4 w-4" />
          Simpan
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">No_Atensi</div>
              <Input
                value={No_Atensi}
                onChange={(e) => setNoAtensi(e.target.value)}
                disabled={isEdit} // kunci karena PK komposit
                placeholder="No_Atensi"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Tgl_Atensi</div>
              <Input type="datetime-local" value={Tgl_Atensi} onChange={(e) => setTglAtensi(e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Tgl_CutOff</div>
              <Input type="datetime-local" value={Tgl_CutOff} onChange={(e) => setTglCutoff(e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Keterangan</div>
              <Input value={Keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Opsional" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
