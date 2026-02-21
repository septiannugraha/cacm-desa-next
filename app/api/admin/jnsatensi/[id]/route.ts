// app/api/jnsatensi/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Fetch single Jenis Atensi record by ID
export function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return params
    .then(async ({ id }) => {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const kdPemda = session.user.pemdakd
      const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

      return prisma.cACM_Jns_Atensi.findUnique({
        where: { Jns_Atensi: parseInt(id) },
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
        .then((jnsAtensi) => {
          if (!jnsAtensi) return NextResponse.json({ error: 'Jenis Atensi not found' }, { status: 404 })
          return NextResponse.json(jnsAtensi)
        })
        .catch((error) => {
          console.error('Error fetching jenis atensi by ID:', error)
          return NextResponse.json({ error: 'Failed to fetch jenis atensi by ID' }, { status: 500 })
        })
    })
}



// PUT: Update an existing Jenis Atensi record by ID
export function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return params
    .then(async ({ id }) => {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const body = await req.json()
      const { Jns_Atensi, Nama_Atensi, Singkatan, Tipe, Kriteria_Jns, Kriteria_Nilai, Satuan, Syntax, Std_Caption, Real_Caption, Dif_Caption } = body

      // Fetch current data
      const current = await prisma.cACM_Jns_Atensi.findUnique({
        where: { Jns_Atensi: Number(id) },
        select: {
          Jns_Atensi: true,
          Nama_Atensi: true,
          Singkatan: true,
          Tipe: true,
        },
      })
      if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      // Data to update, excluding Jns_Atensi
      const dataToUpdate: any = {
        update_at: new Date(),
        update_by: session.user.username || session.user.email || null,
      }

      // Only allow update of non-primary key fields
      if (Nama_Atensi !== undefined) dataToUpdate.Nama_Atensi = Nama_Atensi
      if (Singkatan !== undefined) dataToUpdate.Singkatan = Singkatan
      if (Tipe !== undefined) dataToUpdate.Tipe = Tipe
      if (Kriteria_Jns !== undefined) dataToUpdate.Kriteria_Jns = Kriteria_Jns
      if (Kriteria_Nilai !== undefined) dataToUpdate.Kriteria_Nilai = Kriteria_Nilai
      if (Satuan !== undefined) dataToUpdate.Satuan = Satuan
      if (Syntax !== undefined) dataToUpdate.Syntax = Syntax
      if (Std_Caption !== undefined) dataToUpdate.Std_Caption = Std_Caption
      if (Real_Caption !== undefined) dataToUpdate.Real_Caption = Real_Caption
      if (Dif_Caption !== undefined) dataToUpdate.Dif_Caption = Dif_Caption

      // Proceed with the update
      return prisma.cACM_Jns_Atensi.update({
        where: { Jns_Atensi: Number(id) },
        data: dataToUpdate,
        select: {
          Jns_Atensi: true,
          Nama_Atensi: true,
          Singkatan: true,
          Tipe: true,
        },
      })
        .then((updated) => {
          return NextResponse.json({ message: 'Updated', data: updated })
        })
        .catch((error) => {
          console.error('Failed to update jenis atensi:', error)
          return NextResponse.json({ error: 'Failed to update jenis atensi' }, { status: 500 })
        })
    })
    .catch((error) => {
      console.error('Error:', error)
      return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
    })
}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const  { id } = await params

    // Ensure the id is provided
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Attempt to find the record to be deleted
    const existing = await prisma.cACM_Jns_Atensi.findUnique({
      where: { Jns_Atensi: parseInt(id) }, // Parse ID into number
    })

    if (!existing) {
      return NextResponse.json({ error: 'Jenis Atensi not found' }, { status: 404 })
    }

    // Perform the deletion
    await prisma.cACM_Jns_Atensi.delete({
      where: { Jns_Atensi: parseInt(id) },
    })

    return NextResponse.json({ message: 'Jenis Atensi deleted successfully' })
  } catch (error) {
    console.error('Failed to delete jenis atensi:', error)
    return NextResponse.json({ error: 'Failed to delete jenis atensi' }, { status: 500 })
  }
}