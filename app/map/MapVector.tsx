"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

export default function MapVector() {

  const mapContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {

    if (!mapContainer.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,

      center: [118, -2],
      zoom: 5,

      style: {
        version: 8,

        sources: {

          desa: {
            type: "vector",

            tiles: [
              `${window.location.origin}/tiles/desa/{z}/{x}/{y}.pbf`
            ],

            minzoom: 4,
            maxzoom: 14
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
              "fill-opacity": 0.55
            }
          },

          {
            id: "desa-border",

            type: "line",

            source: "desa",

            "source-layer": "desa_clean",

            paint: {
              "line-color": "#1e3a8a",
              "line-width": 1
            }
          }

        ]
      }
    })


    map.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    )


    map.on("load", () => {

      map.on("mousemove", "desa-fill", (e) => {

        if (!e.features?.length) return

        map.getCanvas().style.cursor = "pointer"

      })

      map.on("mouseleave", "desa-fill", () => {

        map.getCanvas().style.cursor = ""

      })

    })


    return () => {
      map.remove()
    }

  }, [])


  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh"
      }}
    />
  )

}