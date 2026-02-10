// File: app/(dashboard)/redflags/atensi/[id]/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, MessageCircle , Eye} from 'lucide-react'

type AtensiInfo = {
  id: string
  Tahun: string
  Kd_Pemda: string
  No_Atensi: string
  isSent: boolean | null
}

type Row = {
  RowHandle: number
  id: string
  Tahun: string
  Kd_Pemda: string
  No_Atensi: string
  Kd_Desa: string
  Nama_Desa: string | null
  Jlh_RF: number | null
  Jlh_TL: number | null
  Persen: number | null
  HP_Kades: string | null
  Pesan: string | null
}

function safeWAPhone(raw: string | null) {
  if (!raw) return null
  // buang spasi, tanda +, -, dll
  let p = raw.replace(/[^\d]/g, '')
  if (!p) return null
  // kalau mulai 0 -> ganti 62
  if (p.startsWith('0')) p = '62' + p.slice(1)
  return p
}

function openWhatsApp(phone: string | null, message: string | null) {
  const p = safeWAPhone(phone)
  if (!p) {
    alert('Nomor HP Kades tidak valid/kosong.')
    return
  }
  const text = encodeURIComponent(message || '')
  const url = `https://wa.me/${p}${text ? `?text=${text}` : ''}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function AtensiDesaWhatsAppPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [atensi, setAtensi] = useState<AtensiInfo | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/atensi/${encodeURIComponent(id)}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat data')

      setAtensi(json.atensi || null)
      const data: Row[] = json.data || []
      setRows(data)

      // default: tidak dicentang semua
      setChecked({})
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
  }, [id])

  const selectedIds = useMemo(() => Object.keys(checked).filter((k) => checked[k]), [checked])
  const selectedRows = useMemo(() => rows.filter((r) => selectedIds.includes(r.id)), [rows, selectedIds])

  const totals = useMemo(() => {
    const rf = rows.reduce((acc, r) => acc + (r.Jlh_RF ?? 0), 0)
    const tl = rows.reduce((acc, r) => acc + (r.Jlh_TL ?? 0), 0)
    const pct = rf > 0 ? (tl / rf) * 100 : 0
    return { rf, tl, pct }
  }, [rows])

  function toggleAll(v: boolean) {
    const next: Record<string, boolean> = {}
    if (v) rows.forEach((r) => (next[r.id] = true))
    setChecked(next)
  }

  async function sendSelected() {
    if (selectedRows.length === 0) return alert('Pilih minimal 1 baris.')

    // buka satu-per-satu agar lebih “aman” dari popup blocker
    setSubmitting(true)
    try {
      selectedRows.forEach((r, i) => {
        setTimeout(() => {
          openWhatsApp(r.HP_Kades, r.Pesan)
        }, i * 400) // delay 0.4 detik antar tab
      })
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

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/redflags/atensi">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>

          <h1 className="text-xl font-semibold mt-3">Atensi • Desa</h1>
          <p className="text-sm text-muted-foreground">
            {atensi ? `Nomor Atensi ${atensi.No_Atensi} • Tahun ${atensi.Tahun} • Pemda ${atensi.Kd_Pemda}` : ''}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5">
              Total RF: <b className="ml-1">{totals.rf}</b>
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5">
              Total TL: <b className="ml-1">{totals.tl}</b>
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5">
              Persen TL: <b className="ml-1">{totals.pct.toFixed(2)}%</b>
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={load} disabled={loading || submitting} variant="outline">
            Refresh
          </Button>

          <Button
            onClick={sendSelected}
            disabled={submitting || selectedRows.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            title="Kirim WhatsApp untuk baris yang dicentang"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Kirim WA ({selectedRows.length})
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Tidak ada data.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="p-3 w-[54px] text-center">
                      <input
                        type="checkbox"
                        checked={rows.length > 0 && selectedIds.length === rows.length}
                        onChange={(e) => toggleAll(e.target.checked)}
                        aria-label="Pilih semua"
                      />
                    </th>
                    <th className="text-center p-3 w-[90px]">No Urut</th>
                    <th className="text-left p-3">Nomor Atensi</th>
                    <th className="text-left p-3">Kode</th>
                    <th className="text-left p-3">Nama Desa</th>
                    <th className="text-right p-3">Red Flags</th>
                    <th className="text-right p-3">Tindak Lanjut</th>
                    <th className="text-right p-3">Persentase</th>
                    <th className="text-left p-3">HP Kades</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => {
                    const pct = r.Persen ?? (r.Jlh_RF ? ((r.Jlh_TL ?? 0) / r.Jlh_RF) * 100 : 0)
                    const msgPreview = (r.Pesan || '').length > 60 ? (r.Pesan || '').slice(0, 60) + '…' : r.Pesan || '-'

                    return (
                      <tr key={r.id} className="border-b hover:bg-muted/30 align-top">
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={!!checked[r.id]}
                            onChange={(e) => setChecked((prev) => ({ ...prev, [r.id]: e.target.checked }))}
                            aria-label={`Pilih baris ${r.RowHandle}`}
                          />
                        </td>

                        <td className="p-3 text-center">{r.RowHandle}</td>
                        <td className="p-3 font-medium">{r.No_Atensi}</td>
                        <td className="p-3 font-mono">{r.Kd_Desa}</td>
                        <td className="p-3">{r.Nama_Desa || '-'}</td>

                        <td className="p-3 text-right">{r.Jlh_RF ?? 0}</td>
                        <td className="p-3 text-right">{r.Jlh_TL ?? 0}</td>
                        <td className="p-3 text-right">{Number.isFinite(pct) ? pct.toFixed(2) + '%' : '-'}</td>

                        <td className="p-3">{r.HP_Kades || '-'}</td>



                        <td className="p-3">
                          <div className="flex items-center gap-2">
                          <Link href={`/redflags/atensi/${id}/${r.id}`}>
                            <Button className="bg-slate-900 text-white hover:bg-slate-800">
                              <Eye className="mr-2 h-4 w-4" />
                              Detail
                            </Button>
                          </Link>

                            <Button
                              onClick={() => openWhatsApp(r.HP_Kades, r.Pesan)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              title="Kirim WhatsApp"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              WA
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="p-4 text-xs text-muted-foreground flex items-center justify-between border-t">
                <div>Terpilih: <b>{selectedRows.length}</b> baris</div>
                <div className="flex gap-3">
                  <span>Total RF: <b>{totals.rf}</b></span>
                  <span>Total TL: <b>{totals.tl}</b></span>
                  <span>Persen TL: <b>{totals.pct.toFixed(2)}%</b></span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
