import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// [GET] Ambil semua grafik dashboard
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await prisma.cACM_CstDashboard.findMany({
      orderBy: { No: 'asc' },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /cstdashboard error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data grafik' }, { status: 500 })
  }
}

// [POST] Tambah grafik baru
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { No, Nama_Grafik, Keterangan, Nama_Kolom, Syntax } = body

    if (!No || !Nama_Grafik || !Syntax) {
      return NextResponse.json(
        { error: 'No, Nama_Grafik, dan Syntax wajib diisi' },
        { status: 400 }
      )
    }

    const existing = await prisma.cACM_CstDashboard.findUnique({ where: { No } })
    if (existing) {
      return NextResponse.json(
        { error: `Grafik dengan No ${No} sudah ada` },
        { status: 409 }
      )
    }

    const created = await prisma.cACM_CstDashboard.create({
      data: {
        No,
        Nama_Grafik,
        Keterangan: Keterangan ?? '',
        Nama_Kolom: Nama_Kolom ?? '',
        Syntax,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('POST /cstdashboard error:', error)
    return NextResponse.json({ error: 'Gagal membuat grafik dashboard' }, { status: 500 })
  }
}

// [DELETE] Hapus grafik berdasarkan No (dikirim lewat body)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { No } = await request.json()
    if (!No) {
      return NextResponse.json({ error: 'No wajib disertakan' }, { status: 400 })
    }

    await prisma.cACM_CstDashboard.delete({ where: { No } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /cstdashboard error:', error)
    return NextResponse.json({ error: 'Gagal menghapus grafik' }, { status: 500 })
  }
}