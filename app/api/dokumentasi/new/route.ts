// File: app/api/dokumentasi/new/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const pemda = await prisma.ta_Pemda.findFirst({
      where: {  Kd_Pemda: session.user.pemdakd, Tahun: String(session.fiscalYear) },
      select: { id: true },
    })
    if (!pemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })

    const kdPemda = session.user.pemdakd
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    const body = await req.json()
    const { No_Atensi, Tgl_Atensi, Tgl_CutOff, Keterangan } = body

    if (!No_Atensi || !Tgl_Atensi || !Tgl_CutOff) {
      return NextResponse.json({ error: 'No_Atensi, Tgl_Atensi, Tgl_CutOff wajib' }, { status: 400 })
    }

    // Cek duplikat PK komposit
    const existing = await prisma.cACM_Atensi.findUnique({
      where: {
        Tahun_Kd_Pemda_No_Atensi: {
          Tahun: fiscalYear,
          Kd_Pemda: kdPemda,
          No_Atensi,
        },
      },
      select: { id: true },
    })
    if (existing) return NextResponse.json({ error: 'No_Atensi sudah ada' }, { status: 409 })

    const created = await prisma.cACM_Atensi.create({
      data: {
        id: crypto.randomUUID(), // sesuaikan jika DB auto-default
        id_Pemda: pemda.id,
        Tahun: fiscalYear,
        Kd_Pemda: kdPemda,
        No_Atensi,
        Tgl_Atensi: new Date(Tgl_Atensi),
        Tgl_CutOff: new Date(Tgl_CutOff),
        Keterangan: Keterangan || null,
        isSent: false,
        create_at: new Date(),
        create_by: session.user.username || session.user.email || null,
      },
    })

    return NextResponse.json({ message: 'Created', data: created }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
