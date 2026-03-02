// File: app/(dashboard)/dokumentasi/[id]/desa/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Menu, Search, AlertTriangle } from 'lucide-react'


import { useLayout } from '@/components/layouts/LayoutContext'
import { themes, ThemeKey } from '@/lib/themes'



type Atensi = {
  Tahun: string
  Kd_Pemda: string
  No_Atensi: string
  id: string
}

type DesaRow = {
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
  singkatanString: string | null
}

function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'warn' | 'dark'
}) {
  const cls =
    tone === 'dark'
      ? 'bg-slate-900 text-white'
      : tone === 'warn'
      ? 'bg-amber-100 text-amber-900'
      : 'bg-slate-200 text-slate-800'

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  )
}

// 🔥 Badge jenis dengan angka kecil tanpa kurung
function BadgeJenis({ label, count }: { label: string; count: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-xs font-semibold">
      {label}
      <span className="text-[10px] font-bold">{count}</span>
    </span>
  )
}

export default function DokumentasiAtensiDesaPage() {
  const params = useParams<{ id: string }>()
  const id = params.id


  const { layout, setLayout, theme, setTheme } = useLayout()
  const activeTheme = themes[theme as ThemeKey]


  const [loading, setLoading] = useState(true)
  const [atensi, setAtensi] = useState<Atensi | null>(null)
  const [rows, setRows] = useState<DesaRow[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/dokumentasi/${id}/desa`, { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Gagal memuat desa')

        setRows(json.data || [])
        setAtensi(json.atensi || null)
      } catch (e: any) {
        console.error(e)
        alert(e?.message || 'Gagal memuat desa')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => {
      const kd = (r.Kd_Desa || '').toLowerCase()
      const nm = (r.Nm_Desa || '').toLowerCase()
      return kd.includes(s) || nm.includes(s)
    })
  }, [rows, q])

  const totals = useMemo(() => {
    const totalDesa = filtered.length
    const totalRF = filtered.reduce((acc, r) => acc + (r.Jlh_RF ?? 0), 0)
    const totalTL = filtered.reduce((acc, r) => acc + (r.Jlh_TL ?? 0), 0)
    return { totalDesa, totalRF, totalTL }
  }, [filtered])

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Spinner />
        <span>Memuat...</span>
      </div>
    )
  }


  function BadgeJenis({
    label,
    count,
    index,
  }: {
    label: string
    count: string
    index: number
  }) {
    // 🎨 Palette warna cerah modern
    const palette = [
      'bg-sky-100 text-sky-700',
      'bg-emerald-100 text-emerald-700',
      'bg-violet-100 text-violet-700',
      'bg-pink-100 text-pink-700',
      'bg-amber-100 text-amber-700',
      'bg-cyan-100 text-cyan-700',
      'bg-fuchsia-100 text-fuchsia-700',
      'bg-lime-100 text-lime-700',
    ]
  
    const color = palette[index % palette.length]
  
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}
      >
        {label}
        <span className="text-[10px] font-bold">{count}</span>
      </span>
    )
  }

  
  return (
    <div className="space-y-5">

      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/redflags/dokumentasi">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Detail Desa</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            {atensi && (
              <>
                <span className="font-medium">Atensi {atensi.No_Atensi}</span> • Tahun {atensi.Tahun} • Pemda {atensi.Kd_Pemda}
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Pill tone="dark">{totals.totalDesa} desa</Pill>
            <Pill tone="warn">
              <AlertTriangle className="mr-1 h-3.5 w-3.5" />
              {totals.totalRF} redflags
            </Pill>
            <Pill>{totals.totalTL} TL</Pill>
          </div>
        </div>

        {/* Search */}
        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari kode/nama desa..."
              className="w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Tidak ada data desa.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className={`sticky top-0 ${activeTheme.tableHeader} ${activeTheme.text} shadow-sm`}>
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Kode Desa</th>
                    <th className="text-left px-4 py-3 font-semibold">Nama Desa</th>
                    <th className="text-center px-4 py-3 font-semibold">Redflags</th>
                    <th className="text-center px-4 py-3 font-semibold">Tindak Lanjut</th>
                    <th className="text-center px-4 py-3 font-semibold  ">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r, idx) => {
                    const zebra = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    const rf = r.Jlh_RF ?? 0

                    // 🔥 Pecah singkatanString menjadi badge terpisah
                    const badges =
                      r.singkatanString
                        ?.split(', ')
                        .map((item) => {
                          const match = item.match(/^(.+?)\s*\((\d+)\)$/)
                          if (!match) return null
                          return { label: match[1], count: match[2] }
                        })
                        .filter(Boolean) || []

                    return (
                      <tr key={r.id} className={`${zebra} hover:bg-slate-100/60`}>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {r.Kd_Desa}
                        </td>

                        <td className="px-4 py-3 text-slate-800">
                          <div className="font-medium">{r.Nm_Desa || '-'}</div>

                          {/* 🔥 Badge ditaruh dibawah nama desa */}
                          {badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                             {badges.map((b, i) =>
                                b ? (
                                  <BadgeJenis
                                    key={i}
                                    label={b.label}
                                    count={b.count}
                                    index={i}
                                  />
                                ) : null
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {rf > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-xs font-semibold">
                              <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                              {rf}
                            </span>
                          ) : (
                            <span className="text-slate-500">0</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                            {(r.Jlh_TL ?? 0) > 0 ? (
                              <span className="font-semibold text-slate-900">
                                {r.Jlh_TL}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-semibold">
                                Belum ada
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-right whitespace-nowrap w-[1%]">
                            <Link href={`/redflags/dokumentasi/${id}/desa/${r.id}`}>
                              <Button variant="default"
                                size="sm"
                                className="  text-white hover:bg-slate-800 "
                              >
                                <Menu className="mr-2 h-4 w-4" />
                                Detail
                              </Button>
                            </Link>
                          </td>
                      </tr>
                    )
                  })}
                </tbody>

                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900" colSpan={2}>
                      Total ({totals.totalDesa} desa)
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {totals.totalRF}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {totals.totalTL}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}