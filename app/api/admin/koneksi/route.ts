import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
    const kdPemda = session.user.pemdakd

    const connections = await prisma.cACM_Koneksi.findMany({
      where: { Kd_Pemda: kdPemda },
      include: {
        Ta_KoneksiDB: { select: { Nama_Koneksi: true } },
      },
      orderBy: { create_at: 'desc' },
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
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

 
    const kdPemda = session.user.pemdakd
    const { id_Koneksi, Tahun } = await request.json()
    if (!id_Koneksi || !Tahun) {
      return NextResponse.json({ error: 'id_Koneksi and Tahun are required' }, { status: 400 })
    }

    const existing = await prisma.cACM_Koneksi.findFirst({
      where: { Tahun, Kd_Pemda: kdPemda },
    })
    if (existing) {
      return NextResponse.json({ error: 'Connection already exists for this year and Pemda' }, { status: 409 })
    }

    const newId = crypto.randomUUID()

    await prisma.$executeRawUnsafe(`
      INSERT INTO CACM_Koneksi (
        id, id_Koneksi, Tahun, Kd_Pemda, Server, DB, Mode, UserID, Password, Con_Stat, create_at, create_by
      )
      SELECT
        '${newId}', id, '${Tahun}', '${kdPemda}', Server, DB, Mode, UID, Pwd, 0, GETDATE(), '${session.user.username || session.user.email}'
      FROM Ta_KoneksiDB
      WHERE id = '${id_Koneksi}'
    `)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Failed to create connection:', error)
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id_Koneksi, id } = await request.json()
    if (!id_Koneksi || !id) {
      return NextResponse.json({ error: 'id and id_Koneksi are required' }, { status: 400 })
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    await prisma.cACM_Koneksi.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Connection deleted successfully' })
  } catch (error) {
    console.error('Failed to delete connection:', error)
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
  }
}