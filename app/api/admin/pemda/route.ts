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

    const pemda = await prisma.cACM_Pemda.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(pemda)
  } catch (error) {
    console.error('Failed to fetch pemda:', error)
    return NextResponse.json({ error: 'Failed to fetch pemda' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, level, parentId } = body

    const pemda = await prisma.cACM_Pemda.create({
      data: {
        name,
        code,
        level,
        parentId: parentId || null,
      }
    })

    return NextResponse.json(pemda, { status: 201 })
  } catch (error) {
    console.error('Failed to create pemda:', error)
    return NextResponse.json({ error: 'Failed to create pemda' }, { status: 500 })
  }
}
