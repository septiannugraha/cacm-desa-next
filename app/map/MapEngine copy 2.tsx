'use client'

import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

import Breadcrumb from './components/Breadcrumb'
import MetricSelector from './components/MetricSelector'
import MapLegend from './components/MapLegend'
import StatisticsPanel from './components/StatisticsPanel2'
import type { BreadcrumbItem, MapLevel, MapMetric } from '@/types/map'

/* ===============================
   UI HELPERS
================================ */

function MapLoadingOverlay({ text = 'Memuat data...' }: { text?: string }) {
  return (
    <div className="absolute top-20 left-4 z-50 bg-white/90 border border-gray-200 rounded-xl px-3 py-2 shadow">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        {text}
      </div>
    </div>
  )
}

function ErrorOverlay({ title = 'Gagal memuat', message }: { title?: string; message: string }) {
  return (
    <div className="absolute top-20 left-4 z-50 bg-white border border-orange-200 rounded-xl px-3 py-2 shadow">
      <div className="flex items-start gap-2 text-sm">
        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-gray-600">{message}</div>
        </div>
      </div>
    </div>
  )
}

function YearSelector({
  selectedYear,
  onYearChange,
}: {
  selectedYear: number
  onYearChange: (y: number) => void
}) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-700">Tahun:</label>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="border rounded px-2 py-1 text-sm bg-white"
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

const LEVEL_ORDER: MapLevel[] = ['provinsi', 'pemda', 'kecamatan', 'desa']

function getNextLevelType1(level: MapLevel): MapLevel | null {
  const idx = LEVEL_ORDER.indexOf(level)
  if (idx === -1) return null
  return LEVEL_ORDER[idx + 1] ?? null
}

function getNextLevel(mode: Mode, currentLevel: MapLevel): MapLevel | null {
  if (mode === 'type1') return getNextLevelType1(currentLevel)
  // mode type2: pemda -> desa
  if (currentLevel === 'pemda') return 'desa'
  return null
}

function toDotCode(kd: string) {
  const raw = (kd || '').trim()
  if (/^\d{4}$/.test(raw)) return `${raw.slice(0, 2)}.${raw.slice(2, 4)}`
  if (/^\d{2}\.\d{2}$/.test(raw)) return raw
  return raw
}

/* =========================================================
   PAGE: Topbar + Breadcrumb + Tahun + Panel + Map switcher
========================================================= */
type Mode = 'type1' | 'type2'

export default function MapEngineDashboardPage() {
  const pemdaRaw = (process.env.NEXT_PUBLIC_PEMDA_CODE || '').trim()
  const pemdaNameEnv = (process.env.NEXT_PUBLIC_PEMDA_NAME || '').trim()
  const pemdaDot = useMemo(() => toDotCode(pemdaRaw), [pemdaRaw])

  const [mode, setMode] = useState<Mode>('type1')

  const [currentLevel, setCurrentLevel] = useState<MapLevel>('provinsi')
  const [currentCode, setCurrentCode] = useState<string>('')

  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { name: 'Indonesia', level: 'provinsi', code: '' },
  ])

  const [selectedMetric, setSelectedMetric] = useState<MapMetric>('budget')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const [selectedRegion, setSelectedRegion] = useState<{ code: string; name: string } | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const [mapData, setMapData] = useState<any[]>([])
  const [gradationData, setGradationData] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [errorData, setErrorData] = useState<string | null>(null)

  // fetch data mengikuti posisi navigasi (breadcrumb: level+code) dan filter tahun+metric
  useEffect(() => {
    const fetchMapData = async () => {
      setLoadingData(true)
      setErrorData(null)
      try {
        const res = await fetch(
          `/api/map/gradasi?tahun=${selectedYear}&level=${currentLevel}&kode=${encodeURIComponent(
            currentCode
          )}&metric=${encodeURIComponent(String(selectedMetric))}&mode=${encodeURIComponent(mode)}`
        )
        if (!res.ok) throw new Error('Gagal memuat data gradasi')
        const data = await res.json()
        setMapData(data.map_data || [])
        setGradationData(data.gradation_data || [])
      } catch (e: any) {
        setErrorData(e?.message || 'Gagal memuat data')
        setMapData([])
        setGradationData([])
      } finally {
        setLoadingData(false)
      }
    }
    fetchMapData()
  }, [selectedYear, currentLevel, currentCode, selectedMetric, mode])

  // click tunggal: buka panel detail region
  const handleRegionClick = (code: string, name: string) => {
    setSelectedRegion({ code, name })
    setIsPanelOpen(true)
  }

  // dblclick: drilldown level + update breadcrumb + trigger fetch data
  const handleRegionDoubleClick = (code: string, name: string) => {
    const next = getNextLevel(mode, currentLevel)
    if (!next) return

    setCurrentLevel(next)
    setCurrentCode(code)
    setBreadcrumb((prev) => [...prev, { name, level: next, code }])

    setSelectedRegion({ code, name })
    setIsPanelOpen(true)
  }

  const handleBreadcrumbNavigate = (index: number) => {
    const target = breadcrumb[index]
    setBreadcrumb(breadcrumb.slice(0, index + 1))
    setCurrentLevel(target.level)
    setCurrentCode(target.code)
    setSelectedRegion(null)
  }

  const handleModeChange = (m: Mode) => {
    setMode(m)
    // reset hanya saat pindah mode (bukan saat klik map)
    setCurrentLevel(m === 'type2' ? 'pemda' : 'provinsi')
    setCurrentCode('')
    setBreadcrumb([{ name: 'Indonesia', level: m === 'type2' ? 'pemda' : 'provinsi', code: '' }])
    setSelectedRegion(null)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      {/* TOP BAR (konsep awal) */}
      <div
        className="absolute top-2 left-2 right-2 z-40 h-16 backdrop-blur-md bg-blue-100/50
                   flex items-center px-6 rounded-xl shadow-lg"
      >
        <img src="/cacm_logo.png" alt="logo" className="h-8" />

        <div className="ml-6 flex-1">
          <Breadcrumb items={breadcrumb} onNavigate={handleBreadcrumbNavigate} />
        </div>

        {/* Mode switcher di topbar */}
        <div className="mr-4 flex items-center gap-2">
          <button
            onClick={() => handleModeChange('type1')}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
              mode === 'type1'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Mode A
          </button>
          <button
            onClick={() => handleModeChange('type2')}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
              mode === 'type2'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Mode B
          </button>
        </div>

        <div className="mr-4">
          <MetricSelector selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
        </div>

        <div className="mr-4">
          <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
        </div>

        <button onClick={() => setIsPanelOpen((p) => !p)} className="p-2 rounded-md hover:bg-gray-200">
          ☰
        </button>
      </div>

      {/* MAP AREA */}
      <div
        className={`absolute inset-0 z-10 transition-all duration-300 ${
          isPanelOpen ? 'pr-[500px]' : ''
        }`}
      >
        {loadingData && <MapLoadingOverlay text="Memuat data..." />}
        {errorData && <ErrorOverlay message={errorData} />}

        {mode === 'type1' ? (
          <MapEngineType1
            mapData={mapData}
            gradationData={gradationData}
            metric={selectedMetric}
            tahun={selectedYear}
            onRegionClick={handleRegionClick}
            onRegionDoubleClick={handleRegionDoubleClick}
          />
        ) : (
          <MapEngineType2
            mapData={mapData}
            gradationData={gradationData}
            metric={selectedMetric}
            tahun={selectedYear}
            onRegionClick={handleRegionClick}
            onRegionDoubleClick={handleRegionDoubleClick}
          />
        )}

        <div className="absolute bottom-6 right-6 bg-white shadow-lg rounded-lg p-3 z-30">
          <MapLegend metric={selectedMetric} breaks={null} />
        </div>
      </div>

      {/* RIGHT PANEL */}
      {isPanelOpen && (
        <div className="absolute top-10 bottom-0 right-0 z-50 w-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-2">
            <StatisticsPanel
              level={currentLevel}
              code={selectedRegion?.code || currentCode || null}
              regionName={selectedRegion?.name || pemdaNameEnv || `Pemda ${pemdaDot}`}
              tahun={selectedYear.toString()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* =========================================================
   MAP ENGINE TYPE 1
   - Warna & masking: konsep awal
   - click vs dblclick: dipisah pakai timer (anti “doubleclick tidak kebaca”)
========================================================= */

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
  onRegionClick,
  onRegionDoubleClick,
}: {
  mapData: any[]
  gradationData: any[]
  metric: MapMetric
  tahun: number
  onRegionClick: (code: string, name: string) => void
  onRegionDoubleClick: (code: string, name: string) => void
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  const selected = useRef<{ KDPPUM: string | null; KDPKAB: string | null; KDCPUM: string | null }>({
    KDPPUM: null,
    KDPKAB: null,
    KDCPUM: null,
  })

  const clickTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      center: [118, -2],
      zoom: 4,
      style: { version: 8, sources: {}, layers: [] },
    })
    mapInstance.current = map

    // ===== warna konsep awal =====
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
        selectedFillId: 'provinsi-selected',
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
        selectedFillId: 'pemda-selected',
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
        selectedFillId: 'kecamatan-selected',
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
        selectedFillId: 'desa-selected',
      },
    ]

    function addSources() {
      const origin = window.location.origin
      map.addSource('provinsi', {
        type: 'vector',
        tiles: [`${origin}/tiles/provinsi/{z}/{x}/{y}.pbf`],
        minzoom: 0,
        maxzoom: 6,
      })
      map.addSource('pemda', {
        type: 'vector',
        tiles: [`${origin}/tiles/pemda/{z}/{x}/{y}.pbf`],
        minzoom: 5,
        maxzoom: 9,
      })
      map.addSource('kecamatan', {
        type: 'vector',
        tiles: [`${origin}/tiles/kecamatan/{z}/{x}/{y}.pbf`],
        minzoom: 8,
        maxzoom: 11,
      })
      map.addSource('desa', {
        type: 'vector',
        tiles: [`${origin}/tiles/desa/{z}/{x}/{y}.pbf`],
        minzoom: 10,
        maxzoom: 14,
      })
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
          paint: { 'fill-color': WHITE, 'fill-opacity': 0.8 },
        })

        map.addLayer({
          id: lv.selectedFillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          filter: eq(lv.keySelf, NONE),
          paint: { 'fill-color': HOVER_YELLOW, 'fill-opacity': 0.9 },
        })

        map.addLayer({
          id: lv.hoverFillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          filter: eq(lv.keySelf, NONE),
          paint: { 'fill-color': HOVER_YELLOW, 'fill-opacity': 0.92 },
        })

        map.addLayer({
          id: lv.lineId,
          type: 'line',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          paint: { 'line-color': LINE, 'line-width': 0.9, 'line-opacity': 1 },
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
            'text-anchor': 'center',
          },
          paint: {
            'text-color': LABEL,
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.2,
            'text-opacity': 1,
          },
        })
      })
    }

    function geomBbox(geom: any): [[number, number], [number, number]] | null {
      if (!geom) return null
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity
      const scan = (coords: any) => {
        if (!coords) return
        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          const x = coords[0],
            y = coords[1]
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
      return [
        [minX, minY],
        [maxX, maxY],
      ]
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
        const raw = (f.properties as any)?.[lv.keySelf]
        if (!raw) return
        setHoverOverlay(lv.level, lv.keySelf, String(raw))
      })

      map.on('mouseleave', lv.fillId, () => {
        map.setFilter(lv.hoverFillId, eq(lv.keySelf, NONE))
        map.getCanvas().style.cursor = ''
      })

      // click: delay 220ms agar tidak bentrok dengan dblclick
      map.on('click', lv.fillId, (e) => {
        if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current)

        const f = e.features?.[0]
        if (!f) return
        const props = f.properties as any
        const selfVal = String(props?.[lv.keySelf] ?? '')
        if (!selfVal) return
        const label = String(props?.[lv.labelField] ?? props?.name ?? props?.NAMOBJ ?? selfVal)

        clickTimerRef.current = window.setTimeout(() => {
          onRegionClick(selfVal, label)

          setSelectedOverlay(lv.level, lv.keySelf, selfVal)

          if (lv.level === 'provinsi') {
            selected.current.KDPPUM = selfVal
            selected.current.KDPKAB = null
            selected.current.KDCPUM = null
            clearOverlays('pemda')
            clearOverlays('kecamatan')
            clearOverlays('desa')
          } else if (lv.level === 'pemda') {
            selected.current.KDPKAB = selfVal
            selected.current.KDCPUM = null
            clearOverlays('kecamatan')
            clearOverlays('desa')
          } else if (lv.level === 'kecamatan') {
            selected.current.KDCPUM = selfVal
            clearOverlays('desa')
          }

          applyMasking()

          const bbox = geomBbox((f as any).geometry)
          if (bbox) map.fitBounds(bbox, { padding: 40, duration: 900 })
          else map.easeTo({ center: e.lngLat, zoom: lv.drillZoom, duration: 800 })
        }, 220)
      })

      map.on('dblclick', lv.fillId, (e) => {
        e.preventDefault()
        if (clickTimerRef.current) {
          window.clearTimeout(clickTimerRef.current)
          clickTimerRef.current = null
        }

        const f = e.features?.[0]
        if (!f) return
        const props = f.properties as any
        const selfVal = String(props?.[lv.keySelf] ?? '')
        if (!selfVal) return
        const label = String(props?.[lv.labelField] ?? props?.name ?? props?.NAMOBJ ?? selfVal)

        onRegionDoubleClick(selfVal, label)

        const bbox = geomBbox((f as any).geometry)
        if (bbox) map.fitBounds(bbox, { padding: 40, duration: 900, maxZoom: lv.drillZoom + 1 })
        else map.easeTo({ center: e.lngLat, zoom: lv.drillZoom + 1, duration: 800 })
      })
    }

    map.on('load', () => {
      addSources()
      addLayers()
      selected.current = { KDPPUM: null, KDPKAB: null, KDCPUM: null }
      applyMasking()
      levels.forEach(setupEvents)
      map.doubleClickZoom.disable()
    })

    map.on('error', (e) => console.error('Map error:', e))

    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current)
      map.remove()
      mapInstance.current = null
    }
  }, [onRegionClick, onRegionDoubleClick])

  return <div ref={mapRef} className="w-full h-full" />
}

/* =========================================================
   MAP ENGINE TYPE 2 (pemda -> desa)
   - click vs dblclick sama seperti type1
========================================================= */

type Level2 = 'pemda' | 'desa'

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
  onRegionClick,
  onRegionDoubleClick,
}: {
  mapData: any[]
  gradationData: any[]
  metric: MapMetric
  tahun: number
  onRegionClick: (code: string, name: string) => void
  onRegionDoubleClick: (code: string, name: string) => void
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  const selected = useRef<{ KDPKAB: string | null }>({ KDPKAB: null })
  const clickTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      center: [118, -2],
      zoom: 4,
      style: { version: 8, sources: {}, layers: [] },
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
        level: 'pemda',
        source: 'pemda2',
        sourceLayer: 'pemda_clean',
        minzoom: 3,
        maxzoom: 8,
        keySelf: 'KDPKAB',
        labelField: 'WADMKK',
        labelSize: 12,
        drillZoom: 9,
        fillId: 't2-pemda-fill',
        lineId: 't2-pemda-line',
        labelId: 't2-pemda-label',
        hoverFillId: 't2-pemda-hover',
        selectedFillId: 't2-pemda-selected',
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
        selectedFillId: 't2-desa-selected',
      },
    ]

    function addSources() {
      const origin = window.location.origin
      if (SHOW_PROV_BORDER) {
        map.addSource('provinsi', {
          type: 'vector',
          tiles: [`${origin}/tiles/provinsi/{z}/{x}/{y}.pbf`],
          minzoom: 0,
          maxzoom: 6,
        })
      }
      map.addSource('pemda2', { type: 'vector', tiles: [`${origin}/tiles/pemda2/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 14 })
      map.addSource('desa2', { type: 'vector', tiles: [`${origin}/tiles/desa2/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 14 })
    }

    function addLayers() {
      if (SHOW_PROV_BORDER) {
        map.addLayer({
          id: 't2-prov-line',
          type: 'line',
          source: 'provinsi',
          'source-layer': 'provinsi_clean',
          maxzoom: 5,
          paint: { 'line-color': '#1f2937', 'line-width': 1 },
        })
      }

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
          paint: { 'fill-color': YELLOW, 'fill-opacity': 0.8 },
        })

        map.addLayer({
          id: lv.selectedFillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          filter: eq(lv.keySelf, NONE),
          paint: { 'fill-color': HOVER_YELLOW, 'fill-opacity': 0.9 },
        })

        map.addLayer({
          id: lv.hoverFillId,
          type: 'fill',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          filter: eq(lv.keySelf, NONE),
          paint: { 'fill-color': HOVER_YELLOW, 'fill-opacity': 0.92 },
        })

        map.addLayer({
          id: lv.lineId,
          type: 'line',
          source: lv.source,
          'source-layer': lv.sourceLayer,
          ...zMin,
          ...zMax,
          paint: { 'line-color': LINE, 'line-width': 0.9, 'line-opacity': 1 },
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
            'text-anchor': 'center',
          },
          paint: {
            'text-color': LABEL,
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.2,
            'text-opacity': 1,
          },
        })
      })
    }

    function geomBbox(geom: any): [[number, number], [number, number]] | null {
      if (!geom) return null
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity
      const scan = (coords: any) => {
        if (!coords) return
        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          const x = coords[0],
            y = coords[1]
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
      return [
        [minX, minY],
        [maxX, maxY],
      ]
    }

    function applyMaskingType2() {
      const pemda = levels.find((l) => l.level === 'pemda')!
      const desa = levels.find((l) => l.level === 'desa')!

      if (!selected.current.KDPKAB) {
        // sebelum pilih pemda, desa disembunyikan biar tidak rame
        map.setPaintProperty(desa.fillId, 'fill-color', WHITE)
        map.setPaintProperty(desa.lineId, 'line-opacity', 0)
        map.setPaintProperty(desa.labelId, 'text-opacity', 0)
        return
      }

      const v = selected.current.KDPKAB
      map.setPaintProperty(desa.fillId, 'fill-color', ['case', ['==', ['get', 'KDPKAB'], v], YELLOW, WHITE])
      map.setPaintProperty(desa.lineId, 'line-opacity', ['case', ['==', ['get', 'KDPKAB'], v], 1, 0])
      map.setPaintProperty(desa.labelId, 'text-opacity', ['case', ['==', ['get', 'KDPKAB'], v], 1, 0])
    }

    function clearOverlays(layer: Level2) {
      const lv = levels.find((x) => x.level === layer)!
      map.setFilter(lv.hoverFillId, eq(lv.keySelf, NONE))
      map.setFilter(lv.selectedFillId, eq(lv.keySelf, NONE))
    }

    function setSelectedOverlay(layer: Level2, keyValue: string) {
      const lv = levels.find((x) => x.level === layer)!
      map.setFilter(lv.selectedFillId, eq(lv.keySelf, keyValue))
      map.setFilter(lv.hoverFillId, eq(lv.keySelf, NONE))
    }

    function setHoverOverlay(layer: Level2, keyValue: string) {
      const lv = levels.find((x) => x.level === layer)!
      map.setFilter(lv.hoverFillId, eq(lv.keySelf, keyValue))
      map.getCanvas().style.cursor = 'pointer'
    }

    function setupEventsType2() {
      const pemda = levels.find((l) => l.level === 'pemda')!
      const desa = levels.find((l) => l.level === 'desa')!

      map.on('mousemove', pemda.fillId, (e) => {
        const f = e.features?.[0]
        if (!f) return
        const raw = (f.properties as any)?.KDPKAB
        if (!raw) return
        setHoverOverlay('pemda', String(raw))
      })
      map.on('mouseleave', pemda.fillId, () => {
        map.setFilter(pemda.hoverFillId, eq(pemda.keySelf, NONE))
        map.getCanvas().style.cursor = ''
      })

      map.on('click', pemda.fillId, (e) => {
        if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current)
        const f = e.features?.[0]
        if (!f) return
        const kdp = String((f.properties as any)?.KDPKAB ?? '')
        if (!kdp) return
        const nama = String((f.properties as any)?.WADMKK ?? (f.properties as any)?.name ?? kdp)

        clickTimerRef.current = window.setTimeout(() => {
          onRegionClick(kdp, nama)
          selected.current.KDPKAB = kdp
          setSelectedOverlay('pemda', kdp)
          clearOverlays('desa')
          applyMaskingType2()

          const bbox = geomBbox((f as any).geometry)
          if (bbox) map.fitBounds(bbox, { padding: 40, duration: 900, maxZoom: pemda.drillZoom })
          else map.easeTo({ center: e.lngLat, zoom: pemda.drillZoom, duration: 800 })
        }, 220)
      })

      map.on('dblclick', pemda.fillId, (e) => {
        e.preventDefault()
        if (clickTimerRef.current) {
          window.clearTimeout(clickTimerRef.current)
          clickTimerRef.current = null
        }

        const f = e.features?.[0]
        if (!f) return
        const kdp = String((f.properties as any)?.KDPKAB ?? '')
        if (!kdp) return
        const nama = String((f.properties as any)?.WADMKK ?? (f.properties as any)?.name ?? kdp)

        onRegionDoubleClick(kdp, nama)

        const bbox = geomBbox((f as any).geometry)
        if (bbox) map.fitBounds(bbox, { padding: 40, duration: 900, maxZoom: pemda.drillZoom + 1 })
        else map.easeTo({ center: e.lngLat, zoom: pemda.drillZoom + 1, duration: 800 })
      })

      map.on('mousemove', desa.fillId, (e) => {
        const f = e.features?.[0]
        if (!f) return
        const raw = (f.properties as any)?.KDEPUM
        if (!raw) return
        setHoverOverlay('desa', String(raw))
      })
      map.on('mouseleave', desa.fillId, () => {
        map.setFilter(desa.hoverFillId, eq(desa.keySelf, NONE))
        map.getCanvas().style.cursor = ''
      })

      map.on('click', desa.fillId, (e) => {
        if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current)

        const f = e.features?.[0]
        if (!f) return
        const kdepum = String((f.properties as any)?.KDEPUM ?? '')
        const nama = String((f.properties as any)?.NAMOBJ ?? (f.properties as any)?.nama ?? 'Desa')

        clickTimerRef.current = window.setTimeout(() => {
          onRegionClick(kdepum || '', nama)
          if (kdepum) setSelectedOverlay('desa', kdepum)

          const bbox = geomBbox((f as any).geometry)
          if (bbox) map.fitBounds(bbox, { padding: 40, duration: 900, maxZoom: desa.drillZoom })
          else map.easeTo({ center: e.lngLat, zoom: desa.drillZoom, duration: 800 })
        }, 220)
      })

      map.on('dblclick', desa.fillId, (e) => {
        e.preventDefault()
        if (clickTimerRef.current) {
          window.clearTimeout(clickTimerRef.current)
          clickTimerRef.current = null
        }
        const f = e.features?.[0]
        if (!f) return
        const kdepum = String((f.properties as any)?.KDEPUM ?? '')
        const nama = String((f.properties as any)?.NAMOBJ ?? (f.properties as any)?.nama ?? 'Desa')
        onRegionDoubleClick(kdepum || '', nama)
      })
    }

    map.on('load', () => {
      addSources()
      addLayers()
      selected.current = { KDPKAB: null }
      applyMaskingType2()
      setupEventsType2()
      map.doubleClickZoom.disable()
    })

    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current)
      map.remove()
      mapInstance.current = null
    }
  }, [onRegionClick, onRegionDoubleClick])

  return <div ref={mapRef} className="w-full h-full" />
}