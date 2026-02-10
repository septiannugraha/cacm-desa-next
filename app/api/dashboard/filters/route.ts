import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode') // 'initial'
    const type = (searchParams.get('type') || '').toLowerCase()
    const kdProv = (searchParams.get('kdProv') || '').trim()
    const kdPemda = (searchParams.get('kdPemda') || '').trim()
    const kdKec = (searchParams.get('kdKec') || '').trim()

    // ===== ambil kd pemda dari session =====
    const pemdakdRaw = String((session.user as any)?.pemdakd || '').trim() // contoh: "3521"
    const userKdProv = pemdakdRaw.length >= 2 ? pemdakdRaw.substring(0, 2) : ''
    const userKdPemda = pemdakdRaw.length >= 4 ? pemdakdRaw.substring(0, 4) : ''

    // Log untuk debugging (opsional)
    console.log('[filters] params =>', { mode, type, kdProv, kdPemda, kdKec, userKdProv, userKdPemda })

    // ============ INITIAL PRELOAD ============
    // Dipakai oleh page Anda untuk set filter awal.
    if (mode === 'initial') {
      // kalau pemdakd kosong, tetap balikin JSON tapi minimal
      if (!userKdPemda) {
        return NextResponse.json({
          type: 'initial',
          data: {
            selected: { kdProv: '', provinsi: '', kdPemda: '', pemda: '' },
            pemda: [],
          },
        })
      }

      const provRows = await prisma.$queryRaw<Array<{ nama: string; Kd_Prov: string }>>`
        SELECT TOP 1 Nama_Provinsi as nama, Kd_Prov
        FROM Ref_Provinsi
        WHERE Kd_Prov = ${userKdProv}
      `
      const provRow = provRows?.[0]

      const pemdaRows = await prisma.$queryRaw<Array<{ nama: string; Kd_Pemda: string; Kd_Prov: string }>>`
        SELECT TOP 1 Nama_Pemda as nama, Kd_Pemda, Kd_Prov
        FROM Ref_Pemda
        WHERE Kd_Pemda = ${userKdPemda}
      `
      const pemdaRow = pemdaRows?.[0]

      // ✅ hanya pemda milik user
      const pemdaList = await prisma.$queryRaw<Array<{ namapemda: string; Kd_Pemda: string }>>`
        SELECT (SUBSTRING(Kd_Pemda, 3, 2) + '  ' + Nama_Pemda) as namapemda, Kd_Pemda
        FROM Ref_Pemda
        WHERE Kd_Pemda = ${userKdPemda}
      `

      return NextResponse.json({
        type: 'initial',
        data: {
          selected: {
            kdProv: provRow?.Kd_Prov ?? userKdProv,
            provinsi: provRow?.nama ?? '',
            kdPemda: pemdaRow?.Kd_Pemda ?? userKdPemda,
            pemda: pemdaRow?.nama ?? '',
          },
          pemda: pemdaList || [],
        },
      })
    }

    // ============ LAZY TYPES ============
    if (type === 'provinsi') {
      const rows = await prisma.$queryRaw<Array<{ provinsi: string; Kd_Prov: string }>>`
        SELECT (SUBSTRING(Kd_Prov, 1, 2) + '  ' + Nama_Provinsi) as provinsi, Kd_Prov
        FROM Ref_Provinsi
        ORDER BY Kd_Prov
      `
      return NextResponse.json({ type: 'provinsi', data: rows || [] })
    }

    if (type === 'pemda') {
      // ✅ supaya aman, saya batasi pemda hanya pemda milik user.
      // Kalau Anda mau semua pemda dalam provinsi, ganti WHERE jadi `WHERE Kd_Prov = ${baseKdProv}`
      const baseKdProv = kdProv || userKdProv
      if (!baseKdProv) return NextResponse.json({ type: 'pemda', data: [] })

      const rows = await prisma.$queryRaw<Array<{ namapemda: string; Kd_Pemda: string }>>`
        SELECT (SUBSTRING(Kd_Pemda, 3, 2) + '  ' + Nama_Pemda) as namapemda, Kd_Pemda
        FROM Ref_Pemda
        WHERE Kd_Pemda = ${userKdPemda}
        ORDER BY Kd_Pemda
      `
      return NextResponse.json({ type: 'pemda', data: rows || [] })
    }

    if (type === 'kecamatan') {
      const baseKdPemda = kdPemda || userKdPemda
      if (!baseKdPemda) return NextResponse.json({ type: 'kecamatan', data: [] })

      const rows = await prisma.$queryRaw<Array<{ kecamatan: string; Kd_Kec: string }>>`
        SELECT (SUBSTRING(Kd_Kec, 6, 2) + '  ' + Nama_Kecamatan) as kecamatan, Kd_Kec
        FROM Ref_Kecamatan
        WHERE Kd_Pemda = ${baseKdPemda}
        ORDER BY Kd_Kec
      `
      return NextResponse.json({ type: 'kecamatan', data: rows || [] })
    }

    if (type === 'desa') {
      if (!kdKec) return NextResponse.json({ type: 'desa', data: [] })

      const rows = await prisma.$queryRaw<Array<{ desa: string; Kd_Desa: string }>>`
        SELECT (SUBSTRING(Kd_Desa, 6, 7) + '  ' + Nama_Desa) as desa, Kd_Desa
        FROM Ref_Desa
        WHERE Kd_Kec = ${kdKec}
        ORDER BY Kd_Desa
      `
      return NextResponse.json({ type: 'desa', data: rows || [] })
    }

    if (type === 'sumberdana') {
      const rows = await prisma.$queryRaw<Array<{ sumberdana: string; Kode: string }>>`
        SELECT (Kode + '  ' + Nama_Sumber) as sumberdana, Kode
        FROM Ref_SumberDana
        ORDER BY Urut
      `
      return NextResponse.json({ type: 'sumberdana', data: rows || [] })
    }

    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  } catch (error: any) {
    console.error('[api/dashboard/filters] error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch filter data' },
      { status: 500 }
    )
  }
}
