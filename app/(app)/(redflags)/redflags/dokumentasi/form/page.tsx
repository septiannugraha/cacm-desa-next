"use client"

import React, { useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

type Atensi = {
  id: string
  No_Atensi: string
  Tgl_Atensi: string
  Tgl_CutOff: string
  Keterangan: string | null
  isSent: boolean | null
  Tahun?: string
  Kd_Pemda?: string
}

async function safeReadJson(res: Response) {
  const ct = res.headers.get("content-type") || ""
  const isJson = ct.includes("application/json")
  if (isJson) return await res.json()
  const text = await res.text()
  return { _nonJson: true, _text: text }
}

function isoToDateInput(iso: string | null | undefined) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}
function dateInputToISO(date: string) {
  const d = new Date(date + "T00:00:00")
  return d.toISOString()
}

// ✅ wrapper Suspense
export default function DokumentasiFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DokumentasiFormInner />
    </Suspense>
  )
}

function DokumentasiFormInner() {
  const sp = useSearchParams()
  const router = useRouter()

  const idRaw = sp.get("id")
  const id = useMemo(() => {
    const v = (idRaw || "").trim()
    if (!v || v === "null" || v === "undefined") return null
    return v
  }, [idRaw])

  const isEdit = useMemo(() => !!id, [id])

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [No_Atensi, setNoAtensi] = useState("")
  const [Tgl_Atensi, setTglAtensi] = useState("")
  const [Tgl_CutOff, setTglCutoff] = useState("")
  const [Keterangan, setKeterangan] = useState("")

  function todayDateInput() {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  const [scope, setScope] = useState<{ Tahun: string; Kd_Pemda: string } | null>(null)

  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/dokumentasi/${encodeURIComponent(id)}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })
        const json = await safeReadJson(res)
        if (!res.ok) throw new Error(json?.error || "Gagal memuat detail")

        const payload: Atensi | null = (json?.data ?? json?.atensi ?? json) || null
        if (!payload?.id) throw new Error("Response API tidak valid")

        if (cancelled) return
        setNoAtensi(payload.No_Atensi || "")
        setTglAtensi(isoToDateInput(payload.Tgl_Atensi))
        setTglCutoff(isoToDateInput(payload.Tgl_CutOff))
        setKeterangan(payload.Keterangan || "")
        if (payload.Tahun && payload.Kd_Pemda) setScope({ Tahun: payload.Tahun, Kd_Pemda: payload.Kd_Pemda })
      } catch (e: any) {
        console.error(e)
        if (!cancelled) alert(e?.message || "Gagal memuat detail")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  async function save() {
    if (!No_Atensi.trim()) return alert("Nomor Atensi wajib diisi")
    if (!Tgl_Atensi) return alert("Tanggal Atensi wajib diisi")
    if (!Tgl_CutOff) return alert("Tanggal CutOff wajib diisi")

    setSubmitting(true)
    try {
      if (isEdit) {
        const res = await fetch(`/api/dokumentasi/${encodeURIComponent(id!)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            No_Atensi,
            Tgl_Atensi: dateInputToISO(Tgl_Atensi),
            Tgl_CutOff: dateInputToISO(Tgl_CutOff),
            Keterangan: Keterangan.trim() || null,
          }),
        })
        const json = await safeReadJson(res)
        if (!res.ok) throw new Error(json?.error || "Gagal update")
      } else {
        const res = await fetch(`/api/identifikasi/arsipkan`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            NoAtensi: No_Atensi.trim(),
            Tanggal_CutOff: dateInputToISO(Tgl_CutOff),
            TanggalAtensi: dateInputToISO(Tgl_Atensi),
            Keterangan: Keterangan.trim() || null,
          }),
        })
        const json = await safeReadJson(res)
        if (!res.ok) throw new Error(json?.error || "Gagal create (SP)")
      }
      router.push("/redflags/dokumentasi")
      router.refresh()
    } catch (e: any) {
      console.error(e)
      alert(e?.message || "Gagal simpan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/redflags/dokumentasi">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-xl font-semibold mt-3">{isEdit ? "Edit Atensi" : "Tambah Atensi"}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Ubah informasi Atensi." : "Tambahkan Atensi baru."}
          </p>
        </div>
        <Button onClick={save} disabled={loading || submitting}>
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* form fields */}
        </CardContent>
      </Card>
    </div>
  )
}