import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// --- [GET] Ambil detail koneksi berdasarkan ID ---
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15+: params is now a Promise and must be awaited
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await prisma.cACM_Koneksi.findUnique({
      where: { id },
      include: {
        Ta_KoneksiDB: {
          select: {
            Nama_Koneksi: true,
            Jenis_Koneksi: true,
            Server: true,
            DB: true,
            UID: true,
            Pwd: true,
            Mode: true,
            ConStat: true,
          },
        },
      },
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    return NextResponse.json(connection)
  } catch (error) {
    console.error('Failed to fetch connection:', error)
    return NextResponse.json({ error: 'Failed to fetch connection' }, { status: 500 })
  }
}

// --- [PUT] Update koneksi berdasarkan ID ---
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15+: params is now a Promise and must be awaited
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id_Koneksi } = await request.json()
    if (!id_Koneksi) {
      return NextResponse.json({ error: 'id_Koneksi is required' }, { status: 400 })
    }

    await prisma.$executeRawUnsafe(`
      UPDATE CACM_Koneksi
      SET
        id_Koneksi = '${id_Koneksi}',
        Server = src.Server,
        DB = src.DB,
        Mode = src.Mode,
        UserID = src.UID,
        Password = src.Pwd,
        Con_Stat = 0,
        update_at = GETDATE(),
        update_by = '${session.user.username || session.user.email}'
      FROM CACM_Koneksi dst
      JOIN Ta_KoneksiDB src ON src.id = '${id_Koneksi}'
      WHERE dst.id = '${id}'
    `)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update connection:', error)
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
  }
}

// --- [DELETE] Hapus koneksi berdasarkan ID ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15+: params is now a Promise and must be awaited
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.cACM_Koneksi.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Connection deleted successfully' })
  } catch (error) {
    console.error('Failed to delete connection:', error)
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
  }
}