import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAtensiSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_RESPONSE', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  assignedToId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
})

// GET: Get single Atensi
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const atensi = await prisma.atensi.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        village: {
          include: {
            pemda: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
        responses: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                username: true,
                role: true,
              },
            },
            attachments: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
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
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
      },
    })

    if (!atensi) {
      return NextResponse.json(
        { error: 'Atensi not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    const canAccess =
      session.user.roleCode === 'ADMIN' ||
      (session.user.roleCode === 'INSPECTOR' && atensi.pemdaId === session.user.pemdaId) ||
      atensi.reportedById === session.user.id ||
      atensi.assignedToId === session.user.id

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Parse JSON strings back to objects for activities
    const processedAtensi = {
      ...atensi,
      activities: atensi.activities.map(activity => ({
        ...activity,
        details: activity.details ? JSON.parse(activity.details) : null,
      })),
    }

    return NextResponse.json(processedAtensi)
  } catch (error) {
    console.error('Error fetching atensi:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update Atensi
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAtensiSchema.parse(body)

    // Get current atensi
    const currentAtensi = await prisma.atensi.findUnique({
      where: { id: params.id },
    })

    if (!currentAtensi) {
      return NextResponse.json(
        { error: 'Atensi not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const canEdit =
      session.user.roleCode === 'ADMIN' ||
      (session.user.roleCode === 'INSPECTOR' && currentAtensi.pemdaId === session.user.pemdaId) ||
      currentAtensi.assignedToId === session.user.id

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Update with transaction
    const updatedAtensi = await prisma.$transaction(async (tx) => {
      // Track changes for activity log
      const changes: Record<string, { from: string | null; to: string | null }> = {}
      if (validatedData.status && validatedData.status !== currentAtensi.status) {
        changes.status = { from: currentAtensi.status, to: validatedData.status }
      }
      if (validatedData.priority && validatedData.priority !== currentAtensi.priority) {
        changes.priority = { from: currentAtensi.priority, to: validatedData.priority }
      }
      if (validatedData.assignedToId !== undefined && validatedData.assignedToId !== currentAtensi.assignedToId) {
        changes.assignedTo = { from: currentAtensi.assignedToId, to: validatedData.assignedToId }
      }

      // Prepare update data
      const updateData: Record<string, unknown> = { ...validatedData }

      // Update resolved/closed timestamps
      if (validatedData.status === 'RESOLVED' && currentAtensi.status !== 'RESOLVED') {
        updateData.resolvedAt = new Date()
      } else if (validatedData.status === 'CLOSED' && currentAtensi.status !== 'CLOSED') {
        updateData.closedAt = new Date()
      }

      if (validatedData.dueDate !== undefined) {
        updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null
      }

      // Update Atensi
      const updated = await tx.atensi.update({
        where: { id: params.id },
        data: updateData,
        include: {
          category: true,
          village: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      })

      // Create activity log
      if (Object.keys(changes).length > 0) {
        await tx.activity.create({
          data: {
            atensiId: params.id,
            action: 'updated',
            details: JSON.stringify(changes),
            performedById: session.user.id,
          },
        })

        // Create notifications
        if (changes.assignedTo?.to) {
          await tx.notification.create({
            data: {
              type: 'assigned',
              title: 'Atensi Ditugaskan',
              message: `Anda telah ditugaskan untuk menangani atensi "${updated.title}"`,
              data: JSON.stringify({ atensiId: params.id }),
              userId: changes.assignedTo.to,
            },
          })
        }

        if (changes.status?.to === 'RESOLVED') {
          await tx.notification.create({
            data: {
              type: 'status_changed',
              title: 'Atensi Selesai',
              message: `Atensi "${updated.title}" telah diselesaikan`,
              data: JSON.stringify({ atensiId: params.id }),
              userId: currentAtensi.reportedById,
            },
          })
        }
      }

      return updated
    })

    return NextResponse.json({
      message: 'Atensi berhasil diperbarui',
      data: updatedAtensi,
    })
  } catch (error) {
    console.error('Error updating atensi:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete Atensi (soft delete by changing status)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete
    if (session.user.roleCode !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const atensi = await prisma.atensi.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })

    await prisma.activity.create({
      data: {
        atensiId: params.id,
        action: 'cancelled',
        performedById: session.user.id,
      },
    })

    return NextResponse.json({
      message: 'Atensi berhasil dibatalkan',
      data: atensi,
    })
  } catch (error) {
    console.error('Error deleting atensi:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}