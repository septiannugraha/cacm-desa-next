// File: app/api/dokumentasi/[id]/desa/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })
    if (!pemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })

    const kdPemda = pemda.code.substring(0, 4)
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    const atensi = await prisma.cACM_Atensi.findUnique({
      where: { id },
      select: { Tahun: true, Kd_Pemda: true, No_Atensi: true, id: true },
    })
    if (!atensi) return NextResponse.json({ error: 'Atensi not found' }, { status: 404 })
    if (atensi.Tahun !== fiscalYear || atensi.Kd_Pemda !== kdPemda) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1) Ambil desa atensi
    const rows = await prisma.cACM_Atensi_Desa.findMany({
      where: { id_Atensi: id },
      orderBy: [{ Kd_Desa: 'asc' }],
      select: {
        id: true, // desaId
        id_Atensi: true,
        Tahun: true,
        Kd_Pemda: true,
        No_Atensi: true,
        Kd_Desa: true,
        Jlh_RF: true,
        Jlh_TL: true,
        StatusTL: true,
        StatusVer: true,
      },
    })

    // 2) Ambil master nama desa dari Ref_Desa (batch by Kd_Desa)
    const kdDesaList = rows.map(r => r.Kd_Desa)
    const refDesa = kdDesaList.length
      ? await prisma.ref_Desa.findMany({
          where: { Kd_Desa: { in: kdDesaList } },
          select: {
            Kd_Desa: true,
            Nama_Desa: true, // <-- kalau field Anda beda, sesuaikan (mis: Nama_Desa)
          },
        })
      : []

    const mapNama = new Map(refDesa.map(d => [d.Kd_Desa, d.Nama_Desa]))

    const data = rows.map(r => ({
      ...r,
      Nm_Desa: mapNama.get(r.Kd_Desa) || null,
    }))

    return NextResponse.json({ data, atensi })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch desa detail' }, { status: 500 })
  }
}
