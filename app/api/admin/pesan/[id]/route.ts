import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET by APIServer
export async function GET(
  request: Request,
  { params }: { params: { server: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const server = params.server

    const pesan = await prisma.cACM_TempPesan.findFirst({
      where: { APIServer: server },
      select: { APIServer: true, Pesan: true },
    })

    if (!pesan) return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 })

    return NextResponse.json(pesan)
  } catch (error) {
    console.error('Failed to fetch pesan:', error)
    return NextResponse.json({ error: 'Failed to fetch pesan' }, { status: 500 })
  }
}

// CREATE
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { APIServer, Pesan } = body

    const created = await prisma.cACM_TempPesan.create({
      data: {
        APIServer,
        Pesan,
      },
      select: { APIServer: true, Pesan: true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Failed to create pesan:', error)
    return NextResponse.json({ error: 'Failed to create pesan' }, { status: 500 })
  }
}

// UPDATE
export async function PUT(
  request: Request,
  { params }: { params: { server: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const server = params.server
    const body = await request.json()
    const { Pesan } = body

    const updated = await prisma.cACM_TempPesan.update({
      where: { APIServer: server },
      data: { Pesan: Pesan ?? undefined },
      select: { APIServer: true, Pesan: true },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Failed to update pesan:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update pesan' }, { status: 500 })
  }
}

// DELETE
export async function DELETE(
  request: Request,
  { params }: { params: { server: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const server = params.server

    await prisma.cACM_TempPesan.delete({
      where: { APIServer: server },
    })

    return NextResponse.json({ message: 'Pesan dihapus' }, { status: 200 })
  } catch (error: any) {
    console.error('Failed to delete pesan:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete pesan' }, { status: 500 })
  }
}