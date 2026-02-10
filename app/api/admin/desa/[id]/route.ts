import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ==============================
// GET detail desa
// ==============================
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const desa = await prisma.ta_Desa.findUnique({
    where: { id }, // pakai PK id (UUID)
    select: {
      Kd_Desa: true,
      Nama_Desa: true,
      Alamat: true,
      Ibukota: true,
      HP_Kades: true,
    },
  })

  if (!desa) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(desa)
}

// ==============================
// PUT update desa
// ==============================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updated = await prisma.ta_Desa.update({
    where: { id },
    data: {
      Nama_Desa: body.Nama_Desa ?? null,
      Alamat: body.Alamat ?? null,
      Ibukota: body.Ibukota ?? null,
      HP_Kades: body.HP_Kades ?? null,
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

// ==============================
// DELETE desa
// ==============================
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.ta_Desa.delete({
    where: { id },
  })

  return NextResponse.json({ message: 'Desa deleted successfully' })
}
