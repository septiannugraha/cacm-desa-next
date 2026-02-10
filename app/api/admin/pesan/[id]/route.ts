// File: app/api/admin/pesan/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

async function safeReadJson(req: Request) {
  const ct = req.headers.get('content-type') || ''
  if (!ct.includes('application/json')) return null
  try {
    return await req.json()
  } catch {
    return null
  }
}

// GET detail by id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const pesan = await prisma.cACM_TempPesan.findUnique({
      where: { id }, // ✅ PK id
      select: { id: true, APIServer: true, Pesan: true },
    })

    if (!pesan) return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 })
    return NextResponse.json(pesan)
  } catch (error) {
    console.error('Failed to fetch pesan:', error)
    return NextResponse.json({ error: 'Failed to fetch pesan' }, { status: 500 })
  }
}

// PUT update by id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await safeReadJson(req)
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })

    const { APIServer, Pesan } = body

    const updated = await prisma.cACM_TempPesan.update({
      where: { id }, // ✅ PK id
      data: {
        APIServer: APIServer !== undefined ? (APIServer ?? null) : undefined,
        Pesan: Pesan !== undefined ? (Pesan ?? null) : undefined,
      },
      select: { id: true, APIServer: true, Pesan: true },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Failed to update pesan:', error)

    // prisma not found
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 })
    }

    // unique constraint etc.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update pesan' }, { status: 500 })
  }
}

// DELETE by id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await prisma.cACM_TempPesan.delete({
      where: { id }, // ✅ PK id
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
