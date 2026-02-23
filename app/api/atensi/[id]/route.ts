// File: app/api/atensi/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
    const kdPemda = session.user.pemdakd
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    // cari atensi by id (untuk dapat Tahun, Kd_Pemda, No_Atensi)
    const atensi = await prisma.cACM_Atensi.findUnique({
      where: { id },
      select: { id: true, Tahun: true, Kd_Pemda: true, No_Atensi: true, isSent: true },
    })
    if (!atensi) return NextResponse.json({ error: 'Atensi not found' }, { status: 404 })

    // guard scope
    if (atensi.Tahun !== fiscalYear || atensi.Kd_Pemda !== kdPemda) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
 

        const rows = await prisma.$queryRaw<
        Array<{
            RowHandle: number
            id: string
            Tahun: string
            Kd_Pemda: string
            No_Atensi: string
            Kd_Desa: string
            Nama_Desa: string | null
            Jlh_RF: number | null
            Jlh_TL: number | null
            Persen: number | null
            HP_Kades: string | null
            Pesan: string | null
        }>
        >(
        Prisma.sql`
            SELECT
            CAST(ROW_NUMBER() OVER (ORDER BY A.Kd_Desa ASC) AS INT) AS RowHandle,  -- ✅ CAST BIGINT -> INT
            A.id,
            A.Tahun,
            A.Kd_Pemda,
            A.No_Atensi,
            A.Kd_Desa,
            B.Nama_Desa,
            CAST(A.Jlh_RF AS INT) AS Jlh_RF,                                       -- ✅ optional, aman
            CAST(A.Jlh_TL AS INT) AS Jlh_TL,                                       -- ✅ optional, aman
            CAST(
                (CAST(A.Jlh_TL AS FLOAT) / NULLIF(CAST(A.Jlh_RF AS FLOAT), 0)) * 100
                AS FLOAT
            ) AS Persen,                                                           -- ✅ FLOAT (bukan BigInt)
            B.HP_Kades,
            dbo.KirimPesanWA(A.id, B.Nama_Desa, B.HP_Kades, A.Tahun) AS Pesan
            FROM CACM_Atensi_Desa A
            LEFT OUTER JOIN Ta_Desa B
            ON A.Tahun = B.Tahun
            AND A.Kd_Pemda = B.Kd_Pemda
            AND A.Kd_Desa = B.Kd_Desa
            CROSS JOIN (SELECT TOP 1 * FROM CACM_TempPesan) C                         -- ✅ cegah duplikasi kalau tabel > 1 row
            WHERE
            A.Tahun = ${atensi.Tahun}
            AND A.Kd_Pemda = ${atensi.Kd_Pemda}
            AND A.No_Atensi = ${atensi.No_Atensi}
            ORDER BY A.Kd_Desa ASC
        `
        )

        return NextResponse.json({
        atensi: {
            id: atensi.id,
            Tahun: atensi.Tahun,
            Kd_Pemda: atensi.Kd_Pemda,
            No_Atensi: atensi.No_Atensi,
            isSent: atensi.isSent ?? null,
        },
        data: rows || [],
        })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch atensi desa' }, { status: 500 })
  }
}
