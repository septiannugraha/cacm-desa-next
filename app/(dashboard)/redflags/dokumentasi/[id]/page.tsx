// File: app/(dashboard)/dokumentasi/[id]/dokumen/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react'

type Atensi = {
  id: string
  No_Atensi: string
  Tgl_Atensi: string
  Tgl_CutOff: string
  Keterangan: string | null
}

type Dokumen = {
  id: string
  nama: string
  jenis: string | null
  url: string
  keterangan: string | null
  created_at: string
  created_by: string | null
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DokumenAtensiPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [atensi, setAtensi] = useState<Atensi | null>(null)
  const [docs, setDocs] = useState<Dokumen[]>([])

  // form
  const [nama, setNama] = useState('')
  const [jenis, setJenis] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [file, setFile] = useState<File | null>(null)

  async function load() {
    setLoading(true)
    try {
      // 1) detail atensi
      const aRes = await fetch(`/api/dokumentasi/${id}`, { cache: 'no-store' })
      const aJson = await aRes.json()
      if (!aRes.ok) throw new Error(aJson?.error || 'Gagal memuat detail atensi')
      setAtensi(aJson.data)

      // 2) list dokumen
      const dRes = await fetch(`/api/dokumentasi/${id}/dokumen`, { cache: 'no-store' })
      const dJson = await dRes.json()
      if (!dRes.ok) throw new Error(dJson?.error || 'Gagal memuat dokumen')
      setDocs(dJson.data || [])
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Gagal memuat')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function uploadDoc() {
    if (!nama.trim()) return alert('Nama dokumen wajib diisi.')
    if (!file) return alert('File wajib dipilih.')

    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('nama', nama.trim())
      if (jenis.trim()) form.append('jenis', jenis.trim())
      if (keterangan.trim()) form.append('keterangan', keterangan.trim())
      form.append('file', file)

      const res = await fetch(`/api/dokumentasi/${id}/dokumen`, {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal upload dokumen')

      setNama('')
      setJenis('')
      setKeterangan('')
      setFile(null)

      await load()
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Gagal upload')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Spinner />
        <span>Memuat...</span>
      </div>
    )
  }

  if (!atensi) return <div className="p-6">Atensi tidak ditemukan.</div>

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/redflags/dokumentasi">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-semibold mt-3">Dokumen Atensi</h1>
          <p className="text-sm text-muted-foreground">
            No_Atensi: <span className="font-medium">{atensi.No_Atensi}</span> • Tgl_Atensi:{' '}
            {fmtDate(atensi.Tgl_Atensi)} • CutOff: {fmtDate(atensi.Tgl_CutOff)}
          </p>
        </div>

        <Button onClick={load} disabled={submitting}>
          Refresh
        </Button>
      </div>

      {/* Upload */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-semibold">Tambah Dokumen</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama dokumen (wajib)" />
            <Input value={jenis} onChange={(e) => setJenis(e.target.value)} placeholder="Jenis (opsional) ex: BA, Foto, SK" />
            <Input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Keterangan (opsional)" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            <Button onClick={uploadDoc} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            * Endpoint upload memakai multipart/form-data. Pastikan server Anda mendukung penyimpanan file (local/S3/minio).
          </div>
        </CardContent>
      </Card>

      {/* List docs */}
      <Card>
        <CardContent className="p-0">
          {docs.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Belum ada dokumen.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left p-3">Nama</th>
                    <th className="text-left p-3">Jenis</th>
                    <th className="text-left p-3">Keterangan</th>
                    <th className="text-left p-3">Dibuat</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{d.nama}</td>
                      <td className="p-3">{d.jenis || '-'}</td>
                      <td className="p-3">{d.keterangan || '-'}</td>
                      <td className="p-3">{fmtDate(d.created_at)}</td>
                      <td className="p-3">
                        <a href={d.url} target="_blank" rel="noreferrer">
                          <Button variant="outline">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Buka
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
