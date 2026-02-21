import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { mobileAuthOptions } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { rincId: string } }) {
  const session = await getServerSession(mobileAuthOptions)
  if (!session?.kd_desa || !session?.tahun) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const row = await prisma.cACM_Atensi_Desa_Rinc.findFirst({
    where: { id: params.rincId, Kd_Desa: session.kd_desa, Tahun: session.tahun },
    select: { id: true, No_Bukti: true, NamaTL: true, KomenTL: true, NamaFile: true },
  })

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: row })
}

export async function POST(req: Request, { params }: { params: { rincId: string } }) {
  const session = await getServerSession(mobileAuthOptions)
  if (!session?.kd_desa || !session?.tahun || !session?.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { NamaTL, KomenTL, NamaFile } = body as {
    NamaTL?: string
    KomenTL?: string
    NamaFile?: string
  }

  const updated = await prisma.cACM_Atensi_Desa_Rinc.update({
    where: { id: params.rincId },
    data: {
      NamaTL: NamaTL ?? null,
      KomenTL: KomenTL ?? null,
      NamaFile: NamaFile ?? null,

      StatusTL: 7,
      StatusVer: 2,
      update_at: new Date(),
      update_by: session.username,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, data: updated })
}
