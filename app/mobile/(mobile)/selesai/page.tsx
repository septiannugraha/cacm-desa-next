'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import StatusBadge from '@/app/mobile/(mobile)/components/ui/StatusBadge'
import { fmtDate, fmtMoney } from '@/app/mobile/(mobile)/components/helpers'

type Row = {
  id: string
  No_Atensi: string
  No_Bukti: string
  Tgl_Bukti: string | null
  Ket_Bukti: string | null
  Nilai_Dif: number | null
  StatusTL: number | null
  StatusVer: number | null
}

export default function MobileSelesaiPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Row[]>([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const res = await fetch('/api/mobile/selesai/list', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      setLoading(false)
      if (!res.ok) return alert(json?.error || 'Gagal memuat')
      setData(json.data || [])
    })()
  }, [])

  return (
    <div className="space-y-3">
      <div>
        <div className="text-base font-semibold">Selesai (StatusTL = 6/7)</div>
        <div className="text-xs text-slate-500">Menampilkan rincian + status verifikasi.</div>
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
            <div key={r.id} className="rounded-2xl bg-white border shadow-sm p-4">
              <div className="text-sm font-semibold">Atensi {r.No_Atensi}</div>
              <div className="text-xs text-slate-500 mt-1">
                {r.No_Bukti} • {fmtDate(r.Tgl_Bukti)} • {r.Ket_Bukti || '-'}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-slate-700">
                  Selisih: <b>{fmtMoney(r.Nilai_Dif)}</b>
                </div>
                <div className="flex gap-2">
                  <StatusBadge label={`TL ${r.StatusTL ?? '-'}`} variant="success" />
                  <StatusBadge label={`Ver ${r.StatusVer ?? '-'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
