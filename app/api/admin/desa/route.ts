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

    const villages = await prisma.cACM_Village.findMany({
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(villages)
  } catch (error) {
    console.error('Failed to fetch villages:', error)
    return NextResponse.json({ error: 'Failed to fetch villages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, pemdaId } = body

    if (!name || !code || !pemdaId) {
      return NextResponse.json(
        { error: 'Name, code, and pemdaId are required' },
        { status: 400 }
      )
    }

    const village = await prisma.cACM_Village.create({
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

    return NextResponse.json(village, { status: 201 })
  } catch (error) {
    console.error('Failed to create village:', error)
    return NextResponse.json({ error: 'Failed to create village' }, { status: 500 })
  }
}
