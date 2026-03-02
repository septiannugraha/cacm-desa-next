'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Menu } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'


import { useLayout } from '@/components/layouts/LayoutContext'
import { themes, ThemeKey } from '@/lib/themes'



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
  singkatanString: string | null
  StatusTL: number | null   // ← tambahkan ini
}

function safeWAPhone(raw: string | null) {
  if (!raw) return null
  let p = raw.replace(/[^\d]/g, '')
  if (p.startsWith('0')) p = '62' + p.slice(1)
  return p
}

function buildWAUrl(phone: string | null, message: string | null) {
  const p = safeWAPhone(phone)
  if (!p) return null
  const text = encodeURIComponent(message || '')
  return `https://wa.me/${p}?text=${text}`
}

function BadgeJenis({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-semibold">
      {text}
    </span>
  )
}

function parseSingkatan(text: string | null) {
  if (!text) return []

  return text.split(',').map((item) => {
    const match = item.trim().match(/(.+)\s+\((\d+)\)/)
    if (!match) return null

    return {
      label: match[1],
      count: match[2],
    }
  }).filter(Boolean) as { label: string; count: string }[]
}




export default function AtensiDesaPage() {
  const params = useParams<{ id: string }>()
  const id = params.id


  const { layout, setLayout, theme, setTheme } = useLayout()
const activeTheme = themes[theme as ThemeKey]


  const [loading, setLoading] = useState(true)
  const [atensi, setAtensi] = useState<AtensiInfo | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/atensi/${id}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error)
      setAtensi(json.atensi)
      setRows(json.data || [])
    } catch (e: any) {
      alert(e?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const totals = useMemo(() => {
    const rf = rows.reduce((a, r) => a + (r.Jlh_RF ?? 0), 0)
    const tl = rows.reduce((a, r) => a + (r.Jlh_TL ?? 0), 0)
    return { rf, tl }
  }, [rows])

  async function handleWA(r: Row) {
    const url = buildWAUrl(r.HP_Kades, r.Pesan)
    if (!url) return alert('Nomor HP tidak valid')
  
    setSubmittingId(r.id)
  
    
  
    try {
      // 🔹 Update StatusTL jadi 5
      await fetch('/api/atensi/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id })
      })
  
      // 🔹 Reload data
      await load()
    } catch (e) {
      alert('Gagal update status')
    }


  // 🔹 Buka WhatsApp
  window.open(url, '_blank')


    setSubmittingId(null)
  }


  
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
    const palette = [
      'bg-sky-100 text-sky-700',
      'bg-emerald-100 text-emerald-700',
      'bg-violet-100 text-violet-700',
      'bg-pink-100 text-pink-700',
      'bg-amber-100 text-amber-700',
      'bg-cyan-100 text-cyan-700',
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

      {/* HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link href="/redflags/atensi">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">
            Atensi {atensi?.No_Atensi}
          </h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Tahun {atensi?.Tahun} • Pemda {atensi?.Kd_Pemda}
        </p>

        <div className="flex gap-3 pt-2 text-sm">
          <span className="font-medium text-amber-600">
            Total RF: {totals.rf}
          </span>
          <span className="font-medium text-emerald-600">
            Total TL: {totals.tl}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Tidak ada data.
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
              <thead className={`sticky top-0 ${activeTheme.tableHeader} ${activeTheme.text} shadow-sm`}>
                  <tr>
                    <th className="px-4 py-3 text-left">Kode</th>
                    <th className="px-4 py-3 text-left">Nama Desa</th>
 
                    <th className="px-4 py-3 text-center">Redflags</th>
                    <th className="px-4 py-3 text-center">Tindak Lanjut</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">HP Kades</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">
                      Status WA
                    </th>
                    <th className="px-4 py-3 text-center w-[1%] whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {rows.map((r, idx) => {
                    const zebra = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    const tl = r.Jlh_TL ?? 0

                    return (
                      <tr key={r.id} className={`${zebra} hover:bg-slate-100`}>

                      {/* Kode */}
                      <td className="px-4 py-3 font-medium">
                        {r.Kd_Desa}
                      </td>
                    
                      {/* Nama */}
                      <td className="px-4 py-3">
                          <div className="font-medium">{r.Nama_Desa}</div>

                          {/* ✅ Singkatan pindah ke bawah nama */}
                          {r.singkatanString && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {parseSingkatan(r.singkatanString).map((b, i) => (
                                <BadgeJenis
                                  key={i}
                                  label={b.label}
                                  count={b.count}
                                  index={i}
                                />
                              ))}
                            </div>
                          )}
                        </td>
                     
                      {/* Redflags */}
                      <td className="px-4 py-3 text-center text-amber-600 font-semibold">
                        {r.Jlh_RF ?? 0}
                      </td>
                    
                      {/* Tindak Lanjut */}
                      <td className="px-4 py-3 text-center">
                        {(r.Jlh_TL ?? 0) > 0 ? (
                          <span className="font-semibold text-emerald-700">
                            {r.Jlh_TL}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-semibold">
                            Belum ada
                          </span>
                        )}
                      </td>
                    
                      {/* HP sebelum Aksi */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.HP_Kades ? (
                          <span className="text-slate-800 font-medium">
                            {r.HP_Kades}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-xs">
                            Tidak ada
                          </span>
                        )}
                      </td>
                    {/* ✅ Status Kirim WA */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {r.StatusTL === 5 ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">
                            Sudah Kirim
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-semibold">
                            Belum Kirim
                          </span>
                        )}
                      </td>
                      {/* Aksi */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex text-center gap-2">
                          <Link href={`/redflags/atensi/${id}/${r.id}`}>
                            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                              <Menu className="mr-2 h-4 w-4" />
                              Detail
                            </Button>
                          </Link>
                    
                          <Button
                            size="sm"
                            onClick={() => handleWA(r)}
                            disabled={submittingId === r.id}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <FaWhatsapp className="mr-2 h-4 w-4" />
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