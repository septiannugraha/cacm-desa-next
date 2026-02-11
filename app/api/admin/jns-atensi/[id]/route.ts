// app/api/jnsatensi/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jnsAtensi = await prisma.cACM_Jns_Atensi.findUnique({
      where: { Jns_Atensi: parseInt(id) },
    })

    if (!jnsAtensi) {
      return NextResponse.json({ error: 'Jenis Atensi not found' }, { status: 404 })
    }

    return NextResponse.json(jnsAtensi)
  } catch (error) {
    console.error('Error fetching jenis atensi by ID:', error)
    return NextResponse.json({ error: 'Failed to fetch jenis atensi by ID' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await req.json()

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { Nama_Atensi, Singkatan, Tipe, Kriteria_Jns, Kriteria_Nilai, Satuan, Syntax, Std_Caption, Real_Caption, Dif_Caption, update_by } = body

    // Ensure Nama_Atensi is provided
    if (!Nama_Atensi) {
      return NextResponse.json({ error: 'Nama Atensi wajib diisi' }, { status: 400 })
    }

    const updatedJnsAtensi = await prisma.cACM_Jns_Atensi.update({
      where: { Jns_Atensi: parseInt(id) },
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
        update_at: new Date(),
        update_by,
      },
    })

    return NextResponse.json(updatedJnsAtensi)
  } catch (error) {
    console.error('Error updating jenis atensi:', error)
    return NextResponse.json({ error: 'Failed to update jenis atensi' }, { status: 500 })
  }
}
