import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: ambil daftar status (hanya StatusTL, Keterangan)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const statuses = await prisma.cACM_StatusTL.findMany({
      select: {
        StatusTL: true,
        Keterangan: true,
      },
      orderBy: { StatusTL: 'asc' },
    })

    return NextResponse.json(statuses)
  } catch (error) {
    console.error('Failed to fetch statuses:', error)
    return NextResponse.json({ error: 'Failed to fetch statuses' }, { status: 500 })
  }
}

// POST: tambah status baru (hanya StatusTL, Keterangan)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { StatusTL, Keterangan } = body

    if (StatusTL === undefined || StatusTL === null) {
      return NextResponse.json(
        { error: 'StatusTL wajib diisi' },
        { status: 400 }
      )
    }

    const newStatus = await prisma.cACM_StatusTL.create({
      data: {
        StatusTL,
        Keterangan,
      },
      select: {
        StatusTL: true,
        Keterangan: true,
      },
    })

    return NextResponse.json(newStatus, { status: 201 })
  } catch (error) {
    console.error('Failed to create status:', error)
    return NextResponse.json({ error: 'Failed to create status' }, { status: 500 })
  }
}