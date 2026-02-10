// File: app/api/desa/route.ts  (atau sesuaikan path Anda)
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// helper scope
async function getScope() {
  const session = await getServerSession(authOptions)
  if (!session) return { session: null, kdPemda: null, fiscalYear: null }
 
  const kdPemda = session.user.pemdakd
  const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

  return { session, kdPemda, fiscalYear }
}

// GET: ambil daftar desa (filter Kd_Pemda + Tahun dari session)
export async function GET() {
  try {
    const { session, kdPemda, fiscalYear } = await getScope()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!kdPemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })

    const villages = await prisma.ta_Desa.findMany({
      where: {
        Tahun: fiscalYear,
        Kd_Pemda: kdPemda,
      },
      select: {
        id: true,
        Kd_Desa: true,
        Nama_Desa: true,
        Alamat: true,
        Ibukota: true,
        HP_Kades: true,
      },
      orderBy: { Kd_Desa: 'asc' },
    })

    return NextResponse.json({ data: villages })
  } catch (error) {
    console.error('Failed to fetch desa:', error)
    return NextResponse.json({ error: 'Failed to fetch desa' }, { status: 500 })
  }
}

// POST: tambah desa baru (Kd_Pemda + Tahun otomatis dari session)
export async function POST(request: Request) {
  try {
    const { session, kdPemda, fiscalYear } = await getScope()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!kdPemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })

    let body: any = null
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { Kd_Desa, Nama_Desa, Alamat, Ibukota, HP_Kades } = body || {}

    if (!Kd_Desa || !Nama_Desa) {
      return NextResponse.json({ error: 'Kode desa dan nama desa wajib diisi' }, { status: 400 })
    }

    const desa = await prisma.ta_Desa.create({
      data: {
        Kd_Desa: String(Kd_Desa),
        Nama_Desa: String(Nama_Desa),
        Alamat: Alamat ?? null,
        Ibukota: Ibukota ?? null,
        HP_Kades: HP_Kades ?? null,
        Tahun: fiscalYear,
        Kd_Pemda: kdPemda,
        // kalau tabel Anda punya audit fields, isi di sini
        // create_at: new Date(),
        // create_by: (session.user as any)?.username || session.user.email || null,
      },
      select: {
        id: true,
        Tahun: true,
        Kd_Pemda: true,
        Kd_Desa: true,
        Nama_Desa: true,
        Alamat: true,
        Ibukota: true,
        HP_Kades: true,
      },
    })

    return NextResponse.json({ data: desa }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create desa:', error)

    // kalau unique constraint composite kena (Tahun,Kd_Pemda,Kd_Desa)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Kode desa sudah ada untuk Pemda & Tahun ini' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to create desa' }, { status: 500 })
  }
}
