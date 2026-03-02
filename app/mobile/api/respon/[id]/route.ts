import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireMobileAuth } from '@/lib/get-mobile-session'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    // GET SINGLE RINCIAN BY ID
    // =========================
    const rinc = await prisma.cACM_Atensi_Desa_Rinc.findFirst({
      where: {
        id,
        Tahun: fiscalYear,
        Kd_Desa: kdDesa,
      },
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

 
        NamaTL: true,
        KomenTL: true,
      },
    })

    if (!rinc) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan atau bukan milik desa ini' },
        { status: 404 }
      )
    }

    // =========================
    // MASTER STATUS TL
    // =========================
    const statusTLList = await prisma.cACM_StatusTL.findMany({
      select: {
        StatusTL: true,
        Keterangan: true,
      },
    })

    // =========================
    // MASTER STATUS VER
    // =========================
    const statusVerList = await prisma.cACM_StatusVer.findMany({
      select: {
        StatusVer: true,
        Keterangan: true,
      },
    })

    // =========================
    // METADATA JENIS ATENSI
    // =========================
    const jnsAtensi = await prisma.cACM_Jns_Atensi.findUnique({
      where: { Jns_Atensi: rinc.Jns_Atensi },
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

    return NextResponse.json({
      tahun: fiscalYear,
      kdDesa,
      rinc,
      jnsAtensi,
      statusTLList,
      statusVerList,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch detail rincian' },
      { status: 500 }
    )
  }
}