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

    // Fetch connections for this Pemda
    const connections = await prisma.cACM_Koneksi.findMany({
      where: {
        Kd_Pemda: kdPemda,
        Tahun: fiscalYear.toString(),
      },
      orderBy: {
        create_at: 'desc',
      },
    })

    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Failed to fetch connections:', error)
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
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
    const { Server, DB, UserID, Password } = body

    // Validate required fields
    if (!Server || !DB || !UserID || !Password) {
      return NextResponse.json(
        { error: 'Server, DB, UserID, and Password are required' },
        { status: 400 }
      )
    }

    // Check if connection already exists
    const existingConnection = await prisma.cACM_Koneksi.findUnique({
      where: {
        Tahun_Kd_Pemda: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
        },
      },
    })

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection already exists for this Pemda and year' },
        { status: 409 }
      )
    }

    // Create new connection
    const connection = await prisma.cACM_Koneksi.create({
      data: {
        id: crypto.randomUUID(),
        id_Pemda: pemda.id,
        Tahun: fiscalYear.toString(),
        Kd_Pemda: kdPemda,
        Server,
        DB,
        UserID,
        Password,
        Con_Stat: false, // Initially set to false until tested
        create_at: new Date(),
        create_by: session.user.username || session.user.email,
      },
    })

    return NextResponse.json({ connection }, { status: 201 })
  } catch (error) {
    console.error('Failed to create connection:', error)
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
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
    const { Server, DB, UserID, Password } = body

    // Validate required fields
    if (!Server || !DB || !UserID || !Password) {
      return NextResponse.json(
        { error: 'Server, DB, UserID, and Password are required' },
        { status: 400 }
      )
    }

    // Update connection
    const connection = await prisma.cACM_Koneksi.update({
      where: {
        Tahun_Kd_Pemda: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
        },
      },
      data: {
        Server,
        DB,
        UserID,
        Password,
        Con_Stat: false, // Reset to false until tested again
        update_at: new Date(),
        update_by: session.user.username || session.user.email,
      },
    })

    return NextResponse.json({ connection })
  } catch (error) {
    console.error('Failed to update connection:', error)
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
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

    // Delete connection
    await prisma.cACM_Koneksi.delete({
      where: {
        Tahun_Kd_Pemda: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
        },
      },
    })

    return NextResponse.json({ message: 'Connection deleted successfully' })
  } catch (error) {
    console.error('Failed to delete connection:', error)
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
  }
}
