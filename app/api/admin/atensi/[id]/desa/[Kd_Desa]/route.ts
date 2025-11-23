import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get a specific village finding with its transaction details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; Kd_Desa: string }> }
) {
  try {
    // Next.js 15+: params is now a Promise and must be awaited
    const { id, Kd_Desa } = await params

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

    // Fetch village finding with transaction details
    const finding = await prisma.cACM_Atensi_Desa.findUnique({
      where: {
        Tahun_Kd_Pemda_No_Atensi_Kd_Desa: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: id,
          Kd_Desa: Kd_Desa,
        },
      },
      include: {
        CACM_Atensi_Desa_Rinc_CACM_Atensi_Desa_Rinc_Tahun_Kd_Pemda_No_Atensi_Kd_DesaToCACM_Atensi_Desa: {
          orderBy: [
            { Jns_Atensi: 'asc' },
            { No_Bukti: 'asc' },
          ],
        },
      },
    })

    if (!finding) {
      return NextResponse.json({ error: 'Village finding not found' }, { status: 404 })
    }

    return NextResponse.json(finding)
  } catch (error) {
    console.error('Failed to fetch village finding:', error)
    return NextResponse.json({ error: 'Failed to fetch village finding' }, { status: 500 })
  }
}

// Update a village finding
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; Kd_Desa: string }> }
) {
  try {
    // Next.js 15+: params is now a Promise and must be awaited
    const { id, Kd_Desa } = await params

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

    // Parse request body
    const body = await request.json()
    const { StatusTL, StatusVer } = body

    // Update village finding
    const finding = await prisma.cACM_Atensi_Desa.update({
      where: {
        Tahun_Kd_Pemda_No_Atensi_Kd_Desa: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: id,
          Kd_Desa: Kd_Desa,
        },
      },
      data: {
        ...(StatusTL !== undefined && { StatusTL }),
        ...(StatusVer !== undefined && { StatusVer }),
        update_at: new Date(),
        update_by: session.user.username || session.user.email,
      },
    })

    return NextResponse.json(finding)
  } catch (error) {
    console.error('Failed to update village finding:', error)
    return NextResponse.json({ error: 'Failed to update village finding' }, { status: 500 })
  }
}

// Delete a village finding
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; Kd_Desa: string }> }
) {
  try {
    // Next.js 15+: params is now a Promise and must be awaited
    const { id, Kd_Desa } = await params

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

    // Delete village finding (cascade will handle child records)
    await prisma.cACM_Atensi_Desa.delete({
      where: {
        Tahun_Kd_Pemda_No_Atensi_Kd_Desa: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: id,
          Kd_Desa: Kd_Desa,
        },
      },
    })

    return NextResponse.json({ message: 'Village finding deleted successfully' })
  } catch (error) {
    console.error('Failed to delete village finding:', error)
    return NextResponse.json({ error: 'Failed to delete village finding' }, { status: 500 })
  }
}
