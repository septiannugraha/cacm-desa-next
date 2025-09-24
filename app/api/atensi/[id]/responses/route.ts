import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createResponseSchema = z.object({
  content: z.string().min(1),
  type: z.enum(['COMMENT', 'ACTION', 'RESOLUTION', 'ESCALATION']).default('COMMENT'),
  isInternal: z.boolean().default(false),
  attachmentIds: z.array(z.string()).optional(),
})

// POST: Add response to Atensi
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createResponseSchema.parse(body)

    // Check if atensi exists
    const atensi = await prisma.atensi.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        status: true,
        reportedById: true,
        assignedToId: true,
      },
    })

    if (!atensi) {
      return NextResponse.json(
        { error: 'Atensi not found' },
        { status: 404 }
      )
    }

    // Create response with transaction
    const response = await prisma.$transaction(async (tx) => {
      // Create response
      const newResponse = await tx.response.create({
        data: {
          atensiId: params.id,
          content: validatedData.content,
          type: validatedData.type,
          isInternal: validatedData.isInternal,
          createdById: session.user.id,
        },
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
      })

      // Link attachments if provided
      if (validatedData.attachmentIds?.length) {
        await tx.attachment.updateMany({
          where: {
            id: { in: validatedData.attachmentIds },
          },
          data: {
            responseId: newResponse.id,
          },
        })
      }

      // Update atensi status if needed
      let newStatus = atensi.status
      if (validatedData.type === 'RESOLUTION' && atensi.status !== 'RESOLVED') {
        newStatus = 'RESOLVED'
        await tx.atensi.update({
          where: { id: params.id },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
          },
        })
      } else if (atensi.status === 'OPEN') {
        newStatus = 'IN_PROGRESS'
        await tx.atensi.update({
          where: { id: params.id },
          data: { status: 'IN_PROGRESS' },
        })
      }

      // Create activity log
      await tx.activity.create({
        data: {
          atensiId: params.id,
          action: 'response_added',
          details: JSON.stringify({
            type: validatedData.type,
            isInternal: validatedData.isInternal,
          }),
          performedById: session.user.id,
        },
      })

      // Create notifications
      const notifyUsers = new Set<string>()

      // Notify reporter
      if (atensi.reportedById !== session.user.id) {
        notifyUsers.add(atensi.reportedById)
      }

      // Notify assigned user
      if (atensi.assignedToId && atensi.assignedToId !== session.user.id) {
        notifyUsers.add(atensi.assignedToId)
      }

      if (notifyUsers.size > 0 && !validatedData.isInternal) {
        await tx.notification.createMany({
          data: Array.from(notifyUsers).map(userId => ({
            type: 'response_added',
            title: 'Tanggapan Baru',
            message: `Tanggapan baru pada atensi "${atensi.title}"`,
            data: JSON.stringify({ atensiId: params.id }),
            userId,
          })),
        })
      }

      return newResponse
    })

    return NextResponse.json({
      message: 'Tanggapan berhasil ditambahkan',
      data: response,
    })
  } catch (error) {
    console.error('Error creating response:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}