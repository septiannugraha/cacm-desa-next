'use client'

import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function MobileTopbar() {
  const { data } = useSession()

  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/cacm_logo.png" alt="CACM Desa" width={28} height={28} />
          <div className="leading-tight">
            <div className="text-sm font-semibold">CACM Desa</div>
            <div className="text-[11px] text-slate-500 truncate max-w-[210px]">
              {data?.nama_desa ? `${data.nama_desa} (${data.kd_desa})` : 'Mobile'}
              {data?.tahun ? ` • ${data.tahun}` : ''}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/mobile/login-siskeudes' })}
        >
          Keluar
        </Button>
      </div>
    </div>
  )
}
