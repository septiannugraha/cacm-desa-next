import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = await prisma.cACM_Role.findMany({
      include: {
        CACM_User: {
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

    // Parse permission from JSON string
    const rolesWithParsedPermission = roles.map((role) => ({
      ...role,
      permission: (() => {
        try {
          return role.permission ? JSON.parse(role.permission) : []
        } catch {
          return []
        }
      })(),
    }))

    return NextResponse.json(rolesWithParsedPermission)
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
    const { name, code, permission } = body

    if (!name || !code || !permission) {
      return NextResponse.json(
        { error: 'Name, code, and permission are required' },
        { status: 400 }
      )
    }

    // Convert permission array to JSON string
    const permissionString = JSON.stringify(permission)

    const role = await prisma.cACM_Role.create({
      data: {
        id: randomUUID(),
        name,
        code,
        permission: permissionString,
      },
      include: {
        CACM_User: {
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

    // Parse permission back to array for response
    const roleWithParsedPermission = {
      ...role,
      permission: role.permission ? JSON.parse(role.permission) : [],
    }

    return NextResponse.json(roleWithParsedPermission, { status: 201 })
  } catch (error) {
    console.error('Failed to create role:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
