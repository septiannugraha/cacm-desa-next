import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas
const createAtensiSchema = z.object({
  Kd_Pemda: z.string().min(1).max(4),
  No_Atensi: z.string().min(1).max(50),
  Tgl_Atensi: z.string().datetime(),
  Tgl_CutOff: z.string().datetime(),
  Keterangan: z.string().optional(),
})

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  tahun: z.string().optional(),
  kdPemda: z.string().optional(),
  search: z.string().optional(),
  isSent: z.string().optional(),
  sortBy: z.enum(['Tgl_Atensi', 'No_Atensi', 'Jlh_RF']).default('Tgl_Atensi'),
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
    const where: Record<string, unknown> = {
      Tahun: query.tahun || session.fiscalYear?.toString() || new Date().getFullYear().toString(),
    }

    // Role-based filtering - filter by user's Pemda if not admin
    if (session.user.roleCode !== 'ADMIN' && session.user.pemdaId) {
      where.id_Pemda = session.user.pemdaId
    }

    // Apply filters
    if (query.kdPemda) where.Kd_Pemda = query.kdPemda
    if (query.isSent !== undefined && query.isSent !== '') {
      where.isSent = query.isSent === 'true'
    }
    if (query.search) {
      where.OR = [
        { No_Atensi: { contains: query.search } },
        { Keterangan: { contains: query.search } },
      ]
    }

    // Execute query with pagination
    const [atensiList, totalCount] = await Promise.all([
      prisma.cACM_Atensi.findMany({
        where,
        include: {
          Ta_Pemda_CACM_Atensi_id_PemdaToTa_Pemda: {
            select: {
              Nama_Pemda: true,
              Kd_Pemda: true,
            },
          },
          CACM_Atensi_Desa_CACM_Atensi_Desa_id_AtensiToCACM_Atensi: {
            select: {
              Kd_Desa: true,
              StatusTL: true,
              StatusVer: true,
            },
          },
        },
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.cACM_Atensi.count({ where }),
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
        { error: 'Invalid query parameters', details: error.issues },
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

    const Tahun = session.fiscalYear?.toString() || new Date().getFullYear().toString()
    const { Kd_Pemda, No_Atensi, Tgl_Atensi, Tgl_CutOff, Keterangan } = validatedData

    // Check if Atensi already exists
    const existingAtensi = await prisma.cACM_Atensi.findFirst({
      where: {
        Tahun,
        Kd_Pemda,
        No_Atensi,
      },
    })

    if (existingAtensi) {
      return NextResponse.json(
        { error: 'Atensi dengan nomor ini sudah ada' },
        { status: 400 }
      )
    }

    // Get Pemda data
    const pemda = await prisma.ta_Pemda.findFirst({
      where: {
        Tahun,
        Kd_Pemda,
      },
    })

    if (!pemda) {
      return NextResponse.json(
        { error: 'Pemda tidak ditemukan' },
        { status: 400 }
      )
    }

    // Create Atensi
    const { randomUUID } = require('crypto')
    const atensi = await prisma.cACM_Atensi.create({
      data: {
        id: randomUUID(),
        id_Pemda: pemda.id,
        Tahun,
        Kd_Pemda,
        No_Atensi,
        Tgl_Atensi: new Date(Tgl_Atensi),
        Tgl_CutOff: new Date(Tgl_CutOff),
        Keterangan,
        Jlh_Desa: 0,
        Jlh_RF: 0,
        Jlh_TL: 0,
        isSent: false,
        create_at: new Date(),
        create_by: session.user.username,
      },
      include: {
        Ta_Pemda_CACM_Atensi_id_PemdaToTa_Pemda: {
          select: {
            Nama_Pemda: true,
            Kd_Pemda: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Atensi berhasil dibuat',
      data: atensi,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating atensi:', error)
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