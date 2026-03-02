'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Download, Edit } from 'lucide-react'

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
}

type StatusTLMaster = {
  StatusTL: number
  Keterangan: string | null
}

function fmtDate(v: string | null) {
  if (!v) return '-'
  const d = new Date(v)
  if (isNaN(d.getTime())) return v
  return d.toLocaleDateString('id-ID')
}

function fmtMoney(v: number | null) {
  if (v === null || v === undefined) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v)
}

export default function MobileResponDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [rinc, setRinc] = useState<Rinc | null>(null)
  const [statusMaster, setStatusMaster] = useState<StatusTLMaster[]>([])

  const [showForm, setShowForm] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [namaTL, setNamaTL] = useState('')
  const [komenTL, setKomenTL] = useState('')
  const [statusTL, setStatusTL] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(async () => {
      const res = await fetch(`/mobile/api/respon/${id}`, {
        cache: 'no-store',
        credentials: 'include',
      })

      const json = await res.json()

      if (!res.ok) {
        alert(json?.error || 'Gagal memuat data')
        return
      }

      setRinc(json.rinc)

      const filteredStatus =
        (json.statusTLList || []).filter((s: StatusTLMaster) =>
          [7, 8, 9].includes(s.StatusTL)
        )

      setStatusMaster(filteredStatus)

      if (json.rinc?.StatusVer !== 1) {
        setNamaTL(json.rinc?.NamaTL || '')
        setKomenTL(json.rinc?.KomenTL || '')
        setStatusTL(String(json.rinc?.StatusTL || ''))
      }

      setLoading(false)
    })()
  }, [id])

  async function kirimRespon() {
    if (!namaTL || !statusTL) {
      alert('Nama dan Status wajib diisi')
      return
    }

    const formData = new FormData()
    formData.append('namaTL', namaTL)
    formData.append('komenTL', komenTL)
    formData.append('statusTL', statusTL)
    if (file) formData.append('file', file)

    setProcessing(true)

    const res = await fetch(
      `/mobile/api/atensidesa/${id}/kirim-respon`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }
    )

    const json = await res.json()
    setProcessing(false)

    if (!res.ok) {
      alert(json?.error || 'Gagal kirim respon')
      return
    }

    alert('Respon berhasil disimpan')
    window.location.reload()
  }

  if (loading) return <div className="p-4">Memuat...</div>
  if (!rinc) return <div className="p-4">Data tidak ditemukan</div>

  const sudahRespon = rinc.StatusVer !== 1

  return (
    <div className="p-4 space-y-4">

      <Link href="/mobile/respon">
        <button className="px-3 py-2 border rounded-xl text-sm">
          Kembali
        </button>
      </Link>

      <div className="bg-white shadow-sm rounded-2xl p-4 space-y-3 mt-2">

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

        {/* ===== SUDAH RESPON ===== */}
        {sudahRespon && (
          <div className="border-t pt-4 space-y-2">

            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-green-700">
                Respon Telah Dikirim
              </div>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="text-xs px-3 py-1 rounded-md border bg-yellow-50 text-blue-700 hover:bg-yellow-200 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Ubah
              </button>
            </div>

            <div className="text-xs">
              <b>Nama:</b> {rinc.NamaTL || '-'}
            </div>

            <div className="text-xs">
              <b>Penjelasan:</b> {rinc.KomenTL || '-'}
            </div>

            {rinc.NamaFile && (
              <button
                type="button"
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
        )}

        {/* ===== BELUM RESPON ===== */}
        {!sudahRespon && (
          <div className="space-y-2 pt-3">
            <button className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm">
              Sudah diperbaiki di Siskeudes?, Cek hasilnya!
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-emerald-600 text-white py-2 rounded-xl text-sm"
            >
              Tidak dapat diperbaiki?, Input respon!
            </button>
          </div>
        )}

        {/* ===== FORM ===== */}
        {showForm && (
          <div className="border-t pt-4 space-y-3">

            <div>
              <label className="text-xs text-slate-500">
                Nama yang Menindaklanjuti
              </label>
              <input
                value={namaTL}
                onChange={(e) => setNamaTL(e.target.value)}
                className="w-full mt-1 border rounded-xl p-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500">
                Jenis Tindak Lanjut
              </label>
              <select
                value={statusTL}
                onChange={(e) => setStatusTL(e.target.value)}
                className="w-full mt-1 border rounded-xl p-2 text-sm"
              >
                <option value="">Pilih Jenis Tindak Lanjut</option>
                {statusMaster.map((s) => (
                  <option key={s.StatusTL} value={s.StatusTL}>
                    {s.Keterangan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500">
                Penjelasan Tindak Lanjut
              </label>
              <textarea
                value={komenTL}
                onChange={(e) => setKomenTL(e.target.value)}
                className="w-full mt-1 border rounded-xl p-2 text-sm"
                rows={3}
              />
            </div>

            <div>
              <input
                type="file"
                hidden
                ref={fileRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border rounded-xl py-2 text-sm"
              >
                {file ? file.name : 'Upload Bukti (Max 5MB)'}
              </button>
            </div>

            <div className="flex gap-2 pt-2">

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-1/2 bg-gray-200 text-gray-800 py-2 rounded-xl text-sm hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={kirimRespon}
                disabled={processing}
                className="w-1/2 bg-indigo-600 text-white py-2 rounded-xl text-sm"
              >
                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>

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