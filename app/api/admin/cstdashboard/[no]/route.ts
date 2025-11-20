import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// [GET] Ambil detail grafik berdasarkan No
export async function GET(
  request: Request,
  { params }: { params: { no: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawNo = params.no
    const nomor = Number(rawNo)

    if (!rawNo || isNaN(nomor)) {
      return NextResponse.json({ error: 'Invalid No parameter' }, { status: 400 })
    }

    const data = await prisma.cACM_CstDashboard.findUnique({
      where: { No: nomor },
    })

    if (!data) {
      return NextResponse.json({ error: `Grafik dengan No ${nomor} tidak ditemukan` }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /cstdashboard/[no] error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data grafik' }, { status: 500 })
  }
}

// [PUT] Update grafik berdasarkan No
export async function PUT(
  request: Request,
  { params }: { params: { no: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawNo = params.no
    const nomor = Number(rawNo)

    if (!rawNo || isNaN(nomor)) {
      return NextResponse.json({ error: 'Invalid No parameter' }, { status: 400 })
    }

    const body = await request.json()

    const updated = await prisma.cACM_CstDashboard.update({
      where: { No: nomor },
      data: {
        No: body.No,
        Nama_Grafik: body.Nama_Grafik,
        Keterangan: body.Keterangan,
        Nama_Kolom: body.Nama_Kolom,
        Syntax: body.Syntax,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /cstdashboard/[no] error:', error)
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}

// [DELETE] Hapus grafik berdasarkan No
export async function DELETE(
  request: Request,
  { params }: { params: { no: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawNo = params.no
    const nomor = Number(rawNo)

    if (!rawNo || isNaN(nomor)) {
      return NextResponse.json({ error: 'Invalid No parameter' }, { status: 400 })
    }

    await prisma.cACM_CstDashboard.delete({ where: { No: nomor } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /cstdashboard/[no] error:', error)
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
  }
}