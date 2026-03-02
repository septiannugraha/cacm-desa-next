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
}

export default function MobileResponListPage() {
  useMobileBreadcrumb(
    [
      { label: 'Home', href: '/mobile/home' },
      { label: 'Respon' },
    ],
    'Respon'
  )

  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Row[]>([])
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/mobile/api/respon', {
        cache: 'no-store',
        credentials: 'include',
      })

      if (res.status === 401) {
        router.replace(
          `/mobile/login-desa?from=${encodeURIComponent(
            '/mobile/respon'
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

  async function refreshTL() {
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

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold">Daftar Nomor Bukti</div>
          <div className="text-xs text-slate-500">
            Rincian bukti atensi desa.
          </div>
        </div>

        <button
          onClick={refreshTL}
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
          Tidak ada data.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <Link key={r.id} href={`/mobile/respon/${r.id}`}>
              <div className="rounded-2xl bg-white shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 transition mb-2">

                <div className="min-w-0 space-y-1">
                  {/* No Bukti */}
                  <div className="text-sm font-semibold truncate">
                    {r.No_Bukti}
                  </div>

                  {/* Tanggal + No Atensi */}
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