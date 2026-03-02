'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Download } from 'lucide-react'

type HistoryItem = {
  Username: string
  StatusTL: string
  StatusVer: string
  Timestamp: string
}

type Rinc = {
  id: string
  No_Bukti: string
  Tgl_Bukti: string | null
  Ket_Bukti: string | null
  Nilai_Std: number | null
  Nilai_Real: number | null
  Nilai_Dif: number | null
  NamaFile: string | null
  NamaTL: string | null
  KomenTL: string | null
  StatusTL: number | null
  StatusVer: number | null
  HistoryAtensi: string | null
}

function fmtDate(v: string | null) {
  if (!v) return '-'
  return new Date(v).toLocaleDateString('id-ID')
}

function fmtMoney(v: number | null) {
  if (v == null) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v)
}

function parseHistory(json: string | null): HistoryItem[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function MobileSelesaiDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [rinc, setRinc] = useState<Rinc | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await fetch(`/mobile/api/selesai/${id}`, {
        cache: 'no-store',
        credentials: 'include',
      })

      const json = await res.json()

      if (!res.ok) {
        alert(json?.error || 'Gagal memuat data')
        return
      }

      setRinc(json.rinc)
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="p-4">Memuat...</div>
  if (!rinc) return <div className="p-4">Data tidak ditemukan</div>

  const history = parseHistory(rinc.HistoryAtensi)

  return (
    <div className="p-4 space-y-4">

      <Link href="/mobile/selesai">
        <button className="px-3 py-2 border rounded-xl text-sm">
          Kembali
        </button>
      </Link>

      <div className="bg-white shadow-sm rounded-2xl p-4 space-y-3">

        <div className="text-sm font-semibold">
          No Bukti: {rinc.No_Bukti}
        </div>

        <div className="text-xs text-slate-600">
          {fmtDate(rinc.Tgl_Bukti)} • {rinc.Ket_Bukti}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Value label="Standar" value={fmtMoney(rinc.Nilai_Std)} />
          <Value label="Realisasi" value={fmtMoney(rinc.Nilai_Real)} />
          <Value label="Selisih" value={fmtMoney(rinc.Nilai_Dif)} />
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="text-sm font-semibold text-emerald-700">
            Respon Tindak Lanjut
          </div>

          <div className="text-xs">
            <b>Nama:</b> {rinc.NamaTL || '-'}
          </div>

          <div className="text-xs">
            <b>Penjelasan:</b> {rinc.KomenTL || '-'}
          </div>

          {rinc.NamaFile && (
            <button
              onClick={() =>
                window.open(`/mobile/api/file/${rinc.NamaFile}`, '_blank')
              }
              className="text-xs px-3 py-1 rounded-md border bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Bukti
            </button>
          )}
        </div>

        {/* ===== HISTORY ===== */}
        <div className="pt-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs px-3 py-1 rounded-md border bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {showHistory ? 'Tutup History' : 'Lihat History Tahapan'}
          </button>
        </div>

        {showHistory && (
          <div className="mt-4 border-t pt-4">
            <div className="text-sm font-semibold mb-4">
              Riwayat Tahapan Proses
            </div>

            <div className="relative pl-6 space-y-6">
              {history.map((h, i) => (
                <div key={i} className="relative">

                  {i !== history.length - 1 && (
                    <div className="absolute left-2 top-5 w-[2px] h-full bg-slate-200"></div>
                  )}

                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow"></div>

                  <div className="bg-slate-50 rounded-xl p-3 ml-4 space-y-1">
                    <div className="text-xs font-semibold text-slate-800">
                      {h.StatusTL}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Verifikasi: {h.StatusVer}
                    </div>

                    <div className="text-[11px] text-slate-600">
                      Oleh: {h.Username}
                    </div>

                    <div className="text-[10px] text-slate-400">
                      {new Date(h.Timestamp).toLocaleString('id-ID')}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function Value({ label, value }: any) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}