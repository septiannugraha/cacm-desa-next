'use client'

import dynamic from "next/dynamic"

const MapEngine = dynamic(() => import("./MapEngine"), { ssr: false })

export default function MapClient() {
  return <MapEngine />
}