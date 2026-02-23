'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronDown, AlertTriangle, FileText } from 'lucide-react'
import StatusBadge from '@/app/mobile/(mobile)/components/ui/StatusBadge'
import { fmtDate, fmtMoney, fmtNumber, sum } from '@/app/mobile/(mobile)/components/helpers'

type Desa = {
  id: string
  Tahun: string
  Kd_Pemda: string
  No_Atensi: string
  Kd_Desa: string
  Jlh_RF: number | null
  Jlh_TL: number | null
  StatusTL: number | null
  StatusVer: number | null
}

type Rinc = {
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

export default function MobileAtensiDetailPage() {
  const { atensiDesaId } = useParams<{ atensiDesaId: string }>()
  const [loading, setLoading] = useState(true)
  const [desa, setDesa] = useState<Desa | null>(null)
  const [rinc, setRinc] = useState<Rinc[]>([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const res = await fetch(`/api/atensi/${atensiDesaId}`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(json?.error || 'Gagal memuat detail')
        setLoading(false)
        return
      }
      setDesa(json.desa)
      setRinc(json.rinc || [])
      setLoading(false)
    })()
  }, [atensiDesaId])

  const grouped = useMemo(() => {
    const map = new Map<number, Rinc[]>()
    for (const r of rinc) {
      if (!map.has(r.Jns_Atensi)) map.set(r.Jns_Atensi, [])
      map.get(r.Jns_Atensi)!.push(r)
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0])
  }, [rinc])

  if (loading) return <div className="text-sm text-slate-600">Memuat...</div>
  if (!desa) return <div className="text-sm text-slate-600">Data tidak ditemukan.</div>

  const summary = [
    { label: 'RF', value: desa.Jlh_RF ?? '-' },
    { label: 'TL', value: desa.Jlh_TL ?? '-' },
    { label: 'Status TL', value: desa.StatusTL ?? '-' },
    { label: 'Status Ver', value: desa.StatusVer ?? '-' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link href="/mobile/atensi">
          <Button variant="outline" className="rounded-xl">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <div className="text-sm font-semibold">Detail Atensi</div>
          <div className="text-xs text-slate-500 mt-1">
            No Atensi <b>{desa.No_Atensi}</b> • Tahun {desa.Tahun} • Pemda {desa.Kd_Pemda}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {summary.map((s) => (
              <div key={s.label} className="rounded-xl border bg-white p-3">
                <div className="text-[11px] text-slate-500">{s.label}</div>
                <div className="text-sm font-semibold">{s.value as any}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {grouped.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 text-sm text-slate-500">Tidak ada rincian.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {grouped.map(([jns, items], idx) => {
            const redflagCount = items.filter((x) => x.isRedflag).length
            const subtotalStd = sum(items.map((x) => x.Nilai_Std))
            const subtotalReal = sum(items.map((x) => x.Nilai_Real))
            const subtotalDif = sum(items.map((x) => x.Nilai_Dif))

            return (
              <details
                key={jns}
                className="group rounded-2xl border bg-white shadow-sm overflow-hidden"
                open={idx === 0}
              >
                <summary className="cursor-pointer list-none select-none">
                  <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-full bg-slate-900 text-white text-[11px] px-2 py-0.5">
                          JNS {jns}
                        </span>
                        {redflagCount > 0 && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 text-[11px] px-2 py-0.5">
                            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                            {redflagCount} redflag
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold mt-1 truncate">Rincian Jenis Atensi</div>
                      <div className="text-[11px] text-slate-500">Subtotal otomatis (ringkas)</div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-slate-500 transition-transform duration-200 group-open:rotate-180" />
                  </div>
                </summary>

                <div className="p-3 space-y-2">
                  {items.map((r) => (
                    <Link key={r.id} href={`/mobile/respon/${r.id}`}>
                      <div className="rounded-2xl border bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{r.No_Bukti}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {fmtDate(r.Tgl_Bukti)} • {r.Ket_Bukti || '-'}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 mt-0.5" />
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="rounded-xl bg-slate-50 p-2">
                            <div className="text-[10px] text-slate-500">Standar</div>
                            <div className="text-xs font-semibold">{fmtMoney(r.Nilai_Std)}</div>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2">
                            <div className="text-[10px] text-slate-500">Realisasi</div>
                            <div className="text-xs font-semibold">{fmtMoney(r.Nilai_Real)}</div>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2">
                            <div className="text-[10px] text-slate-500">Selisih</div>
                            <div className="text-xs font-semibold">{fmtMoney(r.Nilai_Dif)}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-2">
                            <StatusBadge label={r.isRedflag ? 'Redflag' : 'Normal'} variant={r.isRedflag ? 'warning' : 'neutral'} />
                            <StatusBadge label={`TL ${r.StatusTL ?? '-'}`} />
                            <StatusBadge label={`Ver ${r.StatusVer ?? '-'}`} />
                          </div>
                          {r.NamaFile ? (
                            <span className="inline-flex items-center text-[11px] text-slate-600">
                              <FileText className="h-4 w-4 mr-1" />
                              Ada file
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  <div className="rounded-2xl border bg-slate-50 p-3 text-xs">
                    <div className="font-semibold">Subtotal ({items.length} baris)</div>
                    <div className="text-slate-600 mt-1">
                      Std: <b>{fmtMoney(subtotalStd)}</b> • Real: <b>{fmtMoney(subtotalReal)}</b> • Dif:{' '}
                      <b>{fmtMoney(subtotalDif)}</b>
                    </div>
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      )}
    </div>
  )
}
