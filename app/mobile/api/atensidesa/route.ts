import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireMobileAuth } from '@/lib/get-mobile-session'

export async function GET() {
  const auth = await requireMobileAuth()

  // 🔐 otomatis 401 jika tidak ada session mobile
  if (!auth.ok) return auth.response

  const rows = await prisma.cACM_Atensi_Desa.findMany({
    where: {
      Kd_Desa: auth.kd_desa,
      Tahun: auth.tahun,
      StatusTL: 5,
    },
    orderBy: [{ No_Atensi: 'desc' }],
    select: {
      id: true,
      Tahun: true,
      Kd_Pemda: true,
      No_Atensi: true,
      Kd_Desa: true,
      Jlh_RF: true,
      Jlh_TL: true,
      StatusTL: true,
      StatusVer: true,
      update_at: true,
    },
  })

  return NextResponse.json({ data: rows })
}
