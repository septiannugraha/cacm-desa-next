import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params.id

    const peran = await prisma.cACM_Peran.findFirst({
  where: {
    Peran: {
      equals: id,
      mode: 'insensitive'   // ← FIX TERPENTING
    }
  },
})


    if (!peran) return NextResponse.json({ error: 'Peran tidak ditemukan' }, { status: 404 })

    return NextResponse.json(peran)
  } catch (error) {
    console.error('Failed to fetch peran by id:', error)
    return NextResponse.json({ error: 'Failed to fetch peran' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params.id
    const body = await request.json()
    // Hanya perbolehkan update Keterangan dan Menu (jika perlu, bisa tambah Peran rename dengan logika tambahan)
    const { Keterangan, Menu } = body

    const updated = await prisma.cACM_Peran.update({
      where: {
        Peran: {
          equals: id,
          mode: 'insensitive'
        }
      }
,
      data: {
        Keterangan: Keterangan ?? undefined,
        Menu: Menu ?? undefined,
      },
      select: {
        Peran: true,
        Keterangan: true,
        Menu: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Failed to update peran:', error)
    // jika error karena tidak ditemukan
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Peran tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update peran' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params.id

    await prisma.cACM_Peran.delete({
      where: {
        Peran: {
          equals: id,
          mode: 'insensitive'
        }
      }
,
    })

    return NextResponse.json({ message: 'Peran dihapus' }, { status: 200 })
  } catch (error: any) {
    console.error('Failed to delete peran:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Peran tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete peran' }, { status: 500 })
  }
}
