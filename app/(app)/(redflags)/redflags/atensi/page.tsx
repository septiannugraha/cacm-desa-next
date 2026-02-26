// File: app/(dashboard)/redflags/atensi/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ListTree } from 'lucide-react'

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

function fmtPct(num: number) {
  // num sudah 0..100
  return `${num.toFixed(1)}%`
}

async function safeReadJson(res: Response) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return await res.json()
  const text = await res.text()
  return { _nonJson: true, _text: text }
}

export default function AtensiTerkirimPage() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<AtensiRow[]>([])
  const [q, setQ] = useState('')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())

      // ✅ endpoint baru: hanya isSent=true
      const res = await fetch(`/api/atensi?${params.toString()}`, { cache: 'no-store' })
      const json = await safeReadJson(res)
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat data atensi terkirim')
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

  // total untuk header ringkas (opsional)
  const summary = useMemo(() => {
    const totalAtensi = rows.length
    const totalDesa = rows.reduce((acc, r) => acc + (r.Jlh_Desa ?? 0), 0)
    const totalRF = rows.reduce((acc, r) => acc + (r.Jlh_RF ?? 0), 0)
    const totalTL = rows.reduce((acc, r) => acc + (r.Jlh_TL ?? 0), 0)
    const pct = totalRF > 0 ? (totalTL / totalRF) * 100 : 0
    return { totalAtensi, totalDesa, totalRF, totalTL, pct }
  }, [rows])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Atensi (Terkirim)</h1>
          <p className="text-sm text-muted-foreground">
            Menampilkan hanya atensi yang sudah dikirim (isSent = 1).
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5">
              Total Atensi: <b className="ml-1">{summary.totalAtensi}</b>
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5">
              Total Desa: <b className="ml-1">{summary.totalDesa}</b>
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5">
              Total RF: <b className="ml-1">{summary.totalRF}</b>
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5">
              Total TL: <b className="ml-1">{summary.totalTL}</b>
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5">
              % TL: <b className="ml-1">{fmtPct(summary.pct)}</b>
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={load} disabled={loading} variant="outline">
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
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari Nomor Atensi / Keterangan..."
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={load} disabled={loading}>
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
                    <th className="text-left p-3">Nomor Atensi</th>
                    <th className="text-left p-3">Tanggal Atensi</th>
                    <th className="text-left p-3">Tanggal Cut Off</th>
                    <th className="text-left p-3">Keterangan</th>
                    <th className="text-right p-3">Jumlah Desa</th>
                    <th className="text-right p-3">Jumlah Redflags</th>
                    <th className="text-right p-3">Jumlah TL</th>
                    <th className="text-right p-3">% TL</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const rf = r.Jlh_RF ?? 0
                    const tl = r.Jlh_TL ?? 0
                    const pct = rf > 0 ? (tl / rf) * 100 : 0

                    return (
                      <tr key={r.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">{r.No_Atensi}</td>
                        <td className="p-3">{fmtDate(r.Tgl_Atensi)}</td>
                        <td className="p-3">{fmtDate(r.Tgl_CutOff)}</td>
                        <td className="p-3">{r.Keterangan || '-'}</td>
                        <td className="p-3 text-right">{r.Jlh_Desa ?? '-'}</td>
                        <td className="p-3 text-right">{r.Jlh_RF ?? '-'}</td>
                        <td className="p-3 text-right">{r.Jlh_TL ?? '-'}</td>
                        <td className="p-3 text-right">{rf > 0 ? fmtPct(pct) : '-'}</td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/redflags/atensi/${r.id}`}>
                              <Button variant="outline">
                                <ListTree className="mr-2 h-4 w-4" />
                                Detail
                              </Button>
                            </Link>

 
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
