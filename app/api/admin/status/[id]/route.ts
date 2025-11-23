import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory store for status configurations (temporary implementation)
let statuses: Array<{
  id: string
  code: string
  name: string
  description: string
  color: string
  icon: string
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}> = [
  {
    id: '1',
    code: 'OPEN',
    name: 'Terbuka',
    description: 'Atensi baru yang belum ditangani',
    color: '#3b82f6',
    icon: 'inbox',
    order: 1,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    code: 'IN_PROGRESS',
    name: 'Sedang Ditangani',
    description: 'Atensi sedang dalam proses penanganan',
    color: '#f59e0b',
    icon: 'clock',
    order: 2,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    code: 'RESOLVED',
    name: 'Selesai',
    description: 'Atensi telah diselesaikan',
    color: '#10b981',
    icon: 'check-circle',
    order: 3,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    code: 'CLOSED',
    name: 'Ditutup',
    description: 'Atensi ditutup dan diarsipkan',
    color: '#6b7280',
    icon: 'archive',
    order: 4,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = statuses.find((s) => s.id === id)

    if (!status) {
      return NextResponse.json({ error: 'Status not found' }, { status: 404 })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to fetch status:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, description, color, icon, order, active } = body

    const index = statuses.findIndex((s) => s.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Status not found' }, { status: 404 })
    }

    statuses[index] = {
      ...statuses[index],
      code: code || statuses[index].code,
      name: name || statuses[index].name,
      description: description !== undefined ? description : statuses[index].description,
      color: color || statuses[index].color,
      icon: icon || statuses[index].icon,
      order: order !== undefined ? order : statuses[index].order,
      active: active !== undefined ? active : statuses[index].active,
      updatedAt: new Date(),
    }

    statuses.sort((a, b) => a.order - b.order)

    return NextResponse.json(statuses[index])
  } catch (error) {
    console.error('Failed to update status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const index = statuses.findIndex((s) => s.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Status not found' }, { status: 404 })
    }

    statuses.splice(index, 1)

    return NextResponse.json({ message: 'Status deleted successfully' })
  } catch (error) {
    console.error('Failed to delete status:', error)
    return NextResponse.json({ error: 'Failed to delete status' }, { status: 500 })
  }
}
