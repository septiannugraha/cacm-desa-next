'use client'

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { mapStyle } from "./mapStyle"

export default function MapEngine() {

  const mapRef = useRef<maplibregl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {

    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [118, -2.5],
      zoom: 4,
      pitch: 0,
      bearing: 0,
      antialias: true
    })

    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl(), "top-right")

    map.on("load", () => {

      /* hover highlight */

      map.addLayer({
        id: "desa-hover",
        type: "line",
        source: "desa",
        "source-layer": "desa",
        paint: {
          "line-color": "#f59e0b",
          "line-width": 2
        },
        filter: ["==", "kode", ""]
      })

      map.on("mousemove", "desa-fill", (e) => {

        if (!e.features?.length) return

        const kode = e.features[0].properties?.kode

        map.setFilter("desa-hover", ["==", "kode", kode])

      })

      map.on("mouseleave", "desa-fill", () => {
        map.setFilter("desa-hover", ["==", "kode", ""])
      })

      /* click event */

      map.on("click", "desa-fill", (e) => {

        if (!e.features?.length) return

        const f = e.features[0]

        const name = f.properties?.name
        const kode = f.properties?.kode

        const center = e.lngLat

        map.flyTo({
          center,
          zoom: 10,
          duration: 1200
        })

        console.log("clicked:", name, kode)

      })

    })

    return () => map.remove()

  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute"
      }}
    />
  )

}