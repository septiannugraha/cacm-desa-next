import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireMobileAuth } from '@/lib/get-mobile-session'

export async function GET() {
  try {
    const auth = await requireMobileAuth()
    if (!auth.ok) return auth.response

    const session = auth.session
    const kdDesa = session?.mobile?.kd_desa
    const fiscalYear =
      (session?.mobile?.tahun || new Date().getFullYear()).toString()

    if (!kdDesa) {
      return NextResponse.json(
        { error: 'Kd Desa tidak ditemukan' },
        { status: 400 }
      )
    }

    // =========================
    // RINCIAN ATENSI SELESAI
    // StatusTL IN (6,7,8,9)
    // StatusVer IN (4,5)
    // =========================
    const rinc = await prisma.cACM_Atensi_Desa_Rinc.findMany({
      where: {
        Tahun: fiscalYear,
        Kd_Desa: kdDesa,
        StatusTL: {
          in: [6, 7, 8, 9],
        },
        StatusVer: {
          in: [4, 5],
        },
      },
      orderBy: [
        { Jns_Atensi: 'asc' },
        { No_Bukti: 'asc' },
      ],
      select: {
        id: true,
        id_Atensi_Desa: true,
        Tahun: true,
        Kd_Pemda: true,
        No_Atensi: true,
        Kd_Desa: true,

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

        isRedflag: true,
        StatusTL: true,
        StatusVer: true,
        NamaFile: true,
      },
    })

    // =========================
    // MASTER STATUS TL (6,7,8,9)
    // =========================
    const statusTLList = await prisma.cACM_StatusTL.findMany({
      where: {
        StatusTL: { in: [6, 7, 8, 9] },
      },
      select: {
        StatusTL: true,
        Keterangan: true,
      },
    })

    // =========================
    // MASTER STATUS VER (4,5)
    // =========================
    const statusVerList = await prisma.cACM_StatusVer.findMany({
      where: {
        StatusVer: { in: [4, 5] },
      },
      select: {
        StatusVer: true,
        Keterangan: true,
      },
    })

    // =========================
    // METADATA JENIS ATENSI
    // =========================
    const jnsList = Array.from(new Set(rinc.map(r => r.Jns_Atensi)))

    const jnsAtensi =
      jnsList.length > 0
        ? await prisma.cACM_Jns_Atensi.findMany({
            where: { Jns_Atensi: { in: jnsList } },
            select: {
              Jns_Atensi: true,
              Nama_Atensi: true,
              Singkatan: true,
              Tipe: true,
              Satuan: true,
              Std_Caption: true,
              Real_Caption: true,
              Dif_Caption: true,
            },
          })
        : []

    return NextResponse.json({
      tahun: fiscalYear,
      kdDesa,
      total: rinc.length,
      rinc,
      jnsAtensi,
      statusTLList,
      statusVerList,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch data selesai' },
      { status: 500 }
    )
  }
}