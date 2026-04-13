'use client'

import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import React, { useEffect, useMemo, useRef, useState } from 'react'

/** =========================================================
 *  SIMPLE TOPBAR UI (breadcrumb + metric + year + mode)
 *  + StatisticsPanel:
 *    - double click pada peta => buka panel kanan
 *    - panel menampilkan info level/kode/nama/tahun/metric
 *  ========================================================= */
type Mode = 'type1' | 'type2'
type MapMetric = 'budget' | 'realisasi' | 'selisih'

type BreadcrumbItem = {
  name: string
  level: 'nasional' | 'provinsi' | 'pemda' | 'kecamatan' | 'desa'
}

function MetricSelector({
  selectedMetric,
  onMetricChange
}: {
  selectedMetric: MapMetric
  onMetricChange: (m: MapMetric) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">Metric:</span>
      <select
        value={selectedMetric}
        onChange={(e) => onMetricChange(e.target.value as MapMetric)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
      >
        <option value="budget">Anggaran</option>
        <option value="realisasi">Realisasi</option>
        <option value="selisih">Selisih</option>
      </select>
    </div>
  )
}

function YearSelector({
  selectedYear,
  onYearChange
}: {
  selectedYear: number
  onYearChange: (y: number) => void
}) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">Tahun:</span>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}

function Breadcrumb({
  items,
  onNavigate
}: {
  items: BreadcrumbItem[]
  onNavigate: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
      {items.map((it, i) => (
        <button
          key={`${it.level}-${i}`}
          onClick={() => onNavigate(i)}
          className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 transition ${
            i === items.length - 1 ? 'bg-white/70 shadow-sm border border-white/60' : 'hover:bg-white/60'
          }`}
          title="Klik untuk kembali ke level ini"
        >
          {i === 0 ? <span className="text-blue-700">🏠</span> : <span className="text-gray-400">›</span>}
          <span className="truncate max-w-[260px]">{it.name}</span>
        </button>
      ))}
    </div>
  )
}

/** =========================================================
 *  STATISTICS PANEL (placeholder)
 *  - ganti isi di sini dengan StatisticsPanel asli kamu kalau sudah ada
 *  ========================================================= */
type PanelPayload = {
  mode: Mode
  level: 'nasional' | 'provinsi' | 'pemda' | 'kecamatan' | 'desa'
  code: string | null
  name: string | null
  year: number
  metric: MapMetric
}

function StatisticsPanel({
  payload,
  onClose
}: {
  payload: PanelPayload
  onClose: () => void
}) {
  return (
    <div className="h-full w-full bg-white border-l border-gray-200 shadow-2xl flex flex-col">
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-blue-50/70">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-gray-900 truncate">
            {payload.name || 'Detail Wilayah'}
          </div>
          <div className="text-[11px] text-gray-600 font-semibold">
            {payload.level.toUpperCase()} • {payload.code || '-'} • {payload.year} • {payload.metric.toUpperCase()}
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          Tutup
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-bold text-gray-600 mb-2">Ringkasan</div>
          <div className="text-sm text-gray-800 leading-relaxed">
            Panel ini muncul saat <b>double click</b> pada area peta.
            <br />
            Silakan ganti konten di komponen <code>StatisticsPanel</code> dengan komponen statistik milikmu (misalnya
            fetch API / chart / tabel).
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="text-[11px] text-gray-500 font-bold">Mode</div>
            <div className="text-sm font-extrabold text-gray-900">{payload.mode === 'type1' ? 'A' : 'B'}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="text-[11px] text-gray-500 font-bold">Level</div>
            <div className="text-sm font-extrabold text-gray-900">{payload.level}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="text-[11px] text-gray-500 font-bold">Kode</div>
            <div className="text-sm font-extrabold text-gray-900">{payload.code || '-'}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="text-[11px] text-gray-500 font-bold">Nama</div>
            <div className="text-sm font-extrabold text-gray-900 truncate">{payload.name || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** =========================================================
 *  SWITCHER WRAPPER + TOPBAR
 *  ========================================================= */
type SelType1 = {
  KDPPUM: string | null
  KDPKAB: string | null
  KDCPUM: string | null
  // nama untuk breadcrumb
  WADMPR: string | null
  WADMKK: string | null
  WADMKC: string | null
}

type SelType2 = {
  KDPPUM: string | null
  KDPKAB: string | null
 
  WADMPR: string | null
  WADMKK: string | null
}

export default function MapEngineSwitcher() {
  const [mode, setMode] = useState<Mode>('type1')
  const [selectedMetric, setSelectedMetric] = useState<MapMetric>('budget')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  // panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelPayload, setPanelPayload] = useState<PanelPayload>({
    mode: 'type1',
    level: 'nasional',
    code: null,
    name: 'Indonesia',
    year: new Date().getFullYear(),
    metric: 'budget'
  })

  // state drilldown (type1)
  const [sel1, setSel1] = useState<SelType1>({
    KDPPUM: null,
    KDPKAB: null,
    KDCPUM: null,
    WADMPR: null,
    WADMKK: null,
    WADMKC: null
  })

  // state drilldown (type2)
  const [sel2, setSel2] = useState<SelType2>({
    KDPPUM: null,
    KDPKAB: null,
     
    WADMPR: null,
    WADMKK: null,
     
  })

  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const base: BreadcrumbItem[] = [{ name: 'Indonesia', level: 'nasional' }]

    if (mode === 'type1') {
      if (sel1.KDPPUM) base.push({ name: sel1.WADMPR || `Provinsi (${sel1.KDPPUM})`, level: 'provinsi' })
      if (sel1.KDPKAB) base.push({ name: sel1.WADMKK || `Pemda (${sel1.KDPKAB})`, level: 'pemda' })
      if (sel1.KDCPUM) base.push({ name: sel1.WADMKC || `Kecamatan (${sel1.KDCPUM})`, level: 'kecamatan' })
      return base
    }

    if (sel2.KDPKAB) base.push({ name: sel2.WADMKK || `Pemda (${sel2.KDPKAB})`, level: 'pemda' })
    return base
  }, [mode, sel1, sel2])

  // remount token agar map tetap konsisten saat reset breadcrumb
  const [mapToken, setMapToken] = useState(0)

  const handleBreadcrumbNavigate = (index: number) => {
    if (mode === 'type1') {
      if (index <= 0) {
        setSel1({ KDPPUM: null, KDPKAB: null, KDCPUM: null, WADMPR: null, WADMKK: null, WADMKC: null })
      } else if (index === 1) {
        setSel1((p) => ({
          KDPPUM: p.KDPPUM,
          KDPKAB: null,
          KDCPUM: null,
          WADMPR: p.WADMPR,
          WADMKK: null,
          WADMKC: null
        }))
      } else if (index === 2) {
        setSel1((p) => ({
          KDPPUM: p.KDPPUM,
          KDPKAB: p.KDPKAB,
          KDCPUM: null,
          WADMPR: p.WADMPR,
          WADMKK: p.WADMKK,
          WADMKC: null
        }))
      }
    } else {
      if (index <= 0) {
        setSel2({ KDPPUM: null, KDPKAB: null,   WADMPR: null, WADMKK: null    })
      } else if (index === 1) {
        setSel1((p) => ({
          KDPPUM: p.KDPPUM,
          KDPKAB: null,
          KDCPUM: null,
          WADMPR: p.WADMPR,
          WADMKK: null,
          WADMKC: null
        }))
      } else if (index === 2) {
        setSel2((p) => ({
          KDPPUM: p.KDPPUM,
          KDPKAB: p.KDPKAB,
          KDCPUM: null,
          WADMPR: p.WADMPR,
          WADMKK: p.WADMKK,
          WADMKC: null
        }))
      }
    }

    setIsPanelOpen(false)
    setMapToken((x) => x + 1)
  }

  // helper: buka panel dari double click
  const openPanel = (p: Omit<PanelPayload, 'mode' | 'year' | 'metric'>) => {
    setPanelPayload({
      mode,
      year: selectedYear,
      metric: selectedMetric,
      ...p
    })
    setIsPanelOpen(true)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      {/* TOP BAR */}
      <div className="absolute top-2 left-2 right-2 z-50 h-16 backdrop-blur-md bg-blue-100/60 border border-white/40 flex items-center px-4 md:px-6 rounded-xl shadow-lg">
        <img src="/cacm_logo.png" alt="CACM" className="h-8 w-auto" />

        <div className="ml-4 flex-1 min-w-0">
          <Breadcrumb items={breadcrumb} onNavigate={handleBreadcrumbNavigate} />
          <div className="text-[11px] text-gray-600 font-medium mt-0.5"></div>
        </div>

        <div className="hidden md:flex items-center gap-3 mr-3">
          <MetricSelector selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
          <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
        </div>

        <div className="flex items-center gap-0">
          <span className="text-sm text-gray-700 mr-2">Mode: </span>
          <button
            onClick={() => {
              setMode('type1')
              setIsPanelOpen(false)
              setMapToken((x) => x + 1)
            }}
            className={`h-9 w-8 pl-0 rounded-l-lg border text-sm font-bold transition shadow-sm ${
              mode === 'type1' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-800 hover:bg-white/70'
            }`}
          >
            A
          </button>
          <button
            onClick={() => {
              setMode('type2')
              setIsPanelOpen(false)
              setMapToken((x) => x + 1)
            }}
            className={`h-9 w-8 pr-0 rounded-r-lg border text-sm font-bold transition shadow-sm ${
              mode === 'type2' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-800 hover:bg-white/70'
            }`}
          >
            B
          </button>
        </div>
      </div>

      {/* MAP + (optional) PANEL LAYOUT */}
      <div
        className={`absolute inset-0 z-10 transition-all duration-300 ${
          isPanelOpen ? 'pr-[520px]' : ''
        }`}
      >
        {mode === 'type1' ? (
          <MapEngineType1
            key={`map-type1-${mapToken}`}
            initialSelected={sel1}
            onSelectedChange={setSel1}
            onRegionDoubleClick={(p) => openPanel(p)}
          />
        ) : (
          <MapEngineType2
            key={`map-type2-${mapToken}`}
            initialSelected={sel2}
            onSelectedChange={setSel2}
            onRegionDoubleClick={(p) => openPanel(p)}
          />
        )}
      </div>

      {/* RIGHT PANEL */}
      {isPanelOpen && (
        <div className="absolute top-2 bottom-2 right-2 z-50 w-[520px] rounded-xl overflow-hidden">
          <StatisticsPanel payload={panelPayload} onClose={() => setIsPanelOpen(false)} />
        </div>
      )}

      {/* mobile metric/year */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 z-50 bg-white/90 backdrop-blur border border-gray-200 rounded-xl shadow-lg p-3 flex items-center justify-between gap-3">
        <MetricSelector selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
        <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
      </div>
    </div>
  )
}

/** =========================================================
 *  TYPE 1 (FIX) — nasional → prov → pemda → kec → desa
 *  Double click => open StatisticsPanel (level+code+name)
 *  ========================================================= */
type Level1 = 'provinsi' | 'pemda' | 'kecamatan' | 'desa'

type LevelCfg1 = {
  level: Level1
  source: string
  sourceLayer: string
  minzoom?: number
  maxzoom?: number
  keySelf: string
  maskBy?: string
  labelField: string
  labelSize: number
  drillZoom: number
  fillId: string
  lineId: string
  labelId: string
  hoverFillId: string
  selectedFillId: string
}

function MapEngineType1({
  initialSelected,
  onSelectedChange,
  onRegionDoubleClick
}: {
  initialSelected: SelType1
  onSelectedChange: React.Dispatch<React.SetStateAction<SelType1>>
  onRegionDoubleClick: (p: { level: PanelPayload['level']; code: string | null; name: string | null }) => void
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  // untuk masking map: cukup simpan KODE saja
  const selected = useRef<{ KDPPUM: string | null; KDPKAB: string | null; KDCPUM: string | null }>({
    KDPPUM: null,
    KDPKAB: null,
    KDCPUM: null
  })

  useEffect(() => {
    selected.current = {
      KDPPUM: initialSelected.KDPPUM,
      KDPKAB: initialSelected.KDPKAB,
      KDCPUM: initialSelected.KDCPUM
    }
  }, [initialSelected])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      center: [118, -2],
      zoom: 4,
      style: { version: 8, sources: {}, layers: [] }
    })
    mapInstance.current = map

    const YELLOW = '#BBF7D0'
    const HOVER_YELLOW = '#86EFAC'
    const WHITE = '#9CA3AF'
    const LINE = '#92400E'
    const LABEL = '#111827'
    const NONE = '__none__'

    const eq = (field: string, value: string) => ['==', ['get', field], value] as any

    const levels: LevelCfg1[] = [
      {
        level: 'provinsi',
        source: 'provinsi',
        sourceLayer: 'provinsi_clean',
        maxzoom: 6,
        keySelf: 'KDPPUM',
        labelField: 'WADMPR',
        labelSize: 14,
        drillZoom: 7,
        fillId: 'provinsi-fill',
        lineId: 'provinsi-line',
        labelId: 'provinsi-label',
        hoverFillId: 'provinsi-hover',
        selectedFillId: 'provinsi-selected'
      },
      {
        level: 'pemda',
        source: 'pemda',
        sourceLayer: 'pemda_clean',
        minzoom: 5,
        maxzoom: 9,
        keySelf: 'KDPKAB',
        maskBy: 'KDPPUM',
        labelField: 'WADMKK',
        labelSize: 12,
        drillZoom: 9,
        fillId: 'pemda-fill',
        lineId: 'pemda-line',
        labelId: 'pemda-label',
        hoverFillId: 'pemda-hover',
        selectedFillId: 'pemda-selected'
      },
      {
        level: 'kecamatan',
        source: 'kecamatan',
        sourceLayer: 'kecamatan_clean',
        minzoom: 8,
        maxzoom: 11,
        keySelf: 'KDCPUM',
        maskBy: 'KDPKAB',
        labelField: 'WADMKC',
        labelSize: 12,
        drillZoom: 12,
        fillId: 'kecamatan-fill',
        lineId: 'kecamatan-line',
        labelId: 'kecamatan-label',
        hoverFillId: 'kecamatan-hover',
        selectedFillId: 'kecamatan-selected'
      },
      {
        level: 'desa',
        source: 'desa',
        sourceLayer: 'desa_clean',
        minzoom: 11,
        keySelf: 'KDEPUM',
        maskBy: 'KDCPUM',
        labelField: 'NAMOBJ',
        labelSize: 12,
        drillZoom: 13,
        fillId: 'desa-fill',
        lineId: 'desa-line',
        labelId: 'desa-label',
        hoverFillId: 'desa-hover',
        selectedFillId: 'desa-selected'
      }
    ]

    function addSources() {
      const origin = window.location.origin
      map.addSource('provinsi', { type: 'vector', tiles: [`${origin}/tiles/provinsi/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 6 })
      map.addSource('pemda', { type: 'vector', tiles: [`${origin}/tiles/pemda/{z}/{x}/{y}.pbf`], minzoom: 5, maxzoom: 9 })
      map.addSource('kecamatan', { type: 'vector', tiles: [`${origin}/tiles/kecamatan/{z}/{x}/{y}.pbf`], minzoom: 8, maxzoom: 11 })
      map.addSource('desa', { type: 'vector', tiles: [`${origin}/tiles/desa/{z}/{x}/{y}.pbf`], minzoom: 10, maxzoom: 14 })
    }

    function addLayers() {
      levels.forEach((lv) => {
        const zMin = lv.minzoom !== undefined ? { minzoom: lv.minzoom } : {}
        const zMax = lv.maxzoom !== undefined ? { maxzoom: lv.maxzoom } : {}

        map.addLayer({
          id: lv.fillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          paint: { 'fill-color': WHITE, 'fill-opacity': 0.8 }
        })

        map.addLayer({
          id: lv.selectedFillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          filter: eq(lv.keySelf, NONE),
          paint: { 'fill-color': HOVER_YELLOW, 'fill-opacity': 0.9 }
        })

        map.addLayer({
          id: lv.hoverFillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          filter: eq(lv.keySelf, NONE),
          paint: { 'fill-color': HOVER_YELLOW, 'fill-opacity': 0.92 }
        })

        map.addLayer({
          id: lv.lineId,
          type: 'line',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          paint: { 'line-color': LINE, 'line-width': 0.9, 'line-opacity': 1 }
        })

        map.addLayer({
          id: lv.labelId,
          type: 'symbol',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          layout: {
            'text-field': ['get', lv.labelField],
            'text-size': lv.labelSize,
            'text-font': ['Open Sans Bold'],
            'text-anchor': 'center'
          },
          paint: {
            'text-color': LABEL,
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.2,
            'text-opacity': 1
          }
        })
      })
    }

    function geomBbox(geom: any): [[number, number], [number, number]] | null {
      if (!geom) return null
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      const scan = (coords: any) => {
        if (!coords) return
        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          const x = coords[0], y = coords[1]
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
          return
        }
        for (const c of coords) scan(c)
      }
      scan(geom.coordinates)
      if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) return null
      return [[minX, minY], [maxX, maxY]]
    }

    function applyMasking() {
      const prov = levels.find((l) => l.level === 'provinsi')!
      map.setPaintProperty(prov.fillId, 'fill-color', YELLOW)
      map.setPaintProperty(prov.lineId, 'line-opacity', 1)
      map.setPaintProperty(prov.labelId, 'text-opacity', 1)

      const pemda = levels.find((l) => l.level === 'pemda')!
      if (selected.current.KDPPUM) {
        const v = selected.current.KDPPUM
        map.setPaintProperty(pemda.fillId, 'fill-color', ['case', ['==', ['get', 'KDPPUM'], v], YELLOW, WHITE])
        map.setPaintProperty(pemda.lineId, 'line-opacity', ['case', ['==', ['get', 'KDPPUM'], v], 1, 0])
        map.setPaintProperty(pemda.labelId, 'text-opacity', ['case', ['==', ['get', 'KDPPUM'], v], 1, 0])
      } else {
        map.setPaintProperty(pemda.fillId, 'fill-color', WHITE)
        map.setPaintProperty(pemda.lineId, 'line-opacity', 1)
        map.setPaintProperty(pemda.labelId, 'text-opacity', 1)
      }

      const kec = levels.find((l) => l.level === 'kecamatan')!
      if (selected.current.KDPKAB) {
        const v = selected.current.KDPKAB
        map.setPaintProperty(kec.fillId, 'fill-color', ['case', ['==', ['get', 'KDPKAB'], v], YELLOW, WHITE])
        map.setPaintProperty(kec.lineId, 'line-opacity', ['case', ['==', ['get', 'KDPKAB'], v], 1, 0])
        map.setPaintProperty(kec.labelId, 'text-opacity', ['case', ['==', ['get', 'KDPKAB'], v], 1, 0])
      } else {
        map.setPaintProperty(kec.fillId, 'fill-color', WHITE)
        map.setPaintProperty(kec.lineId, 'line-opacity', 1)
        map.setPaintProperty(kec.labelId, 'text-opacity', 1)
      }

      const desa = levels.find((l) => l.level === 'desa')!
      if (selected.current.KDCPUM) {
        const v = selected.current.KDCPUM
        map.setPaintProperty(desa.fillId, 'fill-color', ['case', ['==', ['get', 'KDCPUM'], v], YELLOW, WHITE])
        map.setPaintProperty(desa.lineId, 'line-opacity', ['case', ['==', ['get', 'KDCPUM'], v], 1, 0])
        map.setPaintProperty(desa.labelId, 'text-opacity', ['case', ['==', ['get', 'KDCPUM'], v], 1, 0])
      } else {
        map.setPaintProperty(desa.fillId, 'fill-color', WHITE)
        map.setPaintProperty(desa.lineId, 'line-opacity', 1)
        map.setPaintProperty(desa.labelId, 'text-opacity', 1)
      }
    }

    function clearOverlays(level: Level1) {
      const lv = levels.find((x) => x.level === level)!
      map.setFilter(lv.hoverFillId, eq(lv.keySelf, NONE))
      map.setFilter(lv.selectedFillId, eq(lv.keySelf, NONE))
    }

    function setSelectedOverlay(level: Level1, keyField: string, keyValue: string) {
      const lv = levels.find((x) => x.level === level)!
      map.setFilter(lv.selectedFillId, eq(keyField, keyValue))
      map.setFilter(lv.hoverFillId, eq(keyField, NONE))
    }

    function setHoverOverlay(level: Level1, keyField: string, keyValue: string) {
      const lv = levels.find((x) => x.level === level)!
      map.setFilter(lv.hoverFillId, eq(keyField, keyValue))
      map.getCanvas().style.cursor = 'pointer'
    }

    function setupEvents(lv: LevelCfg1) {
      map.on('mousemove', lv.fillId, (e) => {
        const f = e.features?.[0]
        if (!f) return
        const props = f.properties as Record<string, any> | undefined
        const raw = props?.[lv.keySelf]
        if (!raw) return
        setHoverOverlay(lv.level, lv.keySelf, String(raw))
      })

      map.on('mouseleave', lv.fillId, () => {
        const l = levels.find((x) => x.level === lv.level)!
        map.setFilter(l.hoverFillId, eq(l.keySelf, NONE))
        map.getCanvas().style.cursor = ''
      })

      // dbl click = behavior lama (select + masking + zoom)
      map.on('dblclick', lv.fillId, (e) => {
        const f = e.features?.[0]
        if (!f) return
        const props = f.properties as Record<string, any> | undefined
        if (!props) return

        const rawSelf = props?.[lv.keySelf]
        if (!rawSelf) return
        const selfVal = String(rawSelf)

        const provName = props.WADMPR != null ? String(props.WADMPR) : null
        const pemdaName = props.WADMKK != null ? String(props.WADMKK) : null
        const kecName = props.WADMKC != null ? String(props.WADMKC) : null

        setSelectedOverlay(lv.level, lv.keySelf, selfVal)

        if (lv.level === 'provinsi') {
          selected.current.KDPPUM = selfVal
          selected.current.KDPKAB = null
          selected.current.KDCPUM = null
          clearOverlays('pemda')
          clearOverlays('kecamatan')
          clearOverlays('desa')

          onSelectedChange({
            KDPPUM: selfVal,
            KDPKAB: null,
            KDCPUM: null,
            WADMPR: provName,
            WADMKK: null,
            WADMKC: null
          })
        } else if (lv.level === 'pemda') {
          selected.current.KDPKAB = selfVal
          selected.current.KDCPUM = null
          clearOverlays('kecamatan')
          clearOverlays('desa')

          onSelectedChange((p) => ({
            ...p,
            KDPKAB: selfVal,
            KDCPUM: null,
            WADMKK: pemdaName,
            WADMKC: null
          }))
        } else if (lv.level === 'kecamatan') {
          selected.current.KDCPUM = selfVal
          clearOverlays('desa')

          onSelectedChange((p) => ({
            ...p,
            KDCPUM: selfVal,
            WADMKC: kecName
          }))
        }

        applyMasking()

        const bbox = geomBbox((f as any).geometry)
        if (bbox) map.fitBounds(bbox, { padding: 40, duration: 900 })
        else map.easeTo({ center: e.lngLat, zoom: lv.drillZoom, duration: 800 })
      })

      // ... click = buka panel kanan (tanpa mengubah drill)
      map.on('click', lv.fillId, (e) => {
        e.preventDefault() // stop default map zoom double click
        const f = e.features?.[0]
        if (!f) return
        const props = f.properties as Record<string, any> | undefined
        if (!props) return

        const rawSelf = props?.[lv.keySelf]
        if (!rawSelf) return
        const selfVal = String(rawSelf)

        const name =
          lv.level === 'provinsi'
            ? props.WADMPR != null
              ? String(props.WADMPR)
              : null
            : lv.level === 'pemda'
              ? props.WADMKK != null
                ? String(props.WADMKK)
                : null
              : lv.level === 'kecamatan'
                ? props.WADMKC != null
                  ? String(props.WADMKC)
                  : null
                : props.NAMOBJ != null
                  ? String(props.NAMOBJ)
                  : null

        onRegionDoubleClick({
          level: lv.level,
          code: selfVal,
          name
        })
      })
    }

    map.on('load', () => {
      addSources()
      addLayers()

      selected.current = {
        KDPPUM: initialSelected.KDPPUM,
        KDPKAB: initialSelected.KDPKAB,
        KDCPUM: initialSelected.KDCPUM
      }
      applyMasking()

      if (selected.current.KDPPUM) setSelectedOverlay('provinsi', 'KDPPUM', selected.current.KDPPUM)
      if (selected.current.KDPKAB) setSelectedOverlay('pemda', 'KDPKAB', selected.current.KDPKAB)
      if (selected.current.KDCPUM) setSelectedOverlay('kecamatan', 'KDCPUM', selected.current.KDCPUM)

      // penting: matikan zoom default double click supaya event dblclick kita bersih
      map.doubleClickZoom.disable()

      levels.forEach(setupEvents)
    })

    map.on('error', (e) => console.error('Map error:', e))

    return () => {
      map.remove()
      mapInstance.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
}

/** =========================================================
 *  TYPE 2 — nasional → pemda → desa
 *  Double click => open StatisticsPanel
 *  ========================================================= */
type Level2 = 'provinsi' | 'pemda' | 'desa'

type LevelCfg2 = {
  level: Level2
  source: string
  sourceLayer: string
  minzoom?: number
  maxzoom?: number
  keySelf: string
  maskBy?: string
  labelField: string
  labelSize: number
  drillZoom: number
  fillId: string
  lineId: string
  labelId: string
  hoverFillId: string
  selectedFillId: string
}

function MapEngineType2({
  initialSelected,
  onSelectedChange,
  onRegionDoubleClick
}: {
  initialSelected: SelType2
  onSelectedChange: React.Dispatch<React.SetStateAction<SelType2>>
  onRegionDoubleClick: (p: { level: PanelPayload['level']; code: string | null; name: string | null }) => void
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  const selected = useRef<{ KDPPUM: string | null; KDPKAB: string | null   }>({
    KDPPUM: null,
    KDPKAB: null,
  
  })

  useEffect(() => {
    selected.current = {
      KDPPUM: initialSelected.KDPPUM,
      KDPKAB: initialSelected.KDPKAB,
  
    }
  }, [initialSelected])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      center: [118, -2],
      zoom: 4,
      style: { version: 8, sources: {}, layers: [] }
    })
    mapInstance.current = map

    const YELLOW = '#BBF7D0'
    const HOVER_YELLOW = '#86EFAC'
    const WHITE = '#9CA3AF'
    const LINE = '#92400E'
    const LABEL = '#111827'
    const NONE = '__none__'

    const eq = (field: string, value: string) => ['==', ['get', field], value] as any

    const SHOW_PROV_BORDER = true

    const levels: LevelCfg2[] = [
      {
        level: 'provinsi',
        source: 'provinsi',
        sourceLayer: 'provinsi_clean',
        maxzoom: 4,
        keySelf: 'KDPPUM',
        labelField: 'WADMPR',
        labelSize: 14,
        drillZoom: 7,
        fillId: 'provinsi-fill',
        lineId: 'provinsi-line',
        labelId: 'provinsi-label',
        hoverFillId: 'provinsi-hover',
        selectedFillId: 'provinsi-selected'
      },
      {
        level: 'pemda',
        source: 'pemda2',
        sourceLayer: 'pemda_clean',
        minzoom: 3,
        maxzoom: 8,
        keySelf: 'KDPKAB',
        maskBy: 'KDPPUM',
        labelField: 'WADMKK',
        labelSize: 12,
        drillZoom: 9,
        fillId: 't2-pemda-fill',
        lineId: 't2-pemda-line',
        labelId: 't2-pemda-label',
        hoverFillId: 't2-pemda-hover',
        selectedFillId: 't2-pemda-selected'
      },
      {
        level: 'desa',
        source: 'desa2',
        sourceLayer: 'desa_clean',
        minzoom: 8,
        maxzoom: 14,
        keySelf: 'KDEPUM',
        maskBy: 'KDPKAB',
        labelField: 'NAMOBJ',
        labelSize: 11,
        drillZoom: 11,
        fillId: 't2-desa-fill',
        lineId: 't2-desa-line',
        labelId: 't2-desa-label',
        hoverFillId: 't2-desa-hover',
        selectedFillId: 't2-desa-selected'
      }
    ]

    function addSources() {
      const origin = window.location.origin
      if (SHOW_PROV_BORDER) {
        map.addSource('provinsi', { type: 'vector', tiles: [`${origin}/tiles/provinsi/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 6 })
      }
      map.addSource('provinsi', { type: 'vector', tiles: [`${origin}/tiles/provinsi/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 6 })
      map.addSource('pemda2', { type: 'vector', tiles: [`${origin}/tiles/pemda2/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 14 })
      map.addSource('desa2', { type: 'vector', tiles: [`${origin}/tiles/desa2/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 14 })
    }

    function addLayers() {
 
      levels.forEach((lv) => {
        const zMin = lv.minzoom !== undefined ? { minzoom: lv.minzoom } : {}
        const zMax = lv.maxzoom !== undefined ? { maxzoom: lv.maxzoom } : {}

        map.addLayer({
          id: lv.fillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          paint: { 'fill-color': YELLOW, 'fill-opacity': 0.8 }
        })

        map.addLayer({
          id: lv.selectedFillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          filter: eq(lv.keySelf, NONE),
          paint: { 'fill-color': HOVER_YELLOW, 'fill-opacity': 0.9 }
        })

        map.addLayer({
          id: lv.hoverFillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          filter: eq(lv.keySelf, NONE),
          paint: { 'fill-color': HOVER_YELLOW, 'fill-opacity': 0.92 }
        })

        map.addLayer({
          id: lv.lineId,
          type: 'line',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          paint: { 'line-color': LINE, 'line-width': 0.9, 'line-opacity': 1 }
        })

        map.addLayer({
          id: lv.labelId,
          type: 'symbol',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          layout: {
            'text-field': ['get', lv.labelField],
            'text-size': lv.labelSize,
            'text-font': ['Open Sans Bold'],
            'text-anchor': 'center'
          },
          paint: {
            'text-color': LABEL,
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.2,
            'text-opacity': 1
          }
        })
      })
    }

    function geomBbox(geom: any): [[number, number], [number, number]] | null {
      if (!geom) return null
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      const scan = (coords: any) => {
        if (!coords) return
        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          const x = coords[0], y = coords[1]
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
          return
        }
        for (const c of coords) scan(c)
      }
      scan(geom.coordinates)
      if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) return null
      return [[minX, minY], [maxX, maxY]]
    }

    function applyMaskings2() {
      const prov = levels.find((l) => l.level === 'provinsi')!
      map.setPaintProperty(prov.fillId, 'fill-color', YELLOW)
      map.setPaintProperty(prov.lineId, 'line-opacity', 1)
      map.setPaintProperty(prov.labelId, 'text-opacity', 1)

      const pemda = levels.find((l) => l.level === 'pemda')!
      if (selected.current.KDPPUM) {
        const v = selected.current.KDPPUM
        map.setPaintProperty(pemda.fillId, 'fill-color', ['case', ['==', ['get', 'KDPPUM'], v], YELLOW, WHITE])
        map.setPaintProperty(pemda.lineId, 'line-opacity', ['case', ['==', ['get', 'KDPPUM'], v], 1, 0])
        map.setPaintProperty(pemda.labelId, 'text-opacity', ['case', ['==', ['get', 'KDPPUM'], v], 1, 0])
      } else {
        map.setPaintProperty(pemda.fillId, 'fill-color', WHITE)
        map.setPaintProperty(pemda.lineId, 'line-opacity', 1)
        map.setPaintProperty(pemda.labelId, 'text-opacity', 1)
      }
 
      const desa = levels.find((l) => l.level === 'desa')!
      if (selected.current.KDPKAB) {
        const v = selected.current.KDPKAB
        map.setPaintProperty(desa.fillId, 'fill-color', ['case', ['==', ['get', 'KDCPUM'], v], YELLOW, WHITE])
        map.setPaintProperty(desa.lineId, 'line-opacity', ['case', ['==', ['get', 'KDCPUM'], v], 1, 0])
        map.setPaintProperty(desa.labelId, 'text-opacity', ['case', ['==', ['get', 'KDCPUM'], v], 1, 0])
      } else {
        map.setPaintProperty(desa.fillId, 'fill-color', WHITE)
        map.setPaintProperty(desa.lineId, 'line-opacity', 1)
        map.setPaintProperty(desa.labelId, 'text-opacity', 1)
      }
    }


    function clearOverlays(layer: Level2) {
      const lv = levels.find((x) => x.level === layer)!
      map.setFilter(lv.hoverFillId, eq(lv.keySelf, NONE))
      map.setFilter(lv.selectedFillId, eq(lv.keySelf, NONE))
    }

    function setSelectedOverlay2(level: Level2, keyField: string, keyValue: string) {
      const lv2 = levels.find((x) => x.level === level)!
      map.setFilter(lv2.selectedFillId, eq(keyField, keyValue))
      map.setFilter(lv2.hoverFillId, eq(keyField, NONE))
    }

    function setHoverOverlay(layer: Level2, keyValue: string) {
      const lv2 = levels.find((x) => x.level === layer)!
      map.setFilter(lv2.hoverFillId, eq(lv2.keySelf, keyValue))
      map.getCanvas().style.cursor = 'pointer'
    }

    function setupEventsType2(lv2: LevelCfg2) {
   
      map.on('mousemove', lv2.fillId, (e) => {
        const f = e.features?.[0]
        if (!f) return
        const raw = (f.properties as any)?.KDPKAB
        if (!raw) return
        setHoverOverlay('pemda', String(raw))
      })
      map.on('mouseleave', lv2.fillId, () => {
        map.setFilter(lv2.hoverFillId, eq(lv2.keySelf, NONE))
        map.getCanvas().style.cursor = ''
      })


      // dbl click = behavior lama (select + masking + zoom)
      map.on('dblclick', lv2.fillId, (e) => {
        const f = e.features?.[0]
        if (!f) return
        const props = f.properties as Record<string, any> | undefined
        if (!props) return

        const rawSelf = props?.[lv2.keySelf]
        if (!rawSelf) return
        const selfVal = String(rawSelf)

        const provName = props.WADMPR != null ? String(props.WADMPR) : null
        const pemdaName = props.WADMKK != null ? String(props.WADMKK) : null
        const kecName = props.WADMKC != null ? String(props.WADMKC) : null

        setSelectedOverlay2(lv2.level, lv2.keySelf, selfVal)

        if (lv2.level === 'provinsi') {
          selected.current.KDPPUM = selfVal
          selected.current.KDPKAB = null
         
          clearOverlays('pemda')
    
          clearOverlays('desa')

          onSelectedChange({
            KDPPUM: selfVal,
            KDPKAB: null,
          
            WADMPR: provName,
            WADMKK: null,
        
          })
        } else if (lv2.level === 'pemda') {
          selected.current.KDPKAB = selfVal
       
       
          clearOverlays('desa')

          onSelectedChange((p) => ({
            ...p,
            KDPKAB: selfVal,
            KDCPUM: null,
            WADMKK: pemdaName,
            WADMKC: null
          }))
        }

        applyMaskings2()

        const bbox = geomBbox((f as any).geometry)
        if (bbox) map.fitBounds(bbox, { padding: 40, duration: 900 })
        else map.easeTo({ center: e.lngLat, zoom: lv2.drillZoom, duration: 800 })
      })

      // ... click = buka panel kanan (tanpa mengubah drill)
      map.on('click', lv2.fillId, (e) => {
        e.preventDefault() // stop default map zoom double click
        const f = e.features?.[0]
        if (!f) return
        const props = f.properties as Record<string, any> | undefined
        if (!props) return

        const rawSelf = props?.[lv2.keySelf]
        if (!rawSelf) return
        const selfVal = String(rawSelf)

        const name =
        lv2.level === 'provinsi'
            ? props.WADMPR != null
              ? String(props.WADMPR)
              : null
            : lv2.level === 'pemda'
              ? props.WADMKK != null
                ? String(props.WADMKK)
                : null
              : lv2.level === 'desa'
                ? props.NAMOBJ != null
                  ? String(props.NAMOBJ)
                  : null
                : props.NAMOBJ != null
                  ? String(props.NAMOBJ)
                  : null

        onRegionDoubleClick({
          level: lv2.level,
          code: selfVal,
          name
        })
      })
    }

    map.on('load', () => {
      addSources()
      addLayers()

      selected.current = {
        KDPPUM: initialSelected.KDPPUM,
        KDPKAB: initialSelected.KDPKAB,
        
      }
      applyMaskings2()

      if (selected.current.KDPPUM) setSelectedOverlay2('provinsi', 'KDPPUM', selected.current.KDPPUM)
      if (selected.current.KDPKAB) setSelectedOverlay2('pemda', 'KDPKAB', selected.current.KDPKAB)
       

      // penting: matikan zoom default double click supaya event dblclick kita bersih
      map.doubleClickZoom.disable()

      levels.forEach(setupEventsType2)
    })

    map.on('error', (e) => console.error('Map error:', e))

    return () => {
      map.remove()
      mapInstance.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
}