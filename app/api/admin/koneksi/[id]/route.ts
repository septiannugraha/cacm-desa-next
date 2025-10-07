import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory store for connections (temporary implementation)
// This should be shared with route.ts - in production use a proper data store
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = connections.find((c) => c.id === params.id)

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    return NextResponse.json(connection)
  } catch (error) {
    console.error('Failed to fetch connection:', error)
    return NextResponse.json({ error: 'Failed to fetch connection' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, host, port, database, username, status } = body

    const index = connections.findIndex((c) => c.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    connections[index] = {
      ...connections[index],
      name: name || connections[index].name,
      type: type || connections[index].type,
      host: host || connections[index].host,
      port: port || connections[index].port,
      database: database || connections[index].database,
      username: username !== undefined ? username : connections[index].username,
      status: status || connections[index].status,
      updatedAt: new Date(),
    }

    return NextResponse.json(connections[index])
  } catch (error) {
    console.error('Failed to update connection:', error)
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const index = connections.findIndex((c) => c.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    connections.splice(index, 1)

    return NextResponse.json({ message: 'Connection deleted successfully' })
  } catch (error) {
    console.error('Failed to delete connection:', error)
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
  }
}
