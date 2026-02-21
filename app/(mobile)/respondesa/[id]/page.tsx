'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Upload } from 'lucide-react'

type Row = { id: string; No_Bukti: string; NamaTL: string | null; KomenTL: string | null; NamaFile: string | null }

export default function MobileResponPage() {
  const { rincId } = useParams<{ rincId: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [row, setRow] = useState<Row | null>(null)
  const [namaTL, setNamaTL] = useState('')
  const [komenTL, setKomenTL] = useState('')
  const [namaFile, setNamaFile] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const res = await fetch(`/api/mobile/respon/${rincId}`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(json?.error || 'Gagal memuat')
        setLoading(false)
        return
      }
      const d = json.data as Row
      setRow(d)
      setNamaTL(d.NamaTL || '')
      setKomenTL(d.KomenTL || '')
      setNamaFile(d.NamaFile || '')
      setLoading(false)
    })()
  }, [rincId])

  async function onSubmit() {
    setSending(true)
    const res = await fetch(`/api/mobile/respon/${rincId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ NamaTL: namaTL, KomenTL: komenTL, NamaFile: namaFile }),
    })
    const json = await res.json().catch(() => ({}))
    setSending(false)
    if (!res.ok) {
      alert(json?.error || 'Gagal kirim')
      return
    }
    alert('Terkirim. StatusTL=7 & StatusVer=2.')
    router.back()
  }

  return (
    <div className="space-y-3">
      <Link href="/mobile/atensi">
        <Button variant="outline" className="rounded-xl">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali
        </Button>
      </Link>

      {loading ? (
        <div className="text-sm text-slate-600">Memuat...</div>
      ) : !row ? (
        <div className="text-sm text-slate-600">Data tidak ditemukan.</div>
      ) : (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div>
              <div className="text-sm font-semibold">Respon TL</div>
              <div className="text-xs text-slate-500">No Bukti: {row.No_Bukti}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-600">Nama TL</div>
              <Input value={namaTL} onChange={(e) => setNamaTL(e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-600">Komen TL</div>
              <Input value={komenTL} onChange={(e) => setKomenTL(e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-600">Upload File (nama file saja dulu)</div>
              <div className="flex gap-2">
                <Input value={namaFile} onChange={(e) => setNamaFile(e.target.value)} placeholder="contoh: bukti_tl.pdf" />
                <Button type="button" variant="outline" className="rounded-xl">
                  <Upload className="h-4 w-4 mr-1" />
                  Pilih
                </Button>
              </div>
              <div className="text-[11px] text-slate-500">
                *Upload fisik bisa ditambahkan belakangan (S3/MinIO/local). Sekarang simpan nama file ke kolom <b>NamaFile</b>.
              </div>
            </div>

            <Button className="w-full rounded-xl" onClick={onSubmit} disabled={sending}>
              {sending ? 'Mengirim...' : 'Kirim'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
