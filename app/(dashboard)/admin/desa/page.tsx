'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ChevronDown, DatabaseZap, History, PencilLine, Phone } from 'lucide-react'

interface TaDesa {
  id: string
  Tahun: string
  Kd_Pemda: string
  Kd_Desa: string
  Nama_Desa: string | null
  Alamat: string | null
  Ibukota: string | null
  HP_Kades: string | null
}

type ApiListResponse = { data: TaDesa[]; error?: string }

async function safeReadJson(res: Response) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return await res.json()
  const text = await res.text()
  return { _nonJson: true, _text: text }
}

export default function DesaPage() {
  const router = useRouter()
  const [desa, setDesa] = useState<TaDesa[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // dropdown state
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchDesa()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // close dropdown on outside click / esc
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  const fetchDesa = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/desa', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      const json: any = await safeReadJson(response)

      if (!response.ok) throw new Error(json?.error || 'Gagal memuat desa')

      const list = (json as ApiListResponse)?.data ?? []
      setDesa(list)
    } catch (error: any) {
      console.error('Failed to fetch desa:', error)
      alert(error?.message || 'Gagal memuat desa')
    } finally {
      setLoading(false)
    }
  }

  // ✅ delete pakai Kd_Desa (sesuai /api/admin/desa/[kdDesa])
  const handleDelete = async (kdDesa: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return
    try {
      const response = await fetch(`/api/admin/desa/${encodeURIComponent(kdDesa)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      const json: any = await safeReadJson(response)

      if (!response.ok) throw new Error(json?.error || 'Gagal menghapus desa')
      fetchDesa()
    } catch (error: any) {
      console.error('Failed to delete desa:', error)
      alert(error?.message || 'Gagal menghapus desa')
    }
  }

  // ====== actions from dropdown ======
  async function runSp(endpoint: string, confirmText: string) {
    setMenuOpen(false)
    if (!confirm(confirmText)) return

    setSubmitting(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      })
      const json: any = await safeReadJson(res)
      if (!res.ok) throw new Error(json?.error || 'Gagal menjalankan proses')

      await fetchDesa()
      alert(json?.message || 'Berhasil.')
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Gagal menjalankan proses')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Desa</h1>
          <p className="text-gray-600">Kelola data desa</p>
        </div>

        {/* ✅ Dropdown Tambah */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-60"
          >
            <Plus className="w-5 h-5" />
            Aksi
            <ChevronDown className="w-4 h-4 opacity-90" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-white shadow-lg overflow-hidden z-50">
              <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  setMenuOpen(false)
                  router.push('/admin/desa/create')
                }}
              >
                <PencilLine className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium">Tambah Manual</div>
                  <div className="text-xs text-gray-500">Input desa secara manual</div>
                </div>
              </button>

              <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                onClick={() =>
                  runSp(
                    '/api/admin/desa/sync-siskeudes',
                    'Jalankan Update dari Siskeudes? (proses ini akan memperbarui data desa sesuai sumber Siskeudes)'
                  )
                }
              >
                <DatabaseZap className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-sm font-medium">Update dari Siskeudes</div>
                  <div className="text-xs text-gray-500">Jalankan SP sync/update</div>
                </div>
              </button>

              <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                onClick={() =>
                  runSp(
                    '/api/admin/desa/copy-prev-year',
                    'Ambil data desa dari Tahun Lalu? (proses ini akan menyalin data desa ke tahun berjalan)'
                  )
                }
              >
                <History className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-sm font-medium">Ambil dari Tahun Lalu</div>
                  <div className="text-xs text-gray-500">Jalankan SP copy tahun sebelumnya</div>
                </div>
              </button>
              <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                  onClick={async () => {
                    setMenuOpen(false)
                    await runSp(
                      '/api/admin/desa/update-nomor-hp',
                      'Update Nomor HP Kades dari sumber perangkat desa?\nNomor akan dinormalisasi ke format +62 tanpa spasi.'
                    )
                  }}
                >
                  <Phone className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">Update Nomor HP</div>
                    <div className="text-xs text-gray-500">Tarik & normalisasi HP Kades</div>
                  </div>
                </button>

            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Desa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Desa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ibukota</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HP Kades</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {desa.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data
              </td>
            </tr>
          ) : (
            desa.map((item) => (
              <tr key={`${item.Tahun}-${item.Kd_Pemda}-${item.Kd_Desa}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{item.Kd_Desa}</td>
                <td className="px-6 py-4 text-sm">{item.Nama_Desa ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Alamat ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.Ibukota ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.HP_Kades ?? '-'}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    onClick={() => router.push(`/admin/desa/${encodeURIComponent(item.id)}`)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    title="Edit"
                    disabled={submitting}
                  >
                    <Edit className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Hapus"
                    disabled={submitting}
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {submitting && (
        <div className="text-sm text-gray-600">
          Memproses... mohon tunggu.
        </div>
      )}
    </div>
  )
}
