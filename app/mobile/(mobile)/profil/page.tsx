'use client'

import { useState } from 'react'

const tabs = ['Data Umum', 'APBDes', 'Potensi'] as const
type Tab = (typeof tabs)[number]

export default function MobileProfilPage() {
  const [tab, setTab] = useState<Tab>('Data Umum')

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all
              ${
                tab === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-slate-600'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-2xl shadow-sm border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold">{tab}</div>
        <div className="text-xs text-slate-500 mt-1">
          Konten sementara dikosongkan.
        </div>
      </div>
    </div>
  )
}