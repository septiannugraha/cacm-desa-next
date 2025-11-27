import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET detail desa
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const desa = await prisma.ta_Desa.findUnique({
    where: { id: params.id },   // langsung pakai kolom id
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

  const body = await req.json()

  const updated = await prisma.ta_Desa.update({
    where: { id: params.id },   // langsung pakai kolom id
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

  await prisma.ta_Desa.delete({
    where: { id: params.id },   // langsung pakai kolom id
  })

  return NextResponse.json({ message: 'Desa deleted successfully' })
}