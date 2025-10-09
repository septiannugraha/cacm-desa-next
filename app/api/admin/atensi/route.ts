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

    // Get user's pemda code for filtering
    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })

    if (!pemda) {
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    }

    // Extract Kd_Pemda (first 4 chars of code)
    const kdPemda = pemda.code.substring(0, 4)

    // Get fiscal year from session or use current year
    const fiscalYear = session.fiscalYear || new Date().getFullYear()

    // Fetch atensi periods for this Pemda
    const atensiList = await prisma.cACM_Atensi.findMany({
      where: {
        Kd_Pemda: kdPemda,
        Tahun: fiscalYear.toString(),
      },
      orderBy: {
        Tgl_Atensi: 'desc',
      },
    })

    return NextResponse.json({ atensi: atensiList })
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

    // Parse request body
    const body = await request.json()
    const { No_Atensi, Tgl_Atensi, Tgl_CutOff, Keterangan } = body

    // Validate required fields
    if (!No_Atensi || !Tgl_Atensi || !Tgl_CutOff) {
      return NextResponse.json(
        { error: 'No_Atensi, Tgl_Atensi, and Tgl_CutOff are required' },
        { status: 400 }
      )
    }

    // Check if atensi period already exists
    const existingAtensi = await prisma.cACM_Atensi.findUnique({
      where: {
        Tahun_Kd_Pemda_No_Atensi: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi,
        },
      },
    })

    if (existingAtensi) {
      return NextResponse.json(
        { error: 'Atensi period with this number already exists' },
        { status: 409 }
      )
    }

    // Create new atensi period
    const atensi = await prisma.cACM_Atensi.create({
      data: {
        id: crypto.randomUUID(),
        id_Pemda: pemda.id,
        Tahun: fiscalYear.toString(),
        Kd_Pemda: kdPemda,
        No_Atensi,
        Tgl_Atensi: new Date(Tgl_Atensi),
        Tgl_CutOff: new Date(Tgl_CutOff),
        Keterangan: Keterangan || null,
        Jlh_Desa: 0, // Will be calculated from child records
        Jlh_RF: 0,   // Will be calculated from child records
        Jlh_TL: 0,   // Will be calculated from child records
        isSent: false,
        create_at: new Date(),
        create_by: session.user.username || session.user.email,
      },
    })

    return NextResponse.json({ atensi }, { status: 201 })
  } catch (error) {
    console.error('Failed to create atensi:', error)
    return NextResponse.json({ error: 'Failed to create atensi' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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
    const { No_Atensi, Tgl_Atensi, Tgl_CutOff, Keterangan, isSent } = body

    // Validate required fields
    if (!No_Atensi) {
      return NextResponse.json({ error: 'No_Atensi is required' }, { status: 400 })
    }

    // Update atensi period
    const atensi = await prisma.cACM_Atensi.update({
      where: {
        Tahun_Kd_Pemda_No_Atensi: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi,
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

    return NextResponse.json({ atensi })
  } catch (error) {
    console.error('Failed to update atensi:', error)
    return NextResponse.json({ error: 'Failed to update atensi' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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

    // Parse request body or search params
    const { searchParams } = new URL(request.url)
    const No_Atensi = searchParams.get('No_Atensi')

    if (!No_Atensi) {
      return NextResponse.json({ error: 'No_Atensi is required' }, { status: 400 })
    }

    // Delete atensi period (cascade will handle child records)
    await prisma.cACM_Atensi.delete({
      where: {
        Tahun_Kd_Pemda_No_Atensi: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi,
        },
      },
    })

    return NextResponse.json({ message: 'Atensi period deleted successfully' })
  } catch (error) {
    console.error('Failed to delete atensi:', error)
    return NextResponse.json({ error: 'Failed to delete atensi' }, { status: 500 })
  }
}
