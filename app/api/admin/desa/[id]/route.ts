import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function parseKey(id: string) {
  const [Tahun, Kd_Pemda, Kd_Desa] = id.split('__')
  return { Tahun, Kd_Pemda, Kd_Desa }
}

// GET detail desa
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { Tahun, Kd_Pemda, Kd_Desa } = parseKey(params.id)

  const desa = await prisma.ta_Desa.findUnique({
    where: { Tahun_Kd_Pemda_Kd_Desa: { Tahun, Kd_Pemda, Kd_Desa } },
    select: {
      Kd_Desa: true,
      Nama_Desa: true,
      Alamat: true,
      Ibukota: true,
      HP_Kades: true,
    },
  })

  if (!desa) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(desa)
}

// PUT update desa
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { Tahun, Kd_Pemda, Kd_Desa } = parseKey(params.id)
  const body = await req.json()

  const updated = await prisma.ta_Desa.update({
    where: { Tahun_Kd_Pemda_Kd_Desa: { Tahun, Kd_Pemda, Kd_Desa } },
    data: {
      Nama_Desa: body.Nama_Desa,
      Alamat: body.Alamat,
      Ibukota: body.Ibukota,
      HP_Kades: body.HP_Kades,
    },
    select: {
      Kd_Desa: true,
      Nama_Desa: true,
      Alamat: true,
      Ibukota: true,
      HP_Kades: true,
    },
  })

  return NextResponse.json(updated)
}

// DELETE desa
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { Tahun, Kd_Pemda, Kd_Desa } = parseKey(params.id)

  await prisma.ta_Desa.delete({
    where: { Tahun_Kd_Pemda_Kd_Desa: { Tahun, Kd_Pemda, Kd_Desa } },
  })

  return NextResponse.json({ message: 'Desa deleted successfully' })
}