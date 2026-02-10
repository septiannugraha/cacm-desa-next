// File: app/(dashboard)/atensi/[id]/[desaId]/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, AlertTriangle, ChevronDown, FileText } from 'lucide-react'

type Atensi = { id: string; Tahun: string; Kd_Pemda: string; No_Atensi: string }

type Desa = {
  id: string
  id_Atensi: string
  Tahun: string
  Kd_Pemda: string
  No_Atensi: string
  Kd_Desa: string
  Nm_Desa: string | null
  Jlh_RF: number | null
  Jlh_TL: number | null
  StatusTL: number | null
  StatusVer: number | null
}

type RincRow = {
  id: string
  Jns_Atensi: number
  No_Bukti: string
  Tgl_Bukti: string | null
  Ket_Bukti: string | null

  Tgl_Std: string | null
  Tgl_Real: string | null
  Tgl_Dif: number | null

  Nilai_Std: number | null
  Nilai_Real: number | null
  Nilai_Prc: number | null
  Nilai_Dif: number | null

  isRedflag: boolean | null
  StatusTL: number | null
  StatusVer: number | null
  NamaFile: string | null
}

type JnsAtensiMeta = {
  Jns_Atensi: number
  Nama_Atensi: string | null
  Singkatan: string | null
  Tipe: number | null
  Satuan: string | null
  Std_Caption: string | null
  Real_Caption: string | null
  Dif_Caption: string | null
}

type StatusTLMaster = { StatusTL: number; Keterangan: string | null }
type StatusVerMaster = { StatusVer: number; Keterangan: string | null }

type ApiResponse = {
  atensi: Atensi
  desa: Desa
  rinc: RincRow[]
  jnsAtensi: JnsAtensiMeta[]
  statusTLList: StatusTLMaster[]
  statusVerList: StatusVerMaster[]
}

function fmtDate(iso: string | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtMoney(v: number | null) {
  if (v === null || v === undefined) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v)
}

function fmtNumber(v: number | null, digits = 2) {
  if (v === null || v === undefined) return '-'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits }).format(v)
}

// ✅ accumulator typed + initial value 0
function sum(nums: Array<number | null | undefined>): number {
  return nums.reduce<number>((acc, n) => acc + (typeof n === 'number' && !Number.isNaN(n) ? n : 0), 0)
}

function StatusBadge({
  label,
  variant = 'neutral',
}: {
  label: string
  variant?: 'success' | 'warning' | 'danger' | 'neutral'
}) {
  const cls =
    variant === 'success'
      ? 'bg-emerald-100 text-emerald-800'
      : variant === 'warning'
      ? 'bg-amber-100 text-amber-800'
      : variant === 'danger'
      ? 'bg-red-100 text-red-800'
      : 'bg-slate-200 text-slate-800'

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

function pickTLVariant(status: number): 'success' | 'warning' | 'danger' | 'neutral' {
  // default heuristic; sesuaikan jika punya mapping khusus
  if (status === 1) return 'success'
  if (status === 2) return 'warning'
  if (status === 3) return 'danger'
  return 'neutral'
}

function pickVerVariant(status: number): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  if (status === 3) return 'warning'
  return 'neutral'
}

export default function AtensiDesaDetailPage() {
  const params = useParams<{ id: string; desaId: string }>()
  const { id, desaId } = params

  const [loading, setLoading] = useState(true)
  const [atensi, setAtensi] = useState<Atensi | null>(null)
  const [desa, setDesa] = useState<Desa | null>(null)
  const [rinc, setRinc] = useState<RincRow[]>([])
  const [meta, setMeta] = useState<JnsAtensiMeta[]>([])
  const [statusTLList, setStatusTLList] = useState<StatusTLMaster[]>([])
  const [statusVerList, setStatusVerList] = useState<StatusVerMaster[]>([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/atensi/${id}/${desaId}`, { cache: 'no-store' })
        const json = (await res.json()) as Partial<ApiResponse> & { error?: string }
        if (!res.ok) throw new Error(json?.error || 'Gagal memuat detail')

        setAtensi((json.atensi as Atensi) || null)
        setDesa((json.desa as Desa) || null)
        setRinc((json.rinc as RincRow[]) || [])
        setMeta((json.jnsAtensi as JnsAtensiMeta[]) || [])
        setStatusTLList((json.statusTLList as StatusTLMaster[]) || [])
        setStatusVerList((json.statusVerList as StatusVerMaster[]) || [])
      } catch (e: any) {
        console.error(e)
        alert(e?.message || 'Gagal memuat detail')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, desaId])

  const metaMap = useMemo(() => {
    const m = new Map<number, JnsAtensiMeta>()
    meta.forEach((x) => m.set(x.Jns_Atensi, x))
    return m
  }, [meta])

  const statusTLMap = useMemo(() => {
    const m = new Map<number, string>()
    statusTLList.forEach((x) => {
      if (x.Keterangan) m.set(x.StatusTL, x.Keterangan)
    })
    return m
  }, [statusTLList])

  const statusVerMap = useMemo(() => {
    const m = new Map<number, string>()
    statusVerList.forEach((x) => {
      if (x.Keterangan) m.set(x.StatusVer, x.Keterangan)
    })
    return m
  }, [statusVerList])

  const grouped = useMemo(() => {
    const map = new Map<number, RincRow[]>()
    for (const r of rinc) {
      if (!map.has(r.Jns_Atensi)) map.set(r.Jns_Atensi, [])
      map.get(r.Jns_Atensi)!.push(r)
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0])
  }, [rinc])

  const summaryCards = useMemo(() => {
    if (!desa) return []
    return [
      { label: 'Jlh_RF', value: desa.Jlh_RF ?? '-' },
      { label: 'Jlh_TL', value: desa.Jlh_TL ?? '-' },
      {
        label: 'StatusTL',
        value:
          desa.StatusTL !== null ? statusTLMap.get(desa.StatusTL) || `Status ${desa.StatusTL}` : '-',
      },
      {
        label: 'StatusVer',
        value:
          desa.StatusVer !== null
            ? statusVerMap.get(desa.StatusVer) || `Status ${desa.StatusVer}`
            : '-',
      },
    ]
  }, [desa, statusTLMap, statusVerMap])

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Spinner />
        <span>Memuat...</span>
      </div>
    )
  }

  if (!desa || !atensi) {
    return <div className="p-6">Data tidak ditemukan.</div>
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/redflags/atensi/${id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>

          <h1 className="text-xl font-semibold mt-3">Detail Desa</h1>
          <p className="text-sm text-muted-foreground">
            Atensi <span className="font-medium">{atensi.No_Atensi}</span> • Desa{' '}
            <span className="font-medium">{desa.Kd_Desa}</span>
            {desa.Nm_Desa ? ` — ${desa.Nm_Desa}` : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            Tahun {atensi.Tahun} • Pemda {atensi.Kd_Pemda}
          </p>
        </div>
      </div>

      {/* Ringkasan */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summaryCards.map((s) => (
              <div key={s.label} className="rounded-xl border bg-white p-3 shadow-sm">
                <div className="text-xs text-slate-500">{s.label}</div>
                <div className="text-base font-semibold text-slate-900">{s.value as any}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections per Jenis Atensi */}
      <div className="space-y-3">
        {grouped.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Tidak ada rincian.</CardContent>
          </Card>
        ) : (
          grouped.map(([jns, items], idx) => {
            const m = metaMap.get(jns)
            const tipe = m?.Tipe ?? 3

            const title =
              (m?.Nama_Atensi ? m.Nama_Atensi : `Jenis Atensi ${jns}`) +
              (m?.Singkatan ? ` (${m.Singkatan})` : '')

            const stdCap = m?.Std_Caption || 'Standar'
            const realCap = m?.Real_Caption || 'Realisasi'
            const difCap = m?.Dif_Caption || 'Selisih'
            const satuan = m?.Satuan || ''

            const redflagCount = items.filter((x) => x.isRedflag).length

            // ✅ subtotal aman TS: pisah days & money
            const subtotalDays = tipe === 1 ? sum(items.map((x) => x.Tgl_Dif)) : null
            const subtotalMoney =
              tipe === 1
                ? null
                : tipe === 2
                ? {
                    std: sum(items.map((x) => x.Nilai_Std)),
                    real: sum(items.map((x) => x.Nilai_Real)),
                    dif: sum(items.map((x) => x.Nilai_Prc)),
                  }
                : {
                    std: sum(items.map((x) => x.Nilai_Std)),
                    real: sum(items.map((x) => x.Nilai_Real)),
                    dif: sum(items.map((x) => x.Nilai_Dif)),
                  }

            return (
              <details
                key={jns}
                className="group rounded-2xl border bg-white shadow-sm overflow-hidden"
                open={idx === 0}
              >
                <summary className="cursor-pointer list-none select-none">
                  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-900 text-white text-xs px-2 py-0.5">
                          JNS {jns}
                        </span>

                        {redflagCount > 0 && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 text-xs px-2 py-0.5">
                            <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                            {redflagCount} redflag
                          </span>
                        )}
                      </div>

                      <div className="mt-1 font-semibold text-slate-900 truncate">{title}</div>
                      <div className="text-xs text-slate-500">
                        Tipe: {tipe} {satuan ? `• Satuan: ${satuan}` : ''}
                      </div>
                    </div>

                    <ChevronDown className="h-5 w-5 text-slate-500 transition-transform duration-200 group-open:rotate-180" />
                  </div>
                </summary>

                <div className="p-4">
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">No Bukti</th>
                          <th className="px-4 py-3 text-left font-semibold">Tgl Bukti</th>
                          <th className="px-4 py-3 text-left font-semibold">Keterangan</th>

                          <th className="px-4 py-3 text-right font-semibold">{stdCap}</th>
                          <th className="px-4 py-3 text-right font-semibold">{realCap}</th>
                          <th className="px-4 py-3 text-right font-semibold">{difCap}</th>

                          <th className="px-4 py-3 text-center font-semibold">Redflag</th>
                          <th className="px-4 py-3 text-center font-semibold">Status TL</th>
                          <th className="px-4 py-3 text-center font-semibold">Status Ver</th>
                          <th className="px-4 py-3 text-left font-semibold">File</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {items.map((r, i) => {
                          const zebra = i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                          const red = r.isRedflag ? 'bg-amber-50' : ''
                          return (
                            <tr key={r.id} className={`${zebra} ${red} hover:bg-slate-100/60`}>
                              <td className="px-4 py-3 font-medium text-slate-900">{r.No_Bukti}</td>
                              <td className="px-4 py-3 text-slate-700">{fmtDate(r.Tgl_Bukti)}</td>
                              <td className="px-4 py-3 text-slate-700">{r.Ket_Bukti || '-'}</td>

                              {tipe === 1 ? (
                                <>
                                  <td className="px-4 py-3 text-right text-slate-800">{fmtDate(r.Tgl_Std)}</td>
                                  <td className="px-4 py-3 text-right text-slate-800">{fmtDate(r.Tgl_Real)}</td>
                                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                    {r.Tgl_Dif ?? '-'}
                                  </td>
                                </>
                              ) : tipe === 2 ? (
                                <>
                                  <td className="px-4 py-3 text-right text-slate-800">{fmtMoney(r.Nilai_Std)}</td>
                                  <td className="px-4 py-3 text-right text-slate-800">{fmtMoney(r.Nilai_Real)}</td>
                                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                    {fmtNumber(r.Nilai_Prc, 2)}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3 text-right text-slate-800">{fmtMoney(r.Nilai_Std)}</td>
                                  <td className="px-4 py-3 text-right text-slate-800">{fmtMoney(r.Nilai_Real)}</td>
                                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                    {fmtMoney(r.Nilai_Dif)}
                                  </td>
                                </>
                              )}

                              <td className="px-4 py-3 text-center">
                                {r.isRedflag ? (
                                  <StatusBadge label="Ya" variant="warning" />
                                ) : (
                                  <StatusBadge label="Tidak" variant="neutral" />
                                )}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {r.StatusTL !== null ? (
                                  <StatusBadge
                                    label={statusTLMap.get(r.StatusTL) || `Status ${r.StatusTL}`}
                                    variant={pickTLVariant(r.StatusTL)}
                                  />
                                ) : (
                                  '-'
                                )}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {r.StatusVer !== null ? (
                                  <StatusBadge
                                    label={statusVerMap.get(r.StatusVer) || `Status ${r.StatusVer}`}
                                    variant={pickVerVariant(r.StatusVer)}
                                  />
                                ) : (
                                  '-'
                                )}
                              </td>

                              <td className="px-4 py-3 text-slate-700">
                                {r.NamaFile ? (
                                  <span className="inline-flex items-center text-xs">
                                    <FileText className="mr-2 h-4 w-4" />
                                    {r.NamaFile}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>

                      <tfoot className="bg-slate-50">
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-900" colSpan={3}>
                            Subtotal ({items.length} baris)
                          </td>

                          {tipe === 1 ? (
                            <>
                              <td className="px-4 py-3 text-right text-slate-600">-</td>
                              <td className="px-4 py-3 text-right text-slate-600">-</td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                {subtotalDays ?? 0}{' '}
                                <span className="text-xs font-normal text-slate-600">(hari)</span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                {fmtMoney(subtotalMoney?.std ?? 0)}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                {fmtMoney(subtotalMoney?.real ?? 0)}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                {tipe === 2
                                  ? fmtNumber(subtotalMoney?.dif ?? 0, 2)
                                  : fmtMoney(subtotalMoney?.dif ?? 0)}
                              </td>
                            </>
                          )}

                          <td className="px-4 py-3 text-center text-slate-600" colSpan={4}>
                            {redflagCount > 0 ? `${redflagCount} redflag` : '—'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </details>
            )
          })
        )}
      </div>
    </div>
  )
}
