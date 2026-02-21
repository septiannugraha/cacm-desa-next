import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { mobileAuthOptions } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(mobileAuthOptions)
  if (!session?.kd_desa || !session?.tahun) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await prisma.cACM_Atensi_Desa_Rinc.findMany({
    where: {
      Kd_Desa: session.kd_desa,
      Tahun: session.tahun,
      StatusTL: { in: [6, 7] },
    },
    orderBy: [{ update_at: 'desc' }],
    select: {
      id: true,
      No_Atensi: true,
      No_Bukti: true,
      Tgl_Bukti: true,
      Ket_Bukti: true,
      Nilai_Dif: true,
      StatusTL: true,
      StatusVer: true,
    },
  })

  return NextResponse.json({ data: rows })
}
