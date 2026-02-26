import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory store sementara untuk StatusTL
let statuses: Array<{
  StatusTL: number
  Keterangan?: string
}> = [
  { StatusTL: 1, Keterangan: 'Atensi baru' },
  { StatusTL: 2, Keterangan: 'Sedang ditangani' },
  { StatusTL: 3, Keterangan: 'Selesai' },
  { StatusTL: 4, Keterangan: 'Ditutup' },
]

// GET by StatusTL
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const idx = parseInt( id)
    const status = statuses.find((s) => s.StatusTL === idx)

    if (!status) {
      return NextResponse.json({ error: 'StatusTL not found' }, { status: 404 })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to fetch StatusTL:', error)
    return NextResponse.json({ error: 'Failed to fetch StatusTL' }, { status: 500 })
  }
}

// CREATE
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { StatusTL, Keterangan } = body

    const exists = statuses.find((s) => s.StatusTL === StatusTL)
    if (exists) {
      return NextResponse.json({ error: 'StatusTL already exists' }, { status: 400 })
    }

    const newStatus = { StatusTL, Keterangan }
    statuses.push(newStatus)

    return NextResponse.json(newStatus, { status: 201 })
  } catch (error) {
    console.error('Failed to create StatusTL:', error)
    return NextResponse.json({ error: 'Failed to create StatusTL' }, { status: 500 })
  }
}

// UPDATE
export async function PUT(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const idx = parseInt( id)

    const body = await _req.json()
    const { Keterangan } = body

    const index = statuses.findIndex((s) => s.StatusTL === idx)
    if (index === -1) {
      return NextResponse.json({ error: 'StatusTL not found' }, { status: 404 })
    }

    statuses[index] = {
      ...statuses[index],
      Keterangan: Keterangan ?? statuses[index].Keterangan,
    }

    return NextResponse.json(statuses[index])
  } catch (error) {
    console.error('Failed to update StatusTL:', error)
    return NextResponse.json({ error: 'Failed to update StatusTL' }, { status: 500 })
  }
}

// DELETE
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const idx = parseInt( id)
    const index = statuses.findIndex((s) => s.StatusTL === idx)

    if (index === -1) {
      return NextResponse.json({ error: 'StatusTL not found' }, { status: 404 })
    }

    statuses.splice(index, 1)

    return NextResponse.json({ message: 'StatusTL deleted successfully' })
  } catch (error) {
    console.error('Failed to delete StatusTL:', error)
    return NextResponse.json({ error: 'Failed to delete StatusTL' }, { status: 500 })
  }
}