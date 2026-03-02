'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RefreshCw, ChevronRight } from 'lucide-react'
import { useMobileBreadcrumb } from '@/app/mobile/(mobile)/components/MobileNavContext'
import { fmtDate, fmtMoney } from '@/app/mobile/(mobile)/components/helpers'

type Row = {
  id: string
  Tahun: string
  No_Atensi: string
  No_Bukti: string
  Tgl_Bukti: string | null
  Ket_Bukti: string | null
  Nilai_Dif: number | null
  Nilai_Real: number | null
  StatusTL: number
  StatusVer: number
}

export default function MobileSelesaiPage() {
  useMobileBreadcrumb(
    [
      { label: 'Home', href: '/mobile/home' },
      { label: 'Selesai' },
    ],
    'Selesai'
  )

  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Row[]>([])
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/mobile/api/selesai', {
        cache: 'no-store',
        credentials: 'include',
      })

      if (res.status === 401) {
        router.replace(
          `/mobile/login-desa?from=${encodeURIComponent(
            '/mobile/selesai'
          )}`
        )
        return
      }

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(json?.error || 'Gagal memuat data')
        return
      }

      setData(json.rinc || [])
    } finally {
      setLoading(false)
    }
  }

  async function refreshData() {
    setRefreshing(true)
    try {
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line
  }, [])

  function renderStatusTL(status: number) {
    const map: Record<number, string> = {
      6: 'Proses Verifikasi',
      7: 'Selesai',
      8: 'Disetujui',
      9: 'Final',
    }

    return (
      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-700">
        {map[status] || `Status ${status}`}
      </span>
    )
  }

  function renderStatusVer(status: number) {
    const map: Record<number, string> = {
      4: 'Verifikasi Kabupaten',
      5: 'Verifikasi Final',
    }

    return (
      <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700">
        {map[status] || `Ver ${status}`}
      </span>
    )
  }

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold">Daftar Bukti Selesai</div>
          <div className="text-xs text-slate-500">
            Rincian atensi yang telah selesai dan terverifikasi.
          </div>
        </div>

        <button
          onClick={refreshData}
          disabled={refreshing}
          className="
            inline-flex items-center justify-center
            rounded-xl
            px-3 py-2
            text-sm font-medium
            bg-blue-600 text-white
            hover:bg-blue-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-sm text-slate-600">Memuat...</div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
          Tidak ada data selesai.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <Link key={r.id} href={`/mobile/selesai/${r.id}`}>
              <div className="rounded-2xl bg-white shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 transition">

                <div className="min-w-0 space-y-1">

                  {/* No Bukti */}
                  <div className="text-sm font-semibold truncate">
                    {r.No_Bukti}
                  </div>

                  {/* Tanggal + Atensi */}
                  <div className="text-xs text-slate-500">
                    {fmtDate(r.Tgl_Bukti)} • Atensi {r.No_Atensi}
                  </div>

                  {/* Keterangan */}
                  <div className="text-xs text-slate-600 line-clamp-2">
                    {r.Ket_Bukti || '-'}
                  </div>

                  {/* Nilai */}
                  <div className="text-xs font-semibold text-slate-900">
                    Nilai: {fmtMoney(r.Nilai_Dif ?? r.Nilai_Real)}
                  </div>

                  {/* Status */}
                  <div className="flex gap-2 pt-1">
                    {renderStatusTL(r.StatusTL)}
                    {renderStatusVer(r.StatusVer)}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}