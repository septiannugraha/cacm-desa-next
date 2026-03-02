import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // WAJIB LOGIN NEXTAUTH
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Pastikan file ada di DB
    const rinc = await prisma.cACM_Atensi_Desa_Rinc.findFirst({
      where: { NamaFile: filename },
      select: {
        id: true,
        Kd_Pemda: true,
      },
    })

    if (!rinc) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 })
    }

    // Optional: batasi sesuai Pemda user login
    const userPemda = session.user?.pemdakd
    if (userPemda && rinc.Kd_Pemda !== userPemda) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const filePath = path.join(process.cwd(), 'storage/uploads', filename)

    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err?.message || 'Gagal download file' },
      { status: 500 }
    )
  }
}