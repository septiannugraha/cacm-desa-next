// File: app/(dashboard)/dokumentasi/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Send, Plus, Pencil, ListTree, X } from 'lucide-react'

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

type JnsAtensiItem = {
  Jns_Atensi: number
  Nama_Atensi: string | null
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function safeReadJson(res: Response) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return await res.json()
  const text = await res.text()
  return { _nonJson: true, _text: text }
}

export default function DokumentasiPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rows, setRows] = useState<AtensiRow[]>([])

  const [q, setQ] = useState('')
  const [isSent, setIsSent] = useState<'all' | 'true' | 'false'>('all')

  // ===== Modal Kirim =====
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<AtensiRow | null>(null)
  const [jenisLoading, setJenisLoading] = useState(false)
  const [jenisList, setJenisList] = useState<JnsAtensiItem[]>([])
  const [selected, setSelected] = useState<number[]>([])

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (isSent !== 'all') params.set('isSent', isSent)

      const res = await fetch(`/api/dokumentasi?${params.toString()}`, { cache: 'no-store' })
      const json = await safeReadJson(res)
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

  function closeModal() {
    setOpen(false)
    setTarget(null)
    setJenisList([])
    setSelected([])
  }

  async function openKirimModal(row: AtensiRow) {
    if (row.isSent === true) return

    setOpen(true)
    setTarget(row)
    setJenisList([])
    setSelected([])
    setJenisLoading(true)

    try {
      const res = await fetch(`/api/dokumentasi/${encodeURIComponent(row.id)}/jenis-atensi`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      const json = await safeReadJson(res)
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat jenis atensi')

      const list: JnsAtensiItem[] = json.data || []
      setJenisList(list)

      // default: centang semua (lebih praktis)
      setSelected(list.map((x) => Number(x.Jns_Atensi)))
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Gagal memuat jenis atensi')
      closeModal()
    } finally {
      setJenisLoading(false)
    }
  }

  function toggleSelected(code: number) {
    setSelected((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code].sort((a, b) => a - b)))
  }

  async function submitKirim() {
    if (!target) return
    if (target.isSent === true) return

    if (jenisList.length === 0) {
      alert('Tidak ada jenis atensi pada rincian untuk dikirim.')
      return
    }

    if (selected.length === 0) {
      alert('Pilih minimal 1 jenis atensi.')
      return
    }

    const selectedValuesString = selected.join(',')

    if (!confirm(`Kirim Atensi ${target.No_Atensi} untuk jenis: ${selectedValuesString}?`)) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/dokumentasi/${encodeURIComponent(target.id)}/kirim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          selectedJnsAtensi: selected, // array (aman)
          selectedValuesString, // string koma (sesuai permintaan Anda)
        }),
      })

      const json = await safeReadJson(res)
      if (!res.ok) throw new Error(json?.error || 'Gagal kirim')

      closeModal()
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
          <p className="text-sm text-muted-foreground"></p>
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
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari Nomor Atensi / Keterangan..." />
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
                    <th className="text-left p-3">Nomor Atensi</th>
                    <th className="text-left p-3">Tanggal Atensi</th>
                    <th className="text-left p-3">Tanggal Cut Off</th>
                    <th className="text-left p-3">Keterangan</th>
                    <th className="text-right p-3">Jumlah Desa</th>
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
                          {sent ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium">
                              Sudah dikirim
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                              Belum dikirim
                            </span>
                          )}
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
                              onClick={() => openKirimModal(r)}
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

      {/* ===== MODAL KIRIM ===== */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl bg-background shadow-xl border">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div>
                  <div className="text-base font-semibold">Kirim Atensi</div>
                  <div className="text-xs text-muted-foreground">
                    {target ? `Nomor: ${target.No_Atensi}` : ''}
                  </div>
                </div>
                <Button variant="ghost" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="px-5 py-4">
                {jenisLoading ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Spinner />
                    <span>Memuat jenis atensi...</span>
                  </div>
                ) : jenisList.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Tidak ada jenis atensi pada rincian (CACM_Atensi_Desa_Rinc).
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Pilih Jenis Atensi</div>

                    <div className="max-h-[320px] overflow-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background border-b">
                          <tr>
                            <th className="p-3 w-[60px]">Pilih</th>
                            <th className="p-3 w-[120px] text-left">Kode</th>
                            <th className="p-3 text-left">Nama Jenis Atensi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jenisList.map((j) => {
                            const code = Number(j.Jns_Atensi)
                            const checked = selected.includes(code)
                            return (
                              <tr key={code} className="border-b hover:bg-muted/30">
                                <td className="p-3">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSelected(code)}
                                  />
                                </td>
                                <td className="p-3 font-mono">{code}</td>
                                <td className="p-3">{j.Nama_Atensi || '-'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div>Terpilih: {selected.length} jenis</div>
                      <div className="font-mono">Kode: {selected.join(',')}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
                <Button variant="outline" onClick={closeModal} disabled={submitting}>
                  Batal
                </Button>
                <Button
                  onClick={submitKirim}
                  disabled={submitting || jenisLoading || !target || jenisList.length === 0 || selected.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Mengirim...' : 'Kirim'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
