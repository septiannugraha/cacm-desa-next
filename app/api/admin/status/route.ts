import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory store for status configurations (temporary implementation)
// In production, this should use a proper Prisma model
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(statuses)
  } catch (error) {
    console.error('Failed to fetch statuses:', error)
    return NextResponse.json({ error: 'Failed to fetch statuses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, description, color, icon, order, active } = body

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      )
    }

    const newStatus = {
      id: Date.now().toString(),
      code,
      name,
      description: description || '',
      color: color || '#3b82f6',
      icon: icon || 'circle',
      order: order || statuses.length + 1,
      active: active !== undefined ? active : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    statuses.push(newStatus)
    statuses.sort((a, b) => a.order - b.order)

    return NextResponse.json(newStatus, { status: 201 })
  } catch (error) {
    console.error('Failed to create status:', error)
    return NextResponse.json({ error: 'Failed to create status' }, { status: 500 })
  }
}
