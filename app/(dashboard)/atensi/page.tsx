'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Filter,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { fetchAtensi } from '@/lib/api/atensi'

const sentStatusConfig = {
  true: { label: 'Terkirim', color: 'bg-green-100 text-green-800 border-green-300' },
  false: { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-300' },
}

interface Atensi {
  id: string
  Tahun: string
  Kd_Pemda: string
  No_Atensi: string
  Tgl_Atensi: string
  Tgl_CutOff: string
  Keterangan?: string | null
  Jlh_Desa?: number | null
  Jlh_RF?: number | null
  Jlh_TL?: number | null
  isSent?: boolean | null
  create_at?: string | null
  Ta_Pemda_CACM_Atensi_id_PemdaToTa_Pemda?: {
    Nama_Pemda: string
    Kd_Pemda: string
  }
  CACM_Atensi_Desa_CACM_Atensi_Desa_id_AtensiToCACM_Atensi?: Array<{
    Kd_Desa: string
    StatusTL?: number | null
    StatusVer?: number | null
  }>
}

export default function AtensiPage() {
  const { data: session } = useSession()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isSentFilter, setIsSentFilter] = useState<string>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['atensi', { page, search, isSent: isSentFilter }],
    queryFn: () => fetchAtensi({
      page,
      limit: 10,
      search,
      isSent: isSentFilter,
    }),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Atensi</h1>
          <p className="text-gray-600 mt-1">
            Kelola dan pantau atensi keuangan desa
          </p>
        </div>
        <Link href="/atensi/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Buat Atensi
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor atau keterangan atensi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={isSentFilter}
            onChange={(e) => setIsSentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="false">Draft</option>
            <option value="true">Terkirim</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="mt-2 text-red-600">Error loading data</p>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="mt-2 text-gray-600">Tidak ada atensi ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.data.map((atensi: Atensi) => (
              <Link
                key={atensi.id}
                href={`/atensi/${atensi.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">{atensi.No_Atensi}</span>
                        <span className="text-xs text-gray-500">Tahun {atensi.Tahun}</span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${sentStatusConfig[atensi.isSent ? 'true' : 'false']?.color || ''}`}>
                          {sentStatusConfig[atensi.isSent ? 'true' : 'false']?.label}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-gray-900">
                        {atensi.Keterangan || 'Atensi ' + atensi.No_Atensi}
                      </h3>

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(atensi.Tgl_Atensi), 'dd MMM yyyy', { locale: id })}
                        </div>

                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Cutoff: {format(new Date(atensi.Tgl_CutOff), 'dd MMM yyyy', { locale: id })}
                        </div>

                        {atensi.Jlh_Desa != null && atensi.Jlh_Desa > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {atensi.Jlh_Desa} Desa
                          </div>
                        )}

                        {atensi.Jlh_RF != null && atensi.Jlh_RF > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            {atensi.Jlh_RF} Red Flag
                          </div>
                        )}

                        <div>
                          <span className="font-medium">{atensi.Ta_Pemda_CACM_Atensi_id_PemdaToTa_Pemda?.Nama_Pemda}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.meta?.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(data.meta.totalPages, page + 1))}
              disabled={page === data.meta.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{data.meta.totalPages}</span> ({data.meta.total} total items)
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {[...Array(Math.min(5, data.meta.totalPages))].map((_, i) => {
                  const pageNumber = i + 1
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}

                <button
                  onClick={() => setPage(Math.min(data.meta.totalPages, page + 1))}
                  disabled={page === data.meta.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}