import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: ambil daftar jenis atensi
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await prisma.cACM_Jns_Atensi.findMany({
      select: {
        Jns_Atensi: true,
        Nama_Atensi: true,
        Singkatan: true,
        Tipe: true,
        Kriteria_Jns: true,
        Kriteria_Nilai: true,
        Satuan: true,
        Syntax: true,
        Std_Caption: true,
        Real_Caption: true,
        Dif_Caption: true,
      },
      orderBy: { Jns_Atensi: 'asc' },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch Jns Atensi:', error)
    return NextResponse.json({ error: 'Failed to fetch Jns Atensi' }, { status: 500 })
  }
}

// POST: tambah jenis atensi baru
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      Jns_Atensi,
      Nama_Atensi,
      Singkatan,
      Tipe,
      Kriteria_Jns,
      Kriteria_Nilai,
      Satuan,
      Syntax,
      Std_Caption,
      Real_Caption,
      Dif_Caption,
    } = body

    if (!Jns_Atensi || !Nama_Atensi) {
      return NextResponse.json(
        { error: 'Jns_Atensi dan Nama_Atensi wajib diisi' },
        { status: 400 }
      )
    }

    const data = await prisma.cACM_Jns_Atensi.create({
      data: {
        Jns_Atensi,
        Nama_Atensi,
        Singkatan,
        Tipe,
        Kriteria_Jns,
        Kriteria_Nilai,
        Satuan,
        Syntax,
        Std_Caption,
        Real_Caption,
        Dif_Caption,
      },
      select: {
        Jns_Atensi: true,
        Nama_Atensi: true,
        Singkatan: true,
        Tipe: true,
        Kriteria_Jns: true,
        Kriteria_Nilai: true,
        Satuan: true,
        Syntax: true,
        Std_Caption: true,
        Real_Caption: true,
        Dif_Caption: true,
      },
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Failed to create Jns Atensi:', error)
    return NextResponse.json({ error: 'Failed to create Jns Atensi' }, { status: 500 })
  }
}