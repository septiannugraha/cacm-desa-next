'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ArrowLeft, History, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

/* ================= TYPES ================= */

type Row = {
  id: string
  Nama_Desa: string
  Nama_Atensi: string
  No_Bukti: string
  Tgl_Bukti: string | null
  Ket_Bukti: string | null
  Nilai_Std: number | null
  Nilai_Real: number | null
  Nilai_Dif: number | null
  NamaFile: string | null
  HistoryAtensi: string | null
}

type HistoryItem = {
  Username: string
  StatusTL: string
  StatusVer: string
  Timestamp: string
}

/* ================= HELPERS ================= */

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
    return JSON.parse(json)
  } catch {
    return []
  }
}

/* ================= PAGE ================= */

export default function VerifikasiPage() {
  const [data, setData] = useState<Row[]>([])
  const [selected, setSelected] = useState<Row | null>(null)

  const [previewFile, setPreviewFile] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [namaVer, setNamaVer] = useState('')
  const [komenVer, setKomenVer] = useState('')
  const [statusVer, setStatusVer] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const res = await fetch('/api/verifikasi', { cache: 'no-store' })
    const json = await res.json()
    setData(json.data || [])
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>()
    data.forEach(d => {
      if (!map.has(d.Nama_Desa)) map.set(d.Nama_Desa, [])
      map.get(d.Nama_Desa)!.push(d)
    })
    return Array.from(map.entries())
  }, [data])

  const history = parseHistory(selected?.HistoryAtensi ?? null)

  async function kirimVerifikasi() {
    await fetch('/api/verifikasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selected?.id,
        namaVer,
        komenVer,
        statusVer: Number(statusVer),
      }),
    })

    setShowForm(false)
    setNamaVer('')
    setKomenVer('')
    setStatusVer('')
    load()
  }

  return (
    <div className="p-2 space-y-2">

      {/* HEADER */}
      <div>
 
        <h1 className="text-2xl font-bold mt-4 text-blue-900">
          Verifikasi Tindak Lanjut
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-8">

        {/* LEFT LIST (SCROLLABLE) */}
        <div className="max-h-[75vh] overflow-y-auto space-y-6 pr-2">
          {grouped.map(([desa, items]) => (
            <Card key={desa}>
              <CardHeader>
                <CardTitle>{desa}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelected(r)
                      setShowForm(false)
                    }}
                    className={`p-3 rounded-lg border cursor-pointer ${
                      selected?.id === r.id
                        ? 'bg-blue-50 border-blue-400'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-sm">
                      {r.No_Bukti}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.Nama_Atensi}
                    </div>
                    <div className="text-xs text-gray-400">
                      {fmtDate(r.Tgl_Bukti)} • {r.Ket_Bukti}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RIGHT DETAIL CARD (AUTO HEIGHT) */}
        <div>
          {!selected ? (
            <Card>
              <CardContent>
                Pilih dokumen untuk melihat detail.
              </CardContent>
            </Card>
          ) : (
            <Card>

              <CardHeader>
                <CardTitle>
                  {selected.Nama_Atensi}
                </CardTitle>
                <CardDescription>
                  No Bukti: {selected.No_Bukti}
                </CardDescription>
                <CardDescription>
                  {fmtDate(selected.Tgl_Bukti)} • {selected.Ket_Bukti}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                {/* NILAI */}
                <div className="grid grid-cols-3 gap-4">
                  <Value label="Standar" value={fmtMoney(selected.Nilai_Std)} />
                  <Value label="Realisasi" value={fmtMoney(selected.Nilai_Real)} />
                  <Value label="Selisih" value={fmtMoney(selected.Nilai_Dif)} />
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 flex-wrap">
                  {selected.NamaFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewFile(selected.NamaFile)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Lihat Bukti
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(true)}
                  >
                    <History className="mr-2 h-4 w-4" />
                    Lihat History
                  </Button>

                  <Button size="sm" onClick={() => setShowForm(true)}>
                    Input Verifikasi
                  </Button>
                </div>

                {/* ANIMATED FORM */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t pt-4 space-y-3"
                    >
                      <input
                        placeholder="Nama Verifikator"
                        value={namaVer}
                        onChange={e => setNamaVer(e.target.value)}
                        className="w-full border rounded-lg p-2"
                      />

                      <textarea
                        placeholder="Komen Verifikasi"
                        value={komenVer}
                        onChange={e => setKomenVer(e.target.value)}
                        className="w-full border rounded-lg p-2"
                        rows={3}
                      />

                      <select
                        value={statusVer}
                        onChange={e => setStatusVer(e.target.value)}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="">Pilih Status</option>
                        <option value="4">Perlu Perbaikan</option>
                        <option value="5">Disetujui</option>
                      </select>

                      <div className="flex gap-2">
                        <Button onClick={kirimVerifikasi}>Kirim</Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </CardContent>
            </Card>
          )}
        </div>

      </div>

      {/* FILE MODAL */}
      {previewFile && (
        <Modal onClose={() => setPreviewFile(null)}>
          <iframe
            src={`/api/file/${previewFile}/lihat`}
            className="w-full h-full"
          />
        </Modal>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <Modal onClose={() => setShowHistory(false)}>
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Riwayat Proses</h3>
            {history.map((h, i) => (
              <div key={i} className="border-l-2 border-blue-400 pl-4">
                <div className="text-sm font-semibold">{h.StatusTL}</div>
                <div className="text-xs text-gray-600">
                  {h.Username} • {new Date(h.Timestamp).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

    </div>
  )
}

/* ================= COMPONENTS ================= */

function Value({ label, value }: any) {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}

function Modal({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[85vw] h-[85vh] rounded-lg shadow-xl flex flex-col">
        <div className="flex justify-end p-4 border-b">
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}