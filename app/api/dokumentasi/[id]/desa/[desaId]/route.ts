// File: app/api/dokumentasi/[id]/desa/[desaId]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; desaId: string }> }
) {
  try {
    const { id, desaId } = await params

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })
    if (!pemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })

    const kdPemda = pemda.code.substring(0, 4)
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    // Guard: atensi scope
    const atensi = await prisma.cACM_Atensi.findUnique({
      where: { id },
      select: { id: true, Tahun: true, Kd_Pemda: true, No_Atensi: true },
    })
    if (!atensi) return NextResponse.json({ error: 'Atensi not found' }, { status: 404 })
    if (atensi.Tahun !== fiscalYear || atensi.Kd_Pemda !== kdPemda) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Guard: desa harus milik atensi tsb
    const desa = await prisma.cACM_Atensi_Desa.findUnique({
      where: { id: desaId },
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
      },
    })
    if (!desa) return NextResponse.json({ error: 'Atensi desa not found' }, { status: 404 })
    if (desa.id_Atensi !== id) {
      return NextResponse.json({ error: 'Mismatch atensi-desa' }, { status: 400 })
    }


    // Master Status TL
    const statusTLList = await prisma.cACM_StatusTL.findMany({
      select: {
        StatusTL: true,
        Keterangan: true,
      },
    })

    // Master Status Ver
    const statusVerList = await prisma.cACM_StatusVer.findMany({
      select: {
        StatusVer: true,
        Keterangan: true,
      },
    })



    // Nama desa (opsional)
    const refDesa = await prisma.ref_Desa.findUnique({
      where: { Kd_Desa: desa.Kd_Desa },
      select: { Kd_Desa: true, Nama_Desa: true },
    })

    // Rincian
    const rinc = await prisma.cACM_Atensi_Desa_Rinc.findMany({
      where: { id_Atensi_Desa: desaId },
      orderBy: [{ Jns_Atensi: 'asc' }, { No_Bukti: 'asc' }],
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

    // Metadata jenis atensi
    const jnsList = Array.from(new Set(rinc.map((r) => r.Jns_Atensi)))
    const jnsAtensi = jnsList.length
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
      atensi,
      desa: { ...desa, Nm_Desa: refDesa?.Nama_Desa || null },
      rinc,
      jnsAtensi,
      statusTLList,
      statusVerList,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch detail' }, { status: 500 })
  }
}
