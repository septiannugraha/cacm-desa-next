'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RisikoNonkeuanganPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Risiko Nonkeuangan</h1>
          <p className="text-gray-600 mt-1">Analisis Risiko Nonkeuangan Desa</p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          Halaman Profil Risiko Nonkeuangan - Dalam Pengembangan
        </p>
      </div>
    </div>
  )
}
