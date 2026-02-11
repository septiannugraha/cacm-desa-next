// File: app/api/dokumentasi/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function toDateOrThrow(v: any, fieldName: string): Date {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid datetime for ${fieldName}`)
  }
  return d
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
    const kdPemda = session.user.pemdakd
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    const row = await prisma.cACM_Atensi.findUnique({
      where: { id },
      select: {
        id: true,
        Tahun: true,
        Kd_Pemda: true,
        No_Atensi: true,
        Tgl_Atensi: true,
        Tgl_CutOff: true,
        Keterangan: true,
        isSent: true,
      },
    })
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // guard scope
    if (row.Kd_Pemda !== kdPemda || row.Tahun !== fiscalYear) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ data: row })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch detail' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
      
    const kdPemda = session.user.pemdakd
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    // ⬇️ tambahkan No_Atensi agar bisa dibandingkan
    const current = await prisma.cACM_Atensi.findUnique({
      where: { id },
      select: { id: true, Tahun: true, Kd_Pemda: true, No_Atensi: true },
    })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Guard scope
    if (current.Kd_Pemda !== kdPemda || current.Tahun !== fiscalYear) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let body: any = null
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { No_Atensi, Tgl_Atensi, Tgl_CutOff, Keterangan } = body || {}

    // optional field update: hanya set kalau dikirim
    const dataToUpdate: any = {
      update_at: new Date(),
      update_by: (session.user as any)?.username || (session.user as any)?.name || session.user.email || null,
    }

    // ✅ PERUBAHAN: izinkan update No_Atensi
    if (No_Atensi !== undefined) {
      const v = String(No_Atensi).trim()
      if (!v) return NextResponse.json({ error: 'No_Atensi tidak boleh kosong' }, { status: 400 })
      dataToUpdate.No_Atensi = v
    }

    if (Tgl_Atensi !== undefined) {
      dataToUpdate.Tgl_Atensi = Tgl_Atensi ? toDateOrThrow(Tgl_Atensi, 'Tgl_Atensi') : null
    }
    if (Tgl_CutOff !== undefined) {
      dataToUpdate.Tgl_CutOff = Tgl_CutOff ? toDateOrThrow(Tgl_CutOff, 'Tgl_CutOff') : null
    }
    if (Keterangan !== undefined) {
      dataToUpdate.Keterangan = Keterangan ? String(Keterangan) : null
    }

    // ✅ PERUBAHAN: kalau No_Atensi berubah, cek bentrok PK komposit (Tahun, Kd_Pemda, No_Atensi)
    const newNoAtensi =
      dataToUpdate.No_Atensi !== undefined ? (dataToUpdate.No_Atensi as string) : undefined
    const noChanged = newNoAtensi !== undefined && newNoAtensi !== current.No_Atensi

    const updated = await prisma.$transaction(async (tx) => {
      if (noChanged) {
        const dup = await tx.cACM_Atensi.findFirst({
          where: {
            Tahun: current.Tahun,
            Kd_Pemda: current.Kd_Pemda,
            No_Atensi: newNoAtensi,
          },
          select: { id: true },
        })
        if (dup && dup.id !== current.id) {
          // 409 = conflict
          return NextResponse.json({ error: 'Nomor Atensi sudah digunakan.' }, { status: 409 }) as any
        }
      }

      return tx.cACM_Atensi.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          Tahun: true,
          Kd_Pemda: true,
          No_Atensi: true,
          Tgl_Atensi: true,
          Tgl_CutOff: true,
          Keterangan: true,
          isSent: true,
        },
      })
    })

    // jika transaction mengembalikan NextResponse (conflict), return itu
    if (updated instanceof NextResponse) return updated

    return NextResponse.json({ message: 'Updated', data: updated })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || 'Failed to update' }, { status: 500 })
  }
}
