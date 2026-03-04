"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

export default function MapVector(){

  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{

    const map = new maplibregl.Map({
      container: mapRef.current!,
      style:{
        version:8,
        sources:{
          desa:{
            type:"vector",
            tiles:["/tiles/desa/{z}/{x}/{y}.pbf"],
            minzoom:4,
            maxzoom:14
          }
        },
        layers:[
          {
            id:"desa-fill",
            type:"fill",
            source:"desa",
            "source-layer":"desa",
            paint:{
              "fill-color":"#3b82f6",
              "fill-opacity":0.6
            }
          },
          {
            id:"desa-border",
            type:"line",
            source:"desa",
            "source-layer":"desa",
            paint:{
              "line-color":"#1e3a8a",
              "line-width":1
            }
          }
        ]
      },
      center:[118,-2],
      zoom:5
    })

    return ()=>map.remove()

  },[])

  return (
    <div
      ref={mapRef}
      style={{width:"100%",height:"100vh"}}
    />
  )
}