// File: app/api/dokumentasi/[id]/kirim/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ ubah jadi Promise
) {
  try {
    const { id } = await params // ✅ wajib di-await
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ambil selected values dari body
    let body: any = null
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const selectedJnsAtensiRaw = body?.selectedJnsAtensi
    if (!Array.isArray(selectedJnsAtensiRaw)) {
      return NextResponse.json({ error: 'Jenis atensi harus berupa array number' }, { status: 400 })
    }

    // normalisasi -> array number unik
    const selectedJnsAtensi = Array.from(
      new Set(
        selectedJnsAtensiRaw
          .map((x: any) => Number(x))
          .filter((n: number) => Number.isFinite(n))
      )
    )

    if (selectedJnsAtensi.length === 0) {
      return NextResponse.json({ error: 'Jenis atensi tidak boleh kosong' }, { status: 400 })
    }
 
    const kdPemda = session.user.pemdakd
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    const atensi = await prisma.cACM_Atensi.findUnique({
      where: { id }, // ✅ pakai id yang sudah di-await
      select: { id: true, Tahun: true, Kd_Pemda: true, No_Atensi: true, isSent: true },
    })
    if (!atensi) return NextResponse.json({ error: 'Atensi tidak ditemukan' }, { status: 404 })

    // Guard scope
    if (atensi.Tahun !== fiscalYear || atensi.Kd_Pemda !== kdPemda) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (atensi.isSent === true) {
      return NextResponse.json({ error: 'Atensi sudah dikirim' }, { status: 409 })
    }

    const Nama =
      (session.user as any)?.username ||
      (session.user as any)?.name ||
      session.user.email ||
      'system'

    const Tahun = atensi.Tahun
    const Kd_Pemda = atensi.Kd_Pemda
    const No_Atensi = atensi.No_Atensi

    // ✅ eksekusi 3 query sesuai VB dalam 1 transaction
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw(
        Prisma.sql`
          UPDATE CACM_Atensi_Desa_Rinc
          SET
            StatusTL = 4,
            StatusVer = 1,
            HistoryAtensi = dbo.AddHistoryAtensiToJson(HistoryAtensi, ${Nama}, 4, 1, CURRENT_TIMESTAMP)
          WHERE
            Tahun = ${Tahun}
            AND Kd_Pemda = ${Kd_Pemda}
            AND No_Atensi = ${No_Atensi}
            AND Jns_Atensi IN (${Prisma.join(selectedJnsAtensi)})
        `
      )

      await tx.$executeRaw(
        Prisma.sql`
          UPDATE CACM_Atensi_Desa_Rinc
          SET
            StatusTL = 3,
            StatusVer = 4,
            HistoryAtensi = dbo.AddHistoryAtensiToJson(HistoryAtensi, ${Nama}, 3, 4, CURRENT_TIMESTAMP)
          WHERE
            Tahun = ${Tahun}
            AND Kd_Pemda = ${Kd_Pemda}
            AND No_Atensi = ${No_Atensi}
            AND Jns_Atensi NOT IN (${Prisma.join(selectedJnsAtensi)})
        `
      )

      await tx.$executeRaw(
        Prisma.sql`
          UPDATE CACM_Atensi
          SET isSent = 1
          WHERE Tahun = ${Tahun}
            AND Kd_Pemda = ${Kd_Pemda}
            AND No_Atensi = ${No_Atensi}
        `
      )
    })

    return NextResponse.json({ message: 'Atensi berhasil dikirim' })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || 'Gagal saat kirim atensi' }, { status: 500 })
  }
}
