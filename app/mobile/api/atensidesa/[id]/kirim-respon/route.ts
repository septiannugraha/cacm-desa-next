import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireMobileAuth } from '@/lib/get-mobile-session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import fs from 'fs'
import { Prisma } from '@prisma/client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const auth = await requireMobileAuth()
    if (!auth.ok) return auth.response

    const session = auth.session
    const kdDesa = session?.mobile?.kd_desa

    if (!kdDesa) {
      return NextResponse.json(
        { error: 'Kd Desa tidak ditemukan' },
        { status: 400 }
      )
    }

    const formData = await request.formData()

    const namaTL = formData.get('namaTL') as string
    const komenTL = formData.get('komenTL') as string
    const statusTLRaw = formData.get('statusTL') as string
    const file = formData.get('file') as File | null

    const statusTL = Number(statusTLRaw)

    // =========================
    // VALIDASI STATUS TL
    // =========================
    if (![7, 8, 9].includes(statusTL)) {
      return NextResponse.json(
        { error: 'Status TL hanya boleh 7, 8, atau 9' },
        { status: 400 }
      )
    }

    let fileName: string | null = null

    // =========================
    // VALIDASI & UPLOAD FILE
    // =========================
    if (file && file.size > 0) {
      // Maksimal 5MB
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Ukuran file maksimal 5MB' },
          { status: 400 }
        )
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'File hanya boleh PDF, JPG, atau PNG' },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = path.extname(file.name)
      fileName = `${randomUUID()}${ext}`

      const uploadDir = path.join(process.cwd(), 'storage/uploads')

      if (!fs.existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      await writeFile(path.join(uploadDir, fileName), buffer)
    }

    // =========================
    // UPDATE DATABASE
    // =========================
    await prisma.$executeRaw`
    UPDATE CACM_Atensi_Desa_Rinc
    SET
      NamaTL = ${namaTL},
      KomenTL = ${komenTL},
      StatusTL = ${statusTL},
      StatusVer = 2,
      ${fileName ? Prisma.sql`NamaFile = ${fileName},` : Prisma.sql``}
      HistoryAtensi = dbo.AddHistoryAtensiToJson(
        HistoryAtensi,
        ${namaTL},
        ${statusTL},
        2,
        CURRENT_TIMESTAMP
      )
    WHERE id = ${id}
  `

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err?.message || 'Gagal kirim respon' },
      { status: 500 }
    )
  }
}