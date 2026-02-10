import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
 
    const kdPemda = session.user.pemdakd
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.trim() || ''

 
    const where: any = {
      Tahun: fiscalYear,
      Kd_Pemda: kdPemda,
      isSent: true, // ✅ hanya yang sudah dikirim
    }

    if (q) {
      where.OR = [
        { No_Atensi: { contains: q } },
        { Keterangan: { contains: q } },
      ]
    }

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
    return NextResponse.json(
      { error: 'Failed to fetch atensi terkirim' },
      { status: 500 }
    )
  }
}
