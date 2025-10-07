import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = await prisma.cACM_Role.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            nip: true,
            active: true,
            lastLogin: true,
            pemdaId: true,
          },
        },
      },
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Parse permissions from JSON string
    const roleWithParsedPermissions = {
      ...role,
      permissions: (() => {
        try {
          return JSON.parse(role.permissions)
        } catch {
          return []
        }
      })(),
    }

    return NextResponse.json(roleWithParsedPermissions)
  } catch (error) {
    console.error('Failed to fetch role:', error)
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 })
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
    const { name, code, permissions } = body

    const updateData: any = {}

    if (name) updateData.name = name
    if (code) updateData.code = code
    if (permissions) {
      // Convert permissions array to JSON string
      updateData.permissions = JSON.stringify(permissions)
    }

    const role = await prisma.cACM_Role.update({
      where: { id: params.id },
      data: updateData,
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
      permissions: (() => {
        try {
          return JSON.parse(role.permissions)
        } catch {
          return []
        }
      })(),
    }

    return NextResponse.json(roleWithParsedPermissions)
  } catch (error) {
    console.error('Failed to update role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
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

    // Check if role has users
    const role = await prisma.cACM_Role.findUnique({
      where: { id: params.id },
      include: {
        users: true,
      },
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (role.users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with assigned users' },
        { status: 400 }
      )
    }

    await prisma.cACM_Role.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Failed to delete role:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
