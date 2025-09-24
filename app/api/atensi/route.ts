import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas
const createAtensiSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  categoryId: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  villageId: z.string(),
  fiscalYear: z.number().int(),
  amount: z.number().optional(),
  accountCode: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.string().optional(),
  priority: z.string().optional(),
  villageId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'priority', 'status', 'dueDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// GET: List Atensi with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const query = querySchema.parse(Object.fromEntries(searchParams))

    // Build where clause
    const where: any = {
      fiscalYear: session.fiscalYear,
    }

    // Role-based filtering
    if (session.user.roleCode === 'USER') {
      where.OR = [
        { reportedById: session.user.id },
        { assignedToId: session.user.id },
      ]
    } else if (session.user.roleCode === 'INSPECTOR' && session.user.pemdaId) {
      where.pemdaId = session.user.pemdaId
    }

    // Apply filters
    if (query.status) where.status = query.status
    if (query.priority) where.priority = query.priority
    if (query.villageId) where.villageId = query.villageId
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { code: { contains: query.search } },
        { description: { contains: query.search } },
      ]
    }

    // Execute query with pagination
    const [atensiList, totalCount] = await Promise.all([
      prisma.atensi.findMany({
        where,
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
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          _count: {
            select: {
              responses: true,
              attachments: true,
            },
          },
        },
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.atensi.count({ where }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / query.limit)

    return NextResponse.json({
      data: atensiList,
      meta: {
        total: totalCount,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasMore: query.page < totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching atensi:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create new Atensi
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAtensiSchema.parse(body)

    // Generate unique code
    const lastAtensi = await prisma.atensi.findFirst({
      where: { fiscalYear: validatedData.fiscalYear },
      orderBy: { createdAt: 'desc' },
    })

    const sequenceNumber = lastAtensi
      ? parseInt(lastAtensi.code.split('/')[0]) + 1
      : 1

    const code = `${sequenceNumber.toString().padStart(5, '0')}/ATENSI/${validatedData.fiscalYear}`

    // Get village's pemda
    const village = await prisma.village.findUnique({
      where: { id: validatedData.villageId },
      include: { pemda: true },
    })

    if (!village) {
      return NextResponse.json(
        { error: 'Village not found' },
        { status: 400 }
      )
    }

    // Create Atensi with transaction
    const atensi = await prisma.$transaction(async (tx) => {
      // Create Atensi
      const newAtensi = await tx.atensi.create({
        data: {
          code,
          title: validatedData.title,
          description: validatedData.description,
          categoryId: validatedData.categoryId,
          priority: validatedData.priority,
          villageId: validatedData.villageId,
          pemdaId: village.pemdaId,
          fiscalYear: validatedData.fiscalYear,
          amount: validatedData.amount,
          accountCode: validatedData.accountCode,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
          reportedById: session.user.id,
          status: 'OPEN',
        },
        include: {
          category: true,
          village: true,
          reportedBy: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      })

      // Create activity log
      await tx.activity.create({
        data: {
          atensiId: newAtensi.id,
          action: 'created',
          details: JSON.stringify({
            title: newAtensi.title,
            priority: newAtensi.priority,
          }),
          performedById: session.user.id,
        },
      })

      // Create notifications for relevant users
      const inspectors = await tx.user.findMany({
        where: {
          role: {
            code: 'INSPECTOR',
          },
          pemdaId: village.pemdaId,
        },
      })

      if (inspectors.length > 0) {
        await tx.notification.createMany({
          data: inspectors.map(inspector => ({
            type: 'new_atensi',
            title: 'Atensi Baru',
            message: `Atensi baru "${validatedData.title}" telah dibuat untuk ${village.name}`,
            data: JSON.stringify({ atensiId: newAtensi.id }),
            userId: inspector.id,
          })),
        })
      }

      return newAtensi
    })

    return NextResponse.json({
      message: 'Atensi berhasil dibuat',
      data: atensi,
    })
  } catch (error) {
    console.error('Error creating atensi:', error)
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