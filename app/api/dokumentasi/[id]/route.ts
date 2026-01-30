// File: app/api/dokumentasi/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const row = await prisma.cACM_Atensi.findUnique({ where: { id: params.id } })
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: row })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch detail' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { idx: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { id: true, code: true },
    })
    if (!pemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })

    const kdPemda = pemda.code.substring(0, 4)
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    const current = await prisma.cACM_Atensi.findUnique({ where: { id: params.idx } })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Guard scope
    if (current.Kd_Pemda !== kdPemda || current.Tahun !== fiscalYear) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { Tgl_Atensi, Tgl_CutOff, Keterangan } = body

    const updated = await prisma.cACM_Atensi.update({
      where: { id: params.idx },
      data: {
        Tgl_Atensi: Tgl_Atensi ? new Date(Tgl_Atensi) : undefined,
        Tgl_CutOff: Tgl_CutOff ? new Date(Tgl_CutOff) : undefined,
        Keterangan: Keterangan !== undefined ? (Keterangan || null) : undefined,
        update_at: new Date(),
        update_by: session.user.username || session.user.email || null,
      },
    })

    return NextResponse.json({ message: 'Updated', data: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
