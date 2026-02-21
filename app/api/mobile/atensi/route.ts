import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { mobileAuthOptions } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(mobileAuthOptions)
  if (!session?.kd_desa || !session?.tahun) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await prisma.cACM_Atensi_Desa.findMany({
    where: {
      Kd_Desa: session.kd_desa,
      Tahun: session.tahun,
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
