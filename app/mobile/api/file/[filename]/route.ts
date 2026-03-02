import { NextResponse } from 'next/server'
import { requireMobileAuth } from '@/lib/get-mobile-session'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // =========================
    // WAJIB LOGIN MOBILE
    // =========================
    const auth = await requireMobileAuth()
    if (!auth.ok) return auth.response

    const session = auth.session
    const kdDesa = session?.mobile?.kd_desa

    if (!kdDesa) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // =========================
    // VALIDASI FILE MILIK DESA
    // =========================
    const rinc = await prisma.cACM_Atensi_Desa_Rinc.findFirst({
      where: {
        NamaFile: filename,
        Kd_Desa: kdDesa,
      },
      select: {
        id: true,
      },
    })

    if (!rinc) {
      return NextResponse.json(
        { error: 'File tidak ditemukan atau bukan milik desa ini' },
        { status: 403 }
      )
    }

    // =========================
    // BACA FILE
    // =========================
    const filePath = path.join(
      process.cwd(),
      'storage/uploads',
      filename
    )

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