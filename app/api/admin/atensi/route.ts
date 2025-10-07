import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const pemdaId = searchParams.get('pemdaId')
    const villageId = searchParams.get('villageId')
    const fiscalYear = searchParams.get('fiscalYear')

    const where: any = {}

    if (status) where.status = status
    if (priority) where.priority = priority
    if (pemdaId) where.pemdaId = pemdaId
    if (villageId) where.villageId = villageId
    if (fiscalYear) where.fiscalYear = parseInt(fiscalYear)

    const atensiList = await prisma.cACM_Atensi.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        village: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        pemda: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(atensiList)
  } catch (error) {
    console.error('Failed to fetch atensi:', error)
    return NextResponse.json({ error: 'Failed to fetch atensi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      code,
      title,
      description,
      categoryId,
      priority,
      status,
      villageId,
      pemdaId,
      fiscalYear,
      amount,
      accountCode,
      reportedById,
      assignedToId,
      dueDate,
    } = body

    if (!code || !title || !description || !categoryId || !villageId || !pemdaId || !fiscalYear || !reportedById) {
      return NextResponse.json(
        { error: 'Required fields: code, title, description, categoryId, villageId, pemdaId, fiscalYear, reportedById' },
        { status: 400 }
      )
    }

    const atensi = await prisma.cACM_Atensi.create({
      data: {
        code,
        title,
        description,
        categoryId,
        priority: priority || 'MEDIUM',
        status: status || 'OPEN',
        villageId,
        pemdaId,
        fiscalYear: parseInt(fiscalYear),
        amount: amount ? parseFloat(amount) : null,
        accountCode: accountCode || null,
        reportedById,
        assignedToId: assignedToId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        village: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        pemda: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json(atensi, { status: 201 })
  } catch (error) {
    console.error('Failed to create atensi:', error)
    return NextResponse.json({ error: 'Failed to create atensi' }, { status: 500 })
  }
}
