// File: app/(dashboard)/dokumentasi/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Send, Plus, Pencil, ListTree } from 'lucide-react'

type AtensiRow = {
  id: string
  Tahun: string
  Kd_Pemda: string
  No_Atensi: string
  Tgl_Atensi: string
  Tgl_CutOff: string
  Keterangan: string | null
  Jlh_Desa: number | null
  Jlh_RF: number | null
  Jlh_TL: number | null
  isSent: boolean | null
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DokumentasiPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rows, setRows] = useState<AtensiRow[]>([])

  const [q, setQ] = useState('')
  const [isSent, setIsSent] = useState<'all' | 'true' | 'false'>('all')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (isSent !== 'all') params.set('isSent', isSent)

      const res = await fetch(`/api/dokumentasi?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat data')
      setRows(json.data || [])
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function kirim(row: AtensiRow) {
    if (row.isSent === true) return
    if (!confirm(`Kirim Atensi ${row.No_Atensi}?`)) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/dokumentasi/${row.id}/kirim`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal kirim')
      await load()
      alert('Berhasil kirim atensi.')
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Gagal kirim')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Dokumentasi</h1>
          <p className="text-sm text-muted-foreground">
            Menampilkan data Atensi (cACM_Atensi). Tambah & Edit dilakukan di halaman form terpisah.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/redflags/dokumentasi/form">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          </Link>
          <Button onClick={load} disabled={loading || submitting} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Pencarian</div>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari No_Atensi / Keterangan..." />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Status Kirim</div>
              <select
                className="h-9 rounded-md border px-3 w-full"
                value={isSent}
                onChange={(e) => setIsSent(e.target.value as any)}
              >
                <option value="all">Semua</option>
                <option value="true">Sudah dikirim</option>
                <option value="false">Belum dikirim</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={load} disabled={loading || submitting}>
                Terapkan Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 flex items-center gap-2">
              <Spinner />
              <span>Memuat data...</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Tidak ada data.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left p-3">No_Atensi</th>
                    <th className="text-left p-3">Tgl_Atensi</th>
                    <th className="text-left p-3">Tgl_CutOff</th>
                    <th className="text-left p-3">Keterangan</th>
                    <th className="text-right p-3">Jlh Desa</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const sent = r.isSent ?? false
                    return (
                      <tr key={r.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">{r.No_Atensi}</td>
                        <td className="p-3">{fmtDate(r.Tgl_Atensi)}</td>
                        <td className="p-3">{fmtDate(r.Tgl_CutOff)}</td>
                        <td className="p-3">{r.Keterangan || '-'}</td>
                        <td className="p-3 text-right">{r.Jlh_Desa ?? '-'}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                            {sent ? 'Sudah dikirim' : 'Belum dikirim'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/redflags/dokumentasi/form?id=${encodeURIComponent(r.id)}`}>
                              <Button variant="outline">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </Link>

                            <Link href={`/redflags/dokumentasi/${r.id}/desa`}>
                              <Button variant="outline">
                                <ListTree className="mr-2 h-4 w-4" />
                                Detail
                              </Button>
                            </Link>

                            <Button
                              onClick={() => kirim(r)}
                              disabled={submitting || sent}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Kirim
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
