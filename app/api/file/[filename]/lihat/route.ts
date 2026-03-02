import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

function getContentType(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'pdf':
      return 'application/pdf'
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xls':
      return 'application/vnd.ms-excel'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rinc = await prisma.cACM_Atensi_Desa_Rinc.findFirst({
      where: { NamaFile: filename },
      select: { Kd_Pemda: true },
    })

    if (!rinc) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 })
    }

    const userPemda = session.user?.pemdakd
    if (userPemda && rinc.Kd_Pemda !== userPemda) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const filePath = path.join(process.cwd(), 'storage/uploads', filename)
    const fileBuffer = await readFile(filePath)

    const contentType = getContentType(filename)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err?.message || 'Gagal melihat file' },
      { status: 500 }
    )
  }
}