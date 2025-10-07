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

    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        children: true,
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    })

    if (!pemda) {
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    }

    return NextResponse.json(pemda)
  } catch (error) {
    console.error('Failed to fetch pemda:', error)
    return NextResponse.json({ error: 'Failed to fetch pemda' }, { status: 500 })
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
    const { name, code, level, parentId } = body

    const pemda = await prisma.cACM_Pemda.update({
      where: { id: params.id },
      data: {
        name,
        code,
        level,
        parentId: parentId || null,
      },
    })

    return NextResponse.json(pemda)
  } catch (error) {
    console.error('Failed to update pemda:', error)
    return NextResponse.json({ error: 'Failed to update pemda' }, { status: 500 })
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

    await prisma.cACM_Pemda.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Pemda deleted successfully' })
  } catch (error) {
    console.error('Failed to delete pemda:', error)
    return NextResponse.json({ error: 'Failed to delete pemda' }, { status: 500 })
  }
}
