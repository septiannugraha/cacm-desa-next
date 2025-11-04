import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  decryptUser,
  decryptPwd,
  decryptServer,
  decryptDB,
} from '@/lib/encryption'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ aman dan sesuai dokumentasi


  if (!id) {
    return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 });
  }

   
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
 

    // Ambil detail koneksi dari CACM_Koneksi
    const result = await prisma.$queryRaw<
      {
        Kd_Pemda: string | null
        Tahun: string | null
        Server: string | null
        UID: string | null
        Pwd: string | null
        DB: string | null
        Mode: string | null
      }[]
    >(Prisma.sql`
      SELECT
        Kd_Pemda, Tahun,
        'ANSI[' + dbo.fn_StringToAnsiBytes(Server) + ']' AS Server,
        'ANSI[' + dbo.fn_StringToAnsiBytes(UserID) + ']' AS UID,
        'ANSI[' + dbo.fn_StringToAnsiBytes(Password) + ']' AS Pwd,
        'ANSI[' + dbo.fn_StringToAnsiBytes(DB) + ']' AS DB,
        Mode
      FROM dbo.CACM_Koneksi
      WHERE id = ${id}
    `)

    const detail = result[0]
    if (!detail) {
      return NextResponse.json({ error: 'Koneksi detail not found' }, { status: 404 })
    }

    const Kd_Pemda = detail.Kd_Pemda ?? ''
    const Tahun = detail.Tahun ?? ''
    const Server = decryptServer(detail.Server ?? '', 1)
    const DB = decryptDB(detail.DB ?? '', 1)
    const UID = decryptUser(detail.UID ?? '', 1)
    const Pwd = decryptPwd(detail.Pwd ?? '', 1)
    const Mode = detail.Mode ?? 'SQL'

 

    // Jalankan stored procedure
    await prisma.$executeRawUnsafe(`
      EXEC sp_aktifkankoneksidb
        '${Kd_Pemda}',
        '${Tahun}',
        '${Server}',
        '${DB}',
        '${Mode}',
        '${UID}',
        '${Pwd}'
    `)

    // Update status koneksi
    await prisma.cACM_Koneksi.update({
      where: { id },
      data: {
        Con_Stat: true,
        update_at: new Date(),
        update_by: session.user.username || session.user.email,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to activate connection:', error)
    return NextResponse.json({ error: 'Failed to activate connection' }, { status: 500 })
  }
}