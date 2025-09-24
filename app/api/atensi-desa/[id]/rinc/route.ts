import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: List Atensi Desa Rinci (Detail items)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const idAtensiDesa = params.id
    const searchParams = request.nextUrl.searchParams
    const jnsAtensi = searchParams.get('jnsAtensi')

    const where: Record<string, unknown> = {
      idAtensiDesa
    }

    if (jnsAtensi) where.jnsAtensi = jnsAtensi

    const rinciItems = await prisma.atensiDesaRinc.findMany({
      where,
      include: {
        category: true,
        status: true,
        verifikasi: true,
        atensiDesa: {
          include: {
            village: true
          }
        }
      },
      orderBy: [
        { tglBukti: 'desc' },
        { noBukti: 'asc' }
      ]
    })

    return NextResponse.json(rinciItems)
  } catch (error) {
    console.error('Error fetching atensi rinci:', error)
    return NextResponse.json(
      { error: 'Failed to fetch atensi rinci' },
      { status: 500 }
    )
  }
}

// POST: Create new Atensi Desa Rinci
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const idAtensiDesa = params.id
    const body = await request.json()

    // Get atensi desa details
    const atensiDesa = await prisma.atensiDesa.findUnique({
      where: { idAtensiDesa }
    })

    if (!atensiDesa) {
      return NextResponse.json({ error: 'Atensi Desa not found' }, { status: 404 })
    }

    const rinciItem = await prisma.atensiDesaRinc.create({
      data: {
        idAtensiDesa,
        tahun: atensiDesa.tahun,
        kdPemda: atensiDesa.kdPemda,
        kdDesa: atensiDesa.kdDesa,
        noAtensi: atensiDesa.noAtensi,
        jnsAtensi: body.jnsAtensi,
        noBukti: body.noBukti,
        tglBukti: new Date(body.tglBukti),
        ketBukti: body.ketBukti,
        nilai: body.nilai,
        satuan: body.satuan,
        statusTL: body.statusTL || 1, // Default: Belum Ditindaklanjuti
        statusVer: body.statusVer || 1 // Default: Belum Diverifikasi
      },
      include: {
        category: true,
        status: true,
        verifikasi: true
      }
    })

    // Update jlhRF count in AtensiDesa
    await prisma.atensiDesa.update({
      where: { idAtensiDesa },
      data: {
        jlhRF: {
          increment: 1
        }
      }
    })

    return NextResponse.json(rinciItem, { status: 201 })
  } catch (error) {
    console.error('Error creating atensi rinci:', error)
    return NextResponse.json(
      { error: 'Failed to create atensi rinci' },
      { status: 500 }
    )
  }
}

// PUT: Update Atensi Desa Rinci status
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const body = await request.json()
    const { rinciId, statusTL, statusVer } = body

    if (!rinciId) {
      return NextResponse.json({ error: 'Rinci ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (statusTL !== undefined) updateData.statusTL = statusTL
    if (statusVer !== undefined) updateData.statusVer = statusVer

    const updated = await prisma.atensiDesaRinc.update({
      where: { id: rinciId },
      data: updateData,
      include: {
        category: true,
        status: true,
        verifikasi: true
      }
    })

    // Update jlhTL count in AtensiDesa if status changed to "Selesai" (7)
    if (statusTL === 7) {
      const idAtensiDesa = params.id
      await prisma.atensiDesa.update({
        where: { idAtensiDesa },
        data: {
          jlhTL: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating atensi rinci:', error)
    return NextResponse.json(
      { error: 'Failed to update atensi rinci' },
      { status: 500 }
    )
  }
}