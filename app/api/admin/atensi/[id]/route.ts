import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Note: [id] param here is the No_Atensi value
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

    // Fetch atensi with its village-level findings
    const atensi = await prisma.cACM_Atensi.findUnique({
      where: {
        Tahun_Kd_Pemda_No_Atensi: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: params.id, // params.id is No_Atensi
        },
      },
      include: {
        CACM_Atensi_Desa: {
          orderBy: {
            Kd_Desa: 'asc',
          },
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
    const { Tgl_Atensi, Tgl_CutOff, Keterangan, isSent } = body

    // Update atensi period
    const atensi = await prisma.cACM_Atensi.update({
      where: {
        Tahun_Kd_Pemda_No_Atensi: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: params.id,
        },
      },
      data: {
        ...(Tgl_Atensi && { Tgl_Atensi: new Date(Tgl_Atensi) }),
        ...(Tgl_CutOff && { Tgl_CutOff: new Date(Tgl_CutOff) }),
        ...(Keterangan !== undefined && { Keterangan }),
        ...(isSent !== undefined && { isSent }),
        update_at: new Date(),
        update_by: session.user.username || session.user.email,
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

    // Delete atensi period (cascade will handle child records)
    await prisma.cACM_Atensi.delete({
      where: {
        Tahun_Kd_Pemda_No_Atensi: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: params.id,
        },
      },
    })

    return NextResponse.json({ message: 'Atensi deleted successfully' })
  } catch (error) {
    console.error('Failed to delete atensi:', error)
    return NextResponse.json({ error: 'Failed to delete atensi' }, { status: 500 })
  }
}
