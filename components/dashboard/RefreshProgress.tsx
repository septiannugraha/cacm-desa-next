'use client'
import { useEffect, useState } from 'react'

export default function RefreshProgress({ Kd_Pemda, Tahun }: { Kd_Pemda: string; Tahun: string }) {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const key = `refresh_${Kd_Pemda}_${Tahun}`
    const saved = localStorage.getItem(key)
    if (saved) setStatus(saved)

    const interval = setInterval(async () => {
      const res = await fetch(`/api/dashboard/status?Kd_Pemda=${Kd_Pemda}&Tahun=${Tahun}`)
      const { status: newStatus } = await res.json()
      setStatus(newStatus)
      localStorage.setItem(key, newStatus)
      if (newStatus === 'completed' || newStatus === 'error') clearInterval(interval)
    }, 5000)

    return () => clearInterval(interval)
  }, [Kd_Pemda, Tahun])

  if (status === 'running') {
    return <div className="w-full h-1 bg-blue-500 animate-pulse mt-2" />
  }

  return null
}