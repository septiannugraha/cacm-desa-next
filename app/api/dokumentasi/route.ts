// File: app/api/dokumentasi/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })
    if (!pemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })

    const kdPemda = pemda.code.substring(0, 4)
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.trim() || ''
    const isSent = url.searchParams.get('isSent')

    const where: any = { Tahun: fiscalYear, Kd_Pemda: kdPemda }

    if (q) {
      where.OR = [
        { No_Atensi: { contains: q } },
        { Keterangan: { contains: q } },
      ]
    }

    if (isSent === 'true') where.isSent = true
    if (isSent === 'false') where.isSent = false

    const data = await prisma.cACM_Atensi.findMany({
      where,
      orderBy: { Tgl_Atensi: 'desc' },
      select: {
        id: true,
        Tahun: true,
        Kd_Pemda: true,
        No_Atensi: true,
        Tgl_Atensi: true,
        Tgl_CutOff: true,
        Keterangan: true,
        Jlh_Desa: true,
        Jlh_RF: true,
        Jlh_TL: true,
        isSent: true,
      },
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
