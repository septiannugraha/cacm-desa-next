'use client'

import maplibregl from "maplibre-gl"
import { useEffect, useRef } from "react"

export default function MapVector() {

  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    if (!mapRef.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          desa: {
            type: "vector",
            tiles: [`${window.location.origin}/tiles/desa/{z}/{x}/{y}.pbf`]
          }
        },
        layers: [
          {
            id: "desa-fill",
            type: "fill",
            source: "desa",
            "source-layer": "desa_clean",
            paint: {
              "fill-color": "#3b82f6",
              "fill-opacity": 0.5
            }
          }
        ]
      },
      center: [118, -2],
      zoom: 4
    })

    return () => map.remove()

  }, [])

  return <div ref={mapRef} className="w-full h-full" />
}