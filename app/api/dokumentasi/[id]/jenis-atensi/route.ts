// File: app/api/dokumentasi/[id]/jenis-atensi/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ params = Promise
) {
  try {
    const { id } = await params // ✅ WAJIB di-await
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
 
    const kdPemda = session.user.pemdakd
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    const atensi = await prisma.cACM_Atensi.findUnique({
      where: { id }, // ✅ sekarang aman
      select: { Tahun: true, Kd_Pemda: true, No_Atensi: true },
    })
    if (!atensi) {
      return NextResponse.json({ error: 'Atensi not found' }, { status: 404 })
    }

    // Guard scope
    if (atensi.Tahun !== fiscalYear || atensi.Kd_Pemda !== kdPemda) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ambil Jns_Atensi unik dari CACM_Atensi_Desa_Rinc
    const uniq = await prisma.cACM_Atensi_Desa_Rinc.findMany({
      where: {
        Tahun: atensi.Tahun,
        Kd_Pemda: atensi.Kd_Pemda,
        No_Atensi: atensi.No_Atensi,
      },
      select: { Jns_Atensi: true },
      distinct: ['Jns_Atensi'],
      orderBy: { Jns_Atensi: 'asc' },
    })

    const codes = uniq
      .map((u) => u.Jns_Atensi)
      .filter((x): x is number => x !== null && x !== undefined)

    if (codes.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Join ke master CACM_Jns_Atensi
    const master = await prisma.cACM_Jns_Atensi.findMany({
      where: { Jns_Atensi: { in: codes } },
      select: { Jns_Atensi: true, Nama_Atensi: true },
      orderBy: { Jns_Atensi: 'asc' },
    })

    // Pastikan urutan & mapping konsisten
    const map = new Map(master.map((m) => [Number(m.Jns_Atensi), m]))

    const data = codes.map((c) => ({
      Jns_Atensi: Number(c),
      Nama_Atensi: map.get(Number(c))?.Nama_Atensi ?? null,
    }))

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch jenis atensi' },
      { status: 500 }
    )
  }
}
