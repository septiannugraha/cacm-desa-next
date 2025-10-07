import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = await prisma.cACM_Role.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            active: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Parse permissions from JSON string
    const rolesWithParsedPermissions = roles.map((role) => ({
      ...role,
      permissions: (() => {
        try {
          return JSON.parse(role.permissions)
        } catch {
          return []
        }
      })(),
    }))

    return NextResponse.json(rolesWithParsedPermissions)
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, permissions } = body

    if (!name || !code || !permissions) {
      return NextResponse.json(
        { error: 'Name, code, and permissions are required' },
        { status: 400 }
      )
    }

    // Convert permissions array to JSON string
    const permissionsString = JSON.stringify(permissions)

    const role = await prisma.cACM_Role.create({
      data: {
        name,
        code,
        permissions: permissionsString,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            active: true,
          },
        },
      },
    })

    // Parse permissions back to array for response
    const roleWithParsedPermissions = {
      ...role,
      permissions: JSON.parse(role.permissions),
    }

    return NextResponse.json(roleWithParsedPermissions, { status: 201 })
  } catch (error) {
    console.error('Failed to create role:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
