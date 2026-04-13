'use client'

import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import React, { useEffect, useMemo, useRef, useState } from 'react'

/** =========================================================
 *  SWITCHER WRAPPER
 *  ========================================================= */
type Mode = 'type1' | 'type2'

export default function MapEngineSwitcher() {
  const [mode, setMode] = useState<Mode>('type1')

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Mode Switcher */}
      <div
        style={{
          position: 'absolute',
          zIndex: 50,
          top: 12,
          left: 12,
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          padding: 10,
          display: 'flex',
          gap: 8,
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <button
          onClick={() => setMode('type1')}
          style={{
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.12)',
            background: mode === 'type1' ? '#2563eb' : '#fff',
            color: mode === 'type1' ? '#fff' : '#111827',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Mode A
        </button>

        <button
          onClick={() => setMode('type2')}
          style={{
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.12)',
            background: mode === 'type2' ? '#2563eb' : '#fff',
            color: mode === 'type2' ? '#fff' : '#111827',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Mode B
        </button>
      </div>

      {/* Remount map on mode change */}
      {mode === 'type1' ? <MapEngineType1 key="map-type1" /> : <MapEngineType2 key="map-type2" />}
    </div>
  )
}

/** =========================================================
 *  TYPE 1 (FIX) — nasional → prov → pemda → kec → desa
 *  (kode Anda dipertahankan)
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

function MapEngineType1() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  const selected = useRef<{ KDPPUM: string | null; KDPKAB: string | null; KDCPUM: string | null }>({
    KDPPUM: null,
    KDPKAB: null,
    KDCPUM: null
  })

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

      map.on('click', lv.fillId, (e) => {
        const f = e.features?.[0]
        if (!f) return
        const props = f.properties as Record<string, any> | undefined
        const rawSelf = props?.[lv.keySelf]
        if (!rawSelf) return
        const selfVal = String(rawSelf)

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
      })
    }

    map.on('load', () => {
      addSources()
      addLayers()
      selected.current = { KDPPUM: null, KDPKAB: null, KDCPUM: null }
      applyMasking()
      levels.forEach(setupEvents)
    })

    map.on('error', (e) => console.error('Map error:', e))

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
}

/** =========================================================
 *  TYPE 2 — nasional → pemda → desa
 *  - Tidak ada klik provinsi & kecamatan
 *  - Seleksi pemda -> masking desa by KDPKAB
 *  ========================================================= */
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

function MapEngineType2() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  // chain type2: pemda(KDPKAB) -> desa(KDPKAB)
  const selected = useRef<{ KDPKAB: string | null }>({ KDPKAB: null })

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

    // (opsional) tampilkan batas provinsi sebagai konteks (tanpa klik)
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
        selectedFillId: 't2-pemda-selected'
      },
      {
        level: 'desa',
        source: 'desa2',
        sourceLayer: 'desa_clean',
        minzoom: 8, // desa mulai muncul setelah pemda dipilih (dan zoom naik)
        maxzoom: 14,
        keySelf: 'KDEPUM',
        maskBy: 'KDPKAB', // <-- PENTING: desa harus punya field KDPKAB
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
      map.addSource('pemda2', { type: 'vector', tiles: [`${origin}/tiles/pemda2/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 14 })
      map.addSource('desa2', { type: 'vector', tiles: [`${origin}/tiles/desa2/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 14 })
    }

    function addLayers() {
      // provinsi border context
      if (SHOW_PROV_BORDER) {
        map.addLayer({
          id: 't2-prov-line',
          type: 'line',
          source: 'provinsi',
          'source-layer': 'provinsi_clean',
          maxzoom: 5,
          paint: { 'line-color': '#1f2937', 'line-width': 1 }
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

    function applyMaskingType2() {
      const pemda = levels.find((l) => l.level === 'pemda')!
      const desa = levels.find((l) => l.level === 'desa')!

      // pemda: kalau belum pilih, tampil semua kuning + label/line normal
      if (!selected.current.KDPKAB) {
        map.setPaintProperty(pemda.fillId, 'fill-color', YELLOW)
        map.setPaintProperty(pemda.lineId, 'line-opacity', 1)
        map.setPaintProperty(pemda.labelId, 'text-opacity', 1)

        // desa: sebelum pilih pemda, sembunyikan (biar ringan & tidak rame)
        map.setPaintProperty(desa.fillId, 'fill-color', WHITE)
        map.setPaintProperty(desa.lineId, 'line-opacity', 0)
        map.setPaintProperty(desa.labelId, 'text-opacity', 0)
        return
      }

      // kalau sudah pilih pemda: pemda lain dimasking (hilang)
      const v = selected.current.KDPKAB
      map.setPaintProperty(pemda.fillId, 'fill-color', ['case', ['==', ['get', 'KDPKAB'], v], YELLOW, WHITE])
      map.setPaintProperty(pemda.lineId, 'line-opacity', ['case', ['==', ['get', 'KDPKAB'], v], 1, 0])
      map.setPaintProperty(pemda.labelId, 'text-opacity', ['case', ['==', ['get', 'KDPKAB'], v], 1, 0])

      // desa dimasking by KDPKAB (desa harus punya KDPKAB)
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

      // hover pemda
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

      // click pemda -> select KDPKAB -> mask desa by KDPKAB -> zoom
      map.on('click', pemda.fillId, (e) => {
        const f = e.features?.[0]
        if (!f) return
        const kdp = String((f.properties as any)?.KDPKAB ?? '')
        if (!kdp) return

        selected.current.KDPKAB = kdp
        setSelectedOverlay('pemda', kdp)
        clearOverlays('desa') // reset overlay desa
        applyMaskingType2()

        const bbox = geomBbox((f as any).geometry)
        if (bbox) map.fitBounds(bbox, { padding: 40, duration: 900, maxZoom: pemda.drillZoom })
        else map.easeTo({ center: e.lngLat, zoom: pemda.drillZoom, duration: 800 })
      })

      // hover desa (hanya akan terasa jika desa sudah dimunculkan)
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

      // click desa -> zoom + popup
      map.on('click', desa.fillId, (e) => {
        const f = e.features?.[0]
        if (!f) return

        const kdepum = String((f.properties as any)?.KDEPUM ?? '')
        if (kdepum) setSelectedOverlay('desa', kdepum)

        const bbox = geomBbox((f as any).geometry)
        if (bbox) map.fitBounds(bbox, { padding: 40, duration: 900, maxZoom: desa.drillZoom })
        else map.easeTo({ center: e.lngLat, zoom: desa.drillZoom, duration: 800 })

        const nama = String((f.properties as any)?.NAMOBJ ?? (f.properties as any)?.nama ?? 'Desa')
        new maplibregl.Popup({ closeButton: true, closeOnClick: true })
          .setLngLat(e.lngLat)
          .setHTML(`<div style="font-size:13px"><b>${nama}</b><br/>KDEPUM: ${kdepum}</div>`)
          .addTo(map)
      })
    }

    map.on('load', () => {
      addSources()
      addLayers()
      selected.current = { KDPKAB: null }
      applyMaskingType2()
      setupEventsType2()
    })

    map.on('error', (e) => console.error('Map error:', e))

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
}