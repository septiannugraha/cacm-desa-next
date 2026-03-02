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
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const kdPemda = session.user.pemdakd
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    // ===============================
    // 1️⃣ Cek Atensi Utama
    // ===============================
    const atensi = await prisma.cACM_Atensi.findUnique({
      where: { id },
      select: { Tahun: true, Kd_Pemda: true, No_Atensi: true, id: true },
    })

    if (!atensi)
      return NextResponse.json({ error: 'Atensi not found' }, { status: 404 })

    if (atensi.Tahun !== fiscalYear || atensi.Kd_Pemda !== kdPemda) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ===============================
    // 2️⃣ Ambil Desa + Rincian Jenis Atensi
    // ===============================
    const rows = await prisma.cACM_Atensi_Desa.findMany({
      where: { id_Atensi: id },
      orderBy: [{ Kd_Desa: 'asc' }],
      select: {
        id: true,
        id_Atensi: true,
        Tahun: true,
        Kd_Pemda: true,
        No_Atensi: true,
        Kd_Desa: true,
        Jlh_RF: true,
        Jlh_TL: true,
        StatusTL: true,
        StatusVer: true,
        CACM_Atensi_Desa_Rinc_CACM_Atensi_Desa_Rinc_id_Atensi_DesaToCACM_Atensi_Desa: {
          select: {
            CACM_Jns_Atensi: {
              select: { Singkatan: true },
            },
          },
        },
      },
    })

    // ===============================
    // 3️⃣ Ambil Nama Desa
    // ===============================
    const kdDesaList = rows.map((r) => r.Kd_Desa)

    const refDesa =
      kdDesaList.length > 0
        ? await prisma.ref_Desa.findMany({
            where: { Kd_Desa: { in: kdDesaList } },
            select: { Kd_Desa: true, Nama_Desa: true },
          })
        : []

    const mapNama = new Map(refDesa.map((d) => [d.Kd_Desa, d.Nama_Desa]))

    // ===============================
    // 4️⃣ Susun Data + Grouping Singkatan
    // ===============================
    const data = rows.map((r) => {
      const singkatanArr =
        r.CACM_Atensi_Desa_Rinc_CACM_Atensi_Desa_Rinc_id_Atensi_DesaToCACM_Atensi_Desa.map(
          (rr) => rr.CACM_Jns_Atensi.Singkatan
        )

      // 🔥 Hitung per jenis tanpa duplikasi
      const counter = singkatanArr.reduce<Record<string, number>>((acc, s) => {
        if (!s) return acc
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {})

      // 🔥 Format hasil
      const singkatanString =
        Object.keys(counter).length > 0
          ? Object.entries(counter)
              .map(([key, val]) => `${key} (${val})`)
              .join(', ')
          : null

      return {
        ...r,
        Nm_Desa: mapNama.get(r.Kd_Desa) || null,
        singkatanString,
      }
    })

    return NextResponse.json({ data, atensi })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: 'Failed to fetch desa detail' },
      { status: 500 }
    )
  }
}