'use client'

import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function MobileTopbar() {
  const { data } = useSession()

  const namaDesa = (data as any)?.mobile?.nama_desa || 'Desa'
  const kdDesa = (data as any)?.mobile?.kd_desa || ''
  const tahun = (data as any)?.mobile?.tahun || ''

  return (
    <div className="sticky top-0 z-30">
      <div className="mx-auto max-w-md">
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 backdrop-blur border-b border-blue-200">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* ✅ logo diperbesar */}
              <div className="h-11 w-11 rounded-2xl bg-white shadow-sm border border-blue-200 flex items-center justify-center">
                <Image src="/cacm_logo.png" alt="CACM Desa" width={34} height={34} />
              </div>

              {/* ✅ judul = nama desa saja */}
              <div className="min-w-0 leading-tight">
                <div className="text-[15px] font-semibold text-slate-900 truncate">
                  {namaDesa}
                </div>
                <div className="text-[11px] text-blue-700/80 truncate">
                  {tahun ? `CACM Desa TA ${tahun}` : ''}
                </div>
              </div>
            </div>

            {/* ✅ tombol keluar gaya light-blue */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl border-blue-200 bg-white/70 hover:bg-white text-blue-700"
              onClick={() => signOut({ callbackUrl: '/mobile/login-desa' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
               
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
