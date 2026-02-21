'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, ChevronRight } from 'lucide-react'

type Row = {
  id: string
  Tahun: string
  Kd_Pemda: string
  No_Atensi: string
  Kd_Desa: string
  Jlh_RF: number | null
  Jlh_TL: number | null
  StatusTL: number | null
  StatusVer: number | null
  update_at: string | null
}

export default function MobileAtensiListPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Row[]>([])
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/mobile/atensi/list', { cache: 'no-store' })
    const json = await res.json()
    if (!res.ok) {
      alert(json?.error || 'Gagal memuat atensi')
      setLoading(false)
      return
    }
    setData(json.data || [])
    setLoading(false)
  }

  async function refreshTL() {
    setRefreshing(true)
    const res = await fetch('/api/mobile/atensi/refresh-tl', { method: 'POST' })
    const json = await res.json().catch(() => ({}))
    setRefreshing(false)

    if (!res.ok) {
      alert(json?.error || 'Gagal refresh TL')
      return
    }
    await load()
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold">Atensi (StatusTL = 5)</div>
          <div className="text-xs text-slate-500">Daftar atensi desa yang perlu ditindaklanjuti.</div>
        </div>

        <Button className="rounded-xl" onClick={refreshTL} disabled={refreshing}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {refreshing ? 'Refreshing...' : 'Refresh TL'}
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-600">Memuat...</div>
      ) : data.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 text-sm text-slate-500">Tidak ada data.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map((r) => (
            <Link key={r.id} href={`/mobile/atensi/${r.id}`}>
              <div className="rounded-2xl bg-white border shadow-sm p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">No Atensi: {r.No_Atensi}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Tahun {r.Tahun} • Pemda {r.Kd_Pemda}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    RF: {r.Jlh_RF ?? '-'} • TL: {r.Jlh_TL ?? '-'} • Ver: {r.StatusVer ?? '-'}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
