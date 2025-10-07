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

    const atensi = await prisma.cACM_Atensi.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
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
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
        responses: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: {
            performedBy: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!atensi) {
      return NextResponse.json({ error: 'Atensi not found' }, { status: 404 })
    }

    return NextResponse.json(atensi)
  } catch (error) {
    console.error('Failed to fetch atensi:', error)
    return NextResponse.json({ error: 'Failed to fetch atensi' }, { status: 500 })
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
    const {
      title,
      description,
      categoryId,
      priority,
      status,
      amount,
      accountCode,
      assignedToId,
      dueDate,
      resolvedAt,
      closedAt,
    } = body

    const updateData: any = {}

    if (title) updateData.title = title
    if (description) updateData.description = description
    if (categoryId) updateData.categoryId = categoryId
    if (priority) updateData.priority = priority
    if (status) updateData.status = status
    if (amount !== undefined) updateData.amount = amount ? parseFloat(amount) : null
    if (accountCode !== undefined) updateData.accountCode = accountCode
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (resolvedAt !== undefined) updateData.resolvedAt = resolvedAt ? new Date(resolvedAt) : null
    if (closedAt !== undefined) updateData.closedAt = closedAt ? new Date(closedAt) : null

    const atensi = await prisma.cACM_Atensi.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(atensi)
  } catch (error) {
    console.error('Failed to update atensi:', error)
    return NextResponse.json({ error: 'Failed to update atensi' }, { status: 500 })
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

    await prisma.cACM_Atensi.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Atensi deleted successfully' })
  } catch (error) {
    console.error('Failed to delete atensi:', error)
    return NextResponse.json({ error: 'Failed to delete atensi' }, { status: 500 })
  }
}
