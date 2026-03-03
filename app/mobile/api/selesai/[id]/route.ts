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

    const rinc = await prisma.cACM_Atensi_Desa_Rinc.findFirst({
      where: {
        id,
        Tahun: fiscalYear,
        Kd_Desa: kdDesa,
        StatusTL: { in: [6, 7, 8, 9] },
        StatusVer: { in: [4, 5] },
      },
      select: {
        id: true,
        No_Bukti: true,
        Tgl_Bukti: true,
        Ket_Bukti: true,
        Nilai_Std: true,
        Nilai_Real: true,
        Nilai_Dif: true,
        NamaFile: true,
        NamaTL: true,
        KomenTL: true,
        StatusTL: true,
        StatusVer: true,
        HistoryAtensi: true,
      },
    })

    if (!rinc) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ rinc })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err?.message || 'Failed fetch detail selesai' },
      { status: 500 }
    )
  }
}