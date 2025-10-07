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

    const village = await prisma.cACM_Village.findUnique({
      where: { id: params.id },
      include: {
        pemda: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
          },
        },
        atensi: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            priority: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!village) {
      return NextResponse.json({ error: 'Village not found' }, { status: 404 })
    }

    return NextResponse.json(village)
  } catch (error) {
    console.error('Failed to fetch village:', error)
    return NextResponse.json({ error: 'Failed to fetch village' }, { status: 500 })
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
    const { name, code, pemdaId } = body

    const village = await prisma.cACM_Village.update({
      where: { id: params.id },
      data: {
        name,
        code,
        pemdaId,
      },
      include: {
        pemda: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
          },
        },
      },
    })

    return NextResponse.json(village)
  } catch (error) {
    console.error('Failed to update village:', error)
    return NextResponse.json({ error: 'Failed to update village' }, { status: 500 })
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

    await prisma.cACM_Village.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Village deleted successfully' })
  } catch (error) {
    console.error('Failed to delete village:', error)
    return NextResponse.json({ error: 'Failed to delete village' }, { status: 500 })
  }
}
