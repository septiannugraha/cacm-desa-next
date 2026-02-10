import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(_req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
    const Tahun = (session.fiscalYear || new Date().getFullYear()).toString()
    const Kd_Pemda = session.user.pemdakd

    // EXEC dbo.SP_UpdateNomorHP @Tahun, @Kd_Pemda
    await prisma.$executeRaw(
      Prisma.sql`EXEC dbo.SP_UpdateNomorHP @Tahun=${Tahun}, @Kd_Pemda=${Kd_Pemda}`
    )

    return NextResponse.json({ success: true, message: 'Update Nomor HP berhasil.' })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || 'Failed to run SP_UpdateNomorHP' }, { status: 500 })
  }
}
