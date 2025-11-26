import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: ambil daftar desa
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const villages = await prisma.ta_Desa.findMany({
      select: {
        Kd_Desa: true,
        Nama_Desa: true,
        Alamat: true,
        Ibukota: true,
        HP_Kades: true,
      },
      orderBy: { Kd_Desa: 'asc' },
    })

    return NextResponse.json(villages)
  } catch (error) {
    console.error('Failed to fetch desa:', error)
    return NextResponse.json({ error: 'Failed to fetch desa' }, { status: 500 })
  }
}

// POST: tambah desa baru
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { Kd_Desa, Nama_Desa, Alamat, Ibukota, HP_Kades } = body

    if (!Kd_Desa || !Nama_Desa) {
      return NextResponse.json(
        { error: 'Kode desa dan nama desa wajib diisi' },
        { status: 400 }
      )
    }

    const desa = await prisma.ta_Desa.create({
      data: {
        Kd_Desa,
        Nama_Desa,
        Alamat,
        Ibukota,
        HP_Kades,
        Tahun: new Date().getFullYear().toString(), // wajib karena PK composite
        Kd_Pemda: '0001', // sesuaikan default/ambil dari context
      },
      select: {
        Kd_Desa: true,
        Nama_Desa: true,
        Alamat: true,
        Ibukota: true,
        HP_Kades: true,
      },
    })

    return NextResponse.json(desa, { status: 201 })
  } catch (error) {
    console.error('Failed to create desa:', error)
    return NextResponse.json({ error: 'Failed to create desa' }, { status: 500 })
  }
}

// DELETE: hapus desa berdasarkan kode desa
export async function DELETE(
  request: Request,
  { params }: { params: { kdDesa: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { kdDesa } = params

    await prisma.ta_Desa.delete({
      where: {
        // karena PK composite, minimal harus isi Tahun + Kd_Pemda + Kd_Desa
        Tahun_Kd_Pemda_Kd_Desa: {
          Tahun: new Date().getFullYear().toString(),
          Kd_Pemda: '0001', // sesuaikan dengan konteks
          Kd_Desa: kdDesa,
        },
      },
    })

    return NextResponse.json({ message: 'Desa deleted successfully' })
  } catch (error) {
    console.error('Failed to delete desa:', error)
    return NextResponse.json({ error: 'Failed to delete desa' }, { status: 500 })
  }
}