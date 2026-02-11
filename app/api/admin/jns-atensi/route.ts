// app/api/jnsatensi/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all jenis atensi records
    const jnsAtensi = await prisma.cACM_Jns_Atensi.findMany({
      select: {
        Jns_Atensi: true,
        Nama_Atensi: true,
        Singkatan: true,
        Tipe: true,
      },
      orderBy: { Nama_Atensi: 'asc' },
    })

    return NextResponse.json(jnsAtensi)
  } catch (error) {
    console.error('Failed to fetch jenis atensi:', error)
    return NextResponse.json({ error: 'Failed to fetch jenis atensi' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Assuming there's a way to fetch `Kd_Pemda` from session or user
    const kdPemda = session.user.pemdakd

    const body = await req.json()
    const { Nama_Atensi, Singkatan, Tipe, Kriteria_Jns, Kriteria_Nilai, Satuan, Syntax, Std_Caption, Real_Caption, Dif_Caption, create_by } = body

    // Ensure Nama_Atensi is provided
    if (!Nama_Atensi) {
      return NextResponse.json({ error: 'Nama Atensi wajib diisi' }, { status: 400 })
    }

    // Check if the entry already exists based on composite key
    const existing = await prisma.cACM_Jns_Atensi.findFirst({
      where: {
        Nama_Atensi: Nama_Atensi,  // Assuming unique Nama_Atensi for simplicity
      },
      select: { Jns_Atensi: true },
    })
    if (existing) {
      return NextResponse.json({ error: 'Nama Atensi already exists' }, { status: 409 })
    }

    // Create the new jenis atensi record
    const newJnsAtensi = await prisma.cACM_Jns_Atensi.create({
      data: {
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
        create_at: new Date(),
        create_by,
      },
      select: {
        Jns_Atensi: true,
        Nama_Atensi: true,
        Singkatan: true,
        Tipe: true,
      },
    })

    return NextResponse.json({ message: 'Created', data: newJnsAtensi }, { status: 201 })
  } catch (error) {
    console.error('Failed to create jenis atensi:', error)
    return NextResponse.json({ error: 'Failed to create jenis atensi' }, { status: 500 })
  }
}
