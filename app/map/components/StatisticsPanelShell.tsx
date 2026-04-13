'use client'

import StatisticsPanel2 from './StatisticsPanel2'
import type { MapLevel, MapMetric } from '@/types/map'

type Mode = 'type1' | 'type2'

export type PanelPayload = {
  mode: Mode
  level: MapLevel
  code: string | null
  name: string | null
  year: number
  metric: MapMetric
}

export default function StatisticsPanelShell({
  payload,
  onClose
}: {
  payload: PanelPayload
  onClose: () => void
}) {
  return (
    <div className="h-full w-full bg-white border-l border-gray-200 shadow-2xl flex flex-col overflow-hidden rounded-xl">
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-blue-50/70">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-gray-900 truncate">
            {payload.name || 'Detail Wilayah'}
          </div>
          <div className="text-[11px] text-gray-600 font-semibold">
            {String(payload.level).toUpperCase()} • {payload.code || '-'} • {payload.year} •{' '}
            {String(payload.metric).toUpperCase()}
          </div>
        </div>

        <button
          onClick={onClose}
          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          Tutup
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <StatisticsPanel2
          tahun={String(payload.year)}
          level={payload.level}
          code={payload.code}
          regionName={payload.name}
        />
      </div>
    </div>
  )
}