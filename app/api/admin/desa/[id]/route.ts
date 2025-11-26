import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper untuk parsing composite key dari param id
function parseKey(id: string) {
  const [Tahun, Kd_Pemda, Kd_Desa] = id.split('__')
  return { Tahun, Kd_Pemda, Kd_Desa }
}

// GET: detail desa by composite key
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { Tahun, Kd_Pemda, Kd_Desa } = parseKey(params.id)

    const desa = await prisma.ta_Desa.findUnique({
      where: {
        Tahun_Kd_Pemda_Kd_Desa: { Tahun, Kd_Pemda, Kd_Desa },
      },
      select: {
        Tahun: true,
        Kd_Pemda: true,
        Kd_Desa: true,
        Nama_Desa: true,
        Alamat: true,
        Ibukota: true,
        HP_Kades: true,
      },
    })

    if (!desa) {
      return NextResponse.json({ error: 'Desa not found' }, { status: 404 })
    }

    return NextResponse.json(desa)
  } catch (error) {
    console.error('Failed to fetch desa:', error)
    return NextResponse.json({ error: 'Failed to fetch desa' }, { status: 500 })
  }
}

// PUT: update desa by composite key
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { Tahun, Kd_Pemda, Kd_Desa } = parseKey(params.id)
    const body = await request.json()
    const { Nama_Desa, Alamat, Ibukota, HP_Kades } = body

    const desa = await prisma.ta_Desa.update({
      where: {
        Tahun_Kd_Pemda_Kd_Desa: { Tahun, Kd_Pemda, Kd_Desa },
      },
      data: {
        Nama_Desa,
        Alamat,
        Ibukota,
        HP_Kades,
      },
      select: {
        Tahun: true,
        Kd_Pemda: true,
        Kd_Desa: true,
        Nama_Desa: true,
        Alamat: true,
        Ibukota: true,
        HP_Kades: true,
      },
    })

    return NextResponse.json(desa)
  } catch (error) {
    console.error('Failed to update desa:', error)
    return NextResponse.json({ error: 'Failed to update desa' }, { status: 500 })
  }
}

// DELETE: hapus desa by composite key
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { Tahun, Kd_Pemda, Kd_Desa } = parseKey(params.id)

    await prisma.ta_Desa.delete({
      where: {
        Tahun_Kd_Pemda_Kd_Desa: { Tahun, Kd_Pemda, Kd_Desa },
      },
    })

    return NextResponse.json({ message: 'Desa deleted successfully' })
  } catch (error) {
    console.error('Failed to delete desa:', error)
    return NextResponse.json({ error: 'Failed to delete desa' }, { status: 500 })
  }
}