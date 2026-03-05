'use client'

import dynamic from "next/dynamic"

const MapVector = dynamic(() => import("./MapVector"), {
  ssr: false
})

export default function MapClient() {
  return <MapVector />
}