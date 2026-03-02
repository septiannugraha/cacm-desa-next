import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/* ======================================================
   GET → Ambil daftar rincian yang siap diverifikasi
====================================================== */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const kdPemda = session.user.pemdakd
    const fiscalYear =
      (session.fiscalYear || new Date().getFullYear()).toString()

    const data = await prisma.cACM_Atensi_Desa_Rinc.findMany({
      where: {
        Tahun: fiscalYear,
        Kd_Pemda: kdPemda,
        StatusTL: { in: [6, 7, 8, 9] },
        StatusVer: { in: [2, 3, 4, 5] },
      },
      orderBy: [
        { Kd_Desa: 'asc' },
        { No_Atensi: 'asc' },
        { No_Bukti: 'asc' },
      ],
      select: {
        id: true,
        id_Atensi_Desa: true,
        Kd_Desa: true,
        No_Atensi: true,
        Jns_Atensi: true,
        No_Bukti: true,
        Tgl_Bukti: true,
        Ket_Bukti: true,
        Tgl_Std: true,
        Tgl_Real: true,
        Tgl_Dif: true,
        Nilai_Std: true,
        Nilai_Real: true,
        Nilai_Prc: true,
        Nilai_Dif: true,
        KomenTL: true,
        NamaTL: true,
        NamaFile: true,
        StatusTL: true,
        StatusVer: true,
        HistoryAtensi: true,
      },
    })

    /* ===== Tambahkan Nama Desa ===== */
    const desaCodes = [...new Set(data.map(d => d.Kd_Desa))]

    const desaList = await prisma.ref_Desa.findMany({
      where: { Kd_Desa: { in: desaCodes } },
      select: { Kd_Desa: true, Nama_Desa: true },
    })

    const desaMap = new Map(
      desaList.map(d => [d.Kd_Desa, d.Nama_Desa])
    )

    const enrichedData = data.map(d => ({
      ...d,
      Nama_Desa: desaMap.get(d.Kd_Desa) || d.Kd_Desa,
    }))

    /* ===== Ambil metadata jenis atensi ===== */
    const jnsCodes = [...new Set(data.map(d => d.Jns_Atensi))]

    const jnsAtensi = await prisma.cACM_Jns_Atensi.findMany({
      where: { Jns_Atensi: { in: jnsCodes } },
      select: {
        Jns_Atensi: true,
        Nama_Atensi: true,
        Singkatan: true,
        Tipe: true,
        Std_Caption: true,
        Real_Caption: true,
        Dif_Caption: true,
      },
    })

    const statusVerList = await prisma.cACM_StatusVer.findMany({
      where: { StatusVer: { in: [3, 4, 5] } },
      select: {
        StatusVer: true,
        Keterangan: true,
      },
    })

    return NextResponse.json({
      total: enrichedData.length,
      data: enrichedData,
      jnsAtensi,
      statusVerList,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

/* ======================================================
   POST → Kirim hasil verifikasi
====================================================== */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, namaVer, komenVer, statusVer } = body

    if (!id || !namaVer || !statusVer) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const kdPemda = session.user.pemdakd
    const fiscalYear =
      (session.fiscalYear || new Date().getFullYear()).toString()

    let newStatusTL = 8
    if (Number(statusVer) === 5) newStatusTL = 9

    const result = await prisma.$transaction(async (tx) => {

      const check = await tx.cACM_Atensi_Desa_Rinc.findFirst({
        where: {
          id,
          Kd_Pemda: kdPemda,
          Tahun: fiscalYear,
        },
        select: {
          id: true,
          id_Atensi_Desa: true,
        },
      })

      if (!check)
        throw new Error(
          'Data tidak ditemukan atau tidak berhak diverifikasi'
        )

      await tx.$executeRaw`
        UPDATE CACM_Atensi_Desa_Rinc
        SET
          StatusVer = ${Number(statusVer)},
          StatusTL = ${newStatusTL},
          NamaVer = ${namaVer},
          KomenVer = ${komenVer ?? ''},
          HistoryAtensi = dbo.AddHistoryAtensiToJson(
            HistoryAtensi,
            ${namaVer},
            ${newStatusTL},
            ${Number(statusVer)},
            CURRENT_TIMESTAMP
          )
        WHERE id = ${id}
      `

      /* ===== Update Header Jika Semua Final ===== */
      const remaining = await tx.cACM_Atensi_Desa_Rinc.count({
        where: {
          id_Atensi_Desa: check.id_Atensi_Desa,
          StatusVer: { not: 5 },
        },
      })

      if (remaining === 0) {
        await tx.$executeRaw`
          UPDATE CACM_Atensi_Desa
          SET StatusVer = 5,
              StatusTL = 9
          WHERE id = ${check.id_Atensi_Desa}
        `
      }

      return true
    })

    return NextResponse.json({
      success: true,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Failed to update verification' },
      { status: 500 }
    )
  }
}