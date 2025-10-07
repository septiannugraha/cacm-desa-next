import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory store for connections (temporary implementation)
// In production, this should use a proper Prisma model
let connections: Array<{
  id: string
  name: string
  type: string
  host: string
  port: number
  database: string
  username: string
  status: 'active' | 'inactive'
  lastChecked: Date
  createdAt: Date
  updatedAt: Date
}> = [
  {
    id: '1',
    name: 'Main Database',
    type: 'SQL Server',
    host: 'localhost',
    port: 1433,
    database: 'Siswaskeudes_Baru',
    username: 'sa',
    status: 'active',
    lastChecked: new Date(),
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

    return NextResponse.json(connections)
  } catch (error) {
    console.error('Failed to fetch connections:', error)
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, host, port, database, username, status } = body

    if (!name || !type || !host || !database) {
      return NextResponse.json(
        { error: 'Name, type, host, and database are required' },
        { status: 400 }
      )
    }

    const newConnection = {
      id: Date.now().toString(),
      name,
      type,
      host,
      port: port || 1433,
      database,
      username: username || '',
      status: status || 'inactive',
      lastChecked: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    connections.push(newConnection)

    return NextResponse.json(newConnection, { status: 201 })
  } catch (error) {
    console.error('Failed to create connection:', error)
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
  }
}
