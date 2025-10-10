import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all village-level findings for an atensi period
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's pemda info
    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })

    if (!pemda) {
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    }

    const kdPemda = pemda.code.substring(0, 4)
    const fiscalYear = session.fiscalYear || new Date().getFullYear()

    // Fetch all village findings for this atensi period
    const desaFindings = await prisma.cACM_Atensi_Desa.findMany({
      where: {
        Tahun: fiscalYear.toString(),
        Kd_Pemda: kdPemda,
        No_Atensi: params.id,
      },
      orderBy: {
        Kd_Desa: 'asc',
      },
    })

    return NextResponse.json({ findings: desaFindings })
  } catch (error) {
    console.error('Failed to fetch village findings:', error)
    return NextResponse.json({ error: 'Failed to fetch village findings' }, { status: 500 })
  }
}

// Create a new village-level finding for an atensi period
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's pemda info
    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { id: true, code: true },
    })

    if (!pemda) {
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    }

    const kdPemda = pemda.code.substring(0, 4)
    const fiscalYear = session.fiscalYear || new Date().getFullYear()

    // Get the parent atensi to get id_Atensi
    const atensi = await prisma.cACM_Atensi.findUnique({
      where: {
        Tahun_Kd_Pemda_No_Atensi: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: params.id,
        },
      },
      select: { id: true },
    })

    if (!atensi) {
      return NextResponse.json({ error: 'Atensi period not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { Kd_Desa, StatusTL, StatusVer } = body

    // Validate required fields
    if (!Kd_Desa) {
      return NextResponse.json({ error: 'Kd_Desa is required' }, { status: 400 })
    }

    // Check if finding already exists
    const existingFinding = await prisma.cACM_Atensi_Desa.findUnique({
      where: {
        Tahun_Kd_Pemda_No_Atensi_Kd_Desa: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: params.id,
          Kd_Desa,
        },
      },
    })

    if (existingFinding) {
      return NextResponse.json(
        { error: 'Village finding already exists for this atensi period' },
        { status: 409 }
      )
    }

    // Create new village finding
    const finding = await prisma.cACM_Atensi_Desa.create({
      data: {
        id: crypto.randomUUID(),
        id_Atensi: atensi.id,
        Tahun: fiscalYear.toString(),
        Kd_Pemda: kdPemda,
        No_Atensi: params.id,
        Kd_Desa,
        Jlh_RF: 0, // Will be calculated from child records
        Jlh_TL: 0, // Will be calculated from child records
        StatusTL: StatusTL || 0,
        StatusVer: StatusVer || 0,
        create_at: new Date(),
        create_by: session.user.username || session.user.email,
      },
    })

    return NextResponse.json({ finding }, { status: 201 })
  } catch (error) {
    console.error('Failed to create village finding:', error)
    return NextResponse.json({ error: 'Failed to create village finding' }, { status: 500 })
  }
}
