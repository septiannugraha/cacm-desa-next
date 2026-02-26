'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Rows3, RefreshCw, MessageCircle } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

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
  No_Atensi: string // ❌ tidak ditampilkan
  Kd_Desa: string
  Nama_Desa: string | null
  Jlh_RF: number | null
  Jlh_TL: number | null
  Persen: number | null
  HP_Kades: string | null
  Pesan: string | null
  StatusTL?: number | null
  update_at?: string | null
}

function safeWAPhone(raw: string | null) {
  if (!raw) return null
  let p = raw.replace(/[^\d]/g, '')
  if (!p) return null
  if (p.startsWith('0')) p = '62' + p.slice(1)
  return p
}

function buildWAUrl(phone: string | null, message: string | null) {
  const p = safeWAPhone(phone)
  if (!p) return null
  const text = encodeURIComponent(message || '')
  return `https://wa.me/${p}${text ? `?text=${text}` : ''}`
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ v }: { v: number | null | undefined }) {
  const value = v ?? null
  const meta =
    value === 5
      ? { label: 'Terkirim', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
      : value === 2
      ? { label: 'Belum Kirim', cls: 'bg-amber-100 text-amber-800 border-amber-200' }
      : value === 7
      ? { label: 'Kirim TL', cls: 'bg-sky-100 text-sky-800 border-sky-200' }
      : {
          label: value === null ? '—' : `Status ${value}`,
          cls: 'bg-slate-100 text-slate-700 border-slate-200',
        }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.cls}`}
    >
      {meta.label}
    </span>
  )
}

function MiniRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-1">
      <div className="text-[11px] text-slate-500">{k}</div>
      <div className="text-[12px] font-medium text-slate-800 break-words">{v}</div>
    </div>
  )
}

export default function AtensiDesaWhatsAppPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  const [atensi, setAtensi] = useState<AtensiInfo | null>(null)
  const [rows, setRows] = useState<Row[]>([])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/atensi/${encodeURIComponent(id)}`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat data')

      setAtensi(json.atensi || null)
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
  }, [id])

  const totals = useMemo(() => {
    const rf = rows.reduce((acc, r) => acc + (r.Jlh_RF ?? 0), 0)
    const tl = rows.reduce((acc, r) => acc + (r.Jlh_TL ?? 0), 0)
    const pct = rf > 0 ? (tl / rf) * 100 : 0
    return { rf, tl, pct }
  }, [rows])

  async function handleWA(r: Row) {
    const url = buildWAUrl(r.HP_Kades, r.Pesan)
    if (!url) return alert('Nomor HP Kades tidak valid/kosong.')

    setSubmittingId(r.id)
    try {
      // ✅ 1) update status TL 2 -> 5 (sesuaikan endpoint kamu)
      const res = await fetch(`/api/atensi/${encodeURIComponent(id)}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desaId: r.id, fromStatus: 2, toStatus: 5 }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Gagal update status')

      // ✅ 2) reload biar badge berubah
      await load()

      // ✅ 3) buka WA
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e: any) {
      alert(e?.message || 'Gagal kirim WA')
    } finally {
      setSubmittingId(null)
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
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/redflags/atensi">
                <Button variant="outline" className="rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </Link>
              <Button variant="outline" className="rounded-xl" onClick={() => load()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            <h1 className="text-xl font-semibold mt-3 text-slate-900">Atensi • Desa</h1>
            <p className="text-sm text-slate-600">
              {atensi ? `Tahun ${atensi.Tahun} • Pemda ${atensi.Kd_Pemda}` : ''}
            </p>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5">
                Total RF: <b className="ml-1">{totals.rf}</b>
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5">
                Total TL: <b className="ml-1">{totals.tl}</b>
              </span>
              <span className="inline-flex items-center rounded-full bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-0.5">
                Persen TL: <b className="ml-1">{totals.pct.toFixed(2)}%</b>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
          Tidak ada data.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const pct = r.Persen ?? (r.Jlh_RF ? ((r.Jlh_TL ?? 0) / r.Jlh_RF) * 100 : 0)
            const msgPreview =
              (r.Pesan || '').length > 80 ? (r.Pesan || '').slice(0, 80) + '…' : r.Pesan || '-'

            return (
              <div
                key={r.id}
                className="mx-auto max-w-3xl rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* ===== TOP RINGKAS: max 3 baris ===== */}
                <div className="p-4">
                  {/* Baris 1: Nama + Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {r.Nama_Desa || '-'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{r.Kd_Desa}</div>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge v={r.StatusTL ?? null} />
                    </div>
                  </div>

                  {/* Baris 2: HP + RF/TL/% */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-slate-700">
                      HP: <b className="ml-1">{r.HP_Kades || '-'}</b>
                    </span>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-slate-700">
                      RF <b className="ml-1">{r.Jlh_RF ?? 0}</b>
                    </span>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-slate-700">
                      TL <b className="ml-1">{r.Jlh_TL ?? 0}</b>
                    </span>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-slate-700">
                      {Number.isFinite(pct) ? pct.toFixed(2) + '%' : '-'}
                    </span>
                  </div>

                  {/* Baris 3: preview pesan */}
                  <div className="mt-3 text-[12px] text-slate-600 flex gap-2">
                    <MessageCircle className="h-4 w-4 text-slate-400 mt-[2px] shrink-0" />
                    <div className="line-clamp-2">{msgPreview}</div>
                  </div>
                </div>

                {/* ===== DETAIL (MODEL TABEL) : tampilkan SEMUA DETAIL selain No_Atensi ===== */}
                <div className="px-4 pb-4">
                  <div className="rounded-xl border bg-slate-50/70 px-3 py-2">
                    <MiniRow k="No Urut" v={r.RowHandle} />
                    <div className="h-px bg-slate-200/70 my-1" />

                    <MiniRow k="Tahun" v={r.Tahun} />
                    <div className="h-px bg-slate-200/70 my-1" />

                    <MiniRow k="Kode Pemda" v={r.Kd_Pemda} />
                    <div className="h-px bg-slate-200/70 my-1" />

                    <MiniRow k="Kode Desa" v={r.Kd_Desa} />
                    <div className="h-px bg-slate-200/70 my-1" />

                    <MiniRow k="Nama Desa" v={r.Nama_Desa || '-'} />
                    <div className="h-px bg-slate-200/70 my-1" />

                    <MiniRow k="Red Flags" v={r.Jlh_RF ?? 0} />
                    <div className="h-px bg-slate-200/70 my-1" />

                    <MiniRow k="Tindak Lanjut" v={r.Jlh_TL ?? 0} />
                    <div className="h-px bg-slate-200/70 my-1" />

                    <MiniRow
                      k="Persentase"
                      v={Number.isFinite(pct) ? `${pct.toFixed(2)}%` : '-'}
                    />
                    <div className="h-px bg-slate-200/70 my-1" />

                    <MiniRow k="HP Kades" v={r.HP_Kades || '-'} />

                    {'update_at' in r && (
                      <>
                        <div className="h-px bg-slate-200/70 my-1" />
                        <MiniRow k="Update Terakhir" v={fmtDate(r.update_at)} />
                      </>
                    )}

                    <div className="h-px bg-slate-200/70 my-1" />
                    <MiniRow k="Pesan" v={r.Pesan || '-'} />
                  </div>
                </div>

                {/* ===== ACTIONS: tombol sama ukuran ===== */}
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/redflags/atensi/${id}/${r.id}`} className="w-full">
                      <Button
                        className="w-full h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white"
                      >
                        <Rows3 className="mr-2 h-4 w-4" />
                        Detail
                      </Button>
                    </Link>

                    <Button
                      onClick={() => handleWA(r)}
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={submittingId === r.id}
                      title="Update status (2→5) lalu buka WhatsApp"
                    >
                      <FaWhatsapp className="mr-2 h-4 w-4" />
                      {submittingId === r.id ? 'Proses…' : 'WA'}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}