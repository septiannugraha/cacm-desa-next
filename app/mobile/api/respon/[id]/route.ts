import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { mobileAuthOptions } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(mobileAuthOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

     

  const kd_desa = session?.mobile?.kd_desa
  const tahun = session?.mobile?.tahun


    const { id } = await params

  
  if (!kd_desa || !tahun) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const row = await prisma.cACM_Atensi_Desa_Rinc.findFirst({
    where: { id: id, Kd_Desa:  kd_desa, Tahun:  tahun },
    select: { id: true, No_Bukti: true, NamaTL: true, KomenTL: true, NamaFile: true },
  })

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: row })

} catch (err) {
  console.error("Failed to fetch atensi desa:", err);
  return NextResponse.json({ error: "Failed to fetch atensi desa" }, { status: 500 });
}

}


export async function POST(_req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(mobileAuthOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })


  const kd_desa = session?.mobile?.kd_desa
  const tahun = session?.mobile?.tahun
  const username = session?.mobile?.username

    const { id } = await params

  
  if (!kd_desa || !tahun) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }


  const body = await _req.json().catch(() => ({}))
  const { NamaTL, KomenTL, NamaFile } = body as {
    NamaTL?: string
    KomenTL?: string
    NamaFile?: string
  }

  const updated = await prisma.cACM_Atensi_Desa_Rinc.update({
    where: { id: id },
    data: {
      NamaTL: NamaTL ?? null,
      KomenTL: KomenTL ?? null,
      NamaFile: NamaFile ?? null,

      StatusTL: 7,
      StatusVer: 2,
      update_at: new Date(),
      update_by:  username,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, data: updated })

} catch (err) {
  console.error("Failed to fetch atensi desa:", err);
  return NextResponse.json({ error: "Failed to fetch atensi desa" }, { status: 500 });
}
 
}
 