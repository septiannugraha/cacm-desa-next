'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const tabs = ['Data Umum', 'APBDes', 'Potensi'] as const
type Tab = (typeof tabs)[number]

export default function MobileProfilPage() {
  const [tab, setTab] = useState<Tab>('Data Umum')

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {tabs.map((t) => (
          <Button
            key={t}
            variant={tab === t ? 'default' : 'outline'}
            className="rounded-xl"
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <div className="text-sm font-semibold">{tab}</div>
          <div className="text-xs text-slate-500 mt-1">Konten sementara dikosongkan.</div>
        </CardContent>
      </Card>
    </div>
  )
}
