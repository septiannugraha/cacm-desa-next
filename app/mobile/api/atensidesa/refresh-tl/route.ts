import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { mobileAuthOptions } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(mobileAuthOptions)
  if (!session?.kd_desa || !session?.tahun) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    /**
     * TODO: ganti nama SP sesuai SQL Server kamu.
     * Misal: EXEC sp_refresh_tl @Kd_Desa='...', @Tahun='...'
     */
    await prisma.$executeRawUnsafe(
      `EXEC sp_refresh_tl @Kd_Desa='${session.kd_desa}', @Tahun='${session.tahun}'`
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to execute refresh SP' }, { status: 500 })
  }
}
