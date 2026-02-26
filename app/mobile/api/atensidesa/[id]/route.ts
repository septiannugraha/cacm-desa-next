import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { mobileAuthOptions } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'
 

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(mobileAuthOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

     

  const kd_desa = session?.mobile?.kd_desa
  const tahun = session?.mobile?.tahun

  if (!kd_desa || !tahun) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ✅ ambil params via Promise
  const { id } = await  params 

  const desa = await prisma.cACM_Atensi_Desa.findFirst({
    where: {
      id: id,
      Kd_Desa: kd_desa,
      Tahun: tahun,
      StatusTL: 5,
    },
    select: {
      id: true,
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

  if (!desa) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const rinc = await prisma.cACM_Atensi_Desa_Rinc.findMany({
    where: { id_Atensi_Desa: desa.id },
    orderBy: [
      { Jns_Atensi: 'asc' },
      { No_Bukti: 'asc' },
    ],
    select: {
      id: true,
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

  return NextResponse.json({ desa, rinc })
 

} catch (err) {
  console.error("Failed to fetch atensi desa:", err);
  return NextResponse.json({ error: "Failed to fetch atensi desa" }, { status: 500 });
}
}