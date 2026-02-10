// File: app/api/dokumentasi/arsipkan/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ubah input tanggal jadi YYYYMMDD (paling aman untuk SQL Server)
function toYYYYMMDD(v: any, field: string): string {
  if (!v) throw new Error(`${field} wajib`)

  // jika input dari <input type="date"> => "YYYY-MM-DD"
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.trim())) {
    return v.trim().replaceAll('-', '') // YYYYMMDD
  }

  // jika ISO string lain / Date
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date for ${field}`)

  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}` // YYYYMMDD
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 

    // Tahun & Kd_Pemda dari session
    const Tahun = (session.fiscalYear || new Date().getFullYear()).toString()
    const Kd_Pemda = session.user.pemdakd

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const NoAtensi = String(body?.NoAtensi || body?.No_Atensi || '').trim()
    const Keterangan = body?.Keterangan ?? null

    const rawCutoff = body?.Tanggal_CutOff ?? body?.Tgl_CutOff
    const rawAtensi = body?.TanggalAtensi ?? body?.Tgl_Atensi

    if (!NoAtensi) return NextResponse.json({ error: 'NoAtensi wajib' }, { status: 400 })
    if (!rawCutoff) return NextResponse.json({ error: 'Tanggal_CutOff wajib' }, { status: 400 })
    if (!rawAtensi) return NextResponse.json({ error: 'TanggalAtensi wajib' }, { status: 400 })

    // ✅ kirim tanggal sebagai YYYYMMDD agar SQL Server implicit-convert tanpa error
    const Tanggal_CutOff = toYYYYMMDD(rawCutoff, 'Tanggal_CutOff')
    const TanggalAtensi = toYYYYMMDD(rawAtensi, 'TanggalAtensi')

    const Usrname =
      (session.user as any)?.username ||
      (session.user as any)?.name ||
      session.user.email ||
      'system'

    // ⚠️ Tambahkan dbo. jika SP ada di schema dbo
    await prisma.$executeRaw`
      EXEC dbo.SP_CACM_RedFlag_Dokumentasi
        ${Tahun},
        ${Kd_Pemda},
        ${Tanggal_CutOff},
        ${NoAtensi},
        ${TanggalAtensi},
        ${Keterangan},
        ${Usrname}
    `

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('SP_CACM_RedFlag_Dokumentasi error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to execute stored procedure' },
      { status: 500 }
    )
  }
}
