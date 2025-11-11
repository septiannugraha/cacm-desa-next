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
    const type = (searchParams.get('type') || '').toLowerCase() // normalisasi
    const kdProv = searchParams.get('kdProv') || ''
    const kdPemda = searchParams.get('kdPemda') || ''
    const kdKec = searchParams.get('kdKec') || ''

    // Log untuk debugging
    console.log('[filters] params =>', { mode, type, kdProv, kdPemda, kdKec })

    // Ambil code Pemda dari session -> derive kdProv(2) & kdPemda(4)
    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })
    if (!pemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })

    const userKdProv = pemda.code.substring(0, 2)
    const userKdPemda = pemda.code.substring(0, 4)

    // ============ INITIAL PRELOAD ============
    if (mode === 'initial') {
      const [provRow] = await prisma.$queryRaw<Array<{ nama: string; Kd_Prov: string }>>`
        SELECT Nama_Provinsi as nama, Kd_Prov
        FROM Ref_Provinsi
        WHERE Kd_Prov = ${userKdProv}
      `
      const [pemdaRow] = await prisma.$queryRaw<Array<{ nama: string; Kd_Pemda: string; Kd_Prov: string }>>`
        SELECT Nama_Pemda as nama, Kd_Pemda, Kd_Prov
        FROM Ref_Pemda
        WHERE Kd_Pemda = ${userKdPemda}
      `
      // perbaikan: hanya pemda user (mis. 3521 = Kab. Ngawi)
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
          pemda: pemdaList,
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
      console.log('[filters] result provinsi:', rows.length)
      return NextResponse.json({ type: 'provinsi', data: rows })
    }

    if (type === 'pemda') {
      const baseKdProv = kdProv || userKdProv
      const rows = await prisma.$queryRaw<Array<{ namapemda: string; Kd_Pemda: string }>>`
        SELECT (SUBSTRING(Kd_Pemda, 3, 2) + '  ' + Nama_Pemda) as namapemda, Kd_Pemda
        FROM Ref_Pemda
        WHERE Kd_Prov = ${baseKdProv}
        ORDER BY Kd_Pemda
      `
      console.log('[filters] result pemda:', rows.length, 'for kdProv:', baseKdProv)
      return NextResponse.json({ type: 'pemda', data: rows })
    }

    if (type === 'kecamatan') {
      const baseKdPemda = kdPemda || userKdPemda
      const rows = await prisma.$queryRaw<Array<{ kecamatan: string; Kd_Kec: string }>>`
        SELECT (SUBSTRING(Kd_Kec, 6, 2) + '  ' + Nama_Kecamatan) as kecamatan, Kd_Kec
        FROM Ref_Kecamatan
        WHERE Kd_Pemda = ${baseKdPemda}
        ORDER BY Kd_Kec
      `
      console.log('[filters] result kecamatan:', rows.length, 'for kdPemda:', baseKdPemda)
      return NextResponse.json({ type: 'kecamatan', data: rows })
    }

    if (type === 'desa') {
      if (!kdKec) return NextResponse.json({ type: 'desa', data: [] })
      const rows = await prisma.$queryRaw<Array<{ desa: string; Kd_Desa: string }>>`
        SELECT (SUBSTRING(Kd_Desa, 6, 7) + '  ' + Nama_Desa) as desa, Kd_Desa
        FROM Ref_Desa
        WHERE Kd_Kec = ${kdKec}
        ORDER BY Kd_Desa
      `
      console.log('[filters] result desa:', rows.length, 'for kdKec:', kdKec)
      return NextResponse.json({ type: 'desa', data: rows })
    }

    if (type === 'sumberdana') {
      const rows = await prisma.$queryRaw<Array<{ sumberdana: string; Kode: string }>>`
        SELECT (Kode + '  ' + Nama_Sumber) as sumberdana, Kode
        FROM Ref_SumberDana
        ORDER BY Urut
      `
      console.log('[filters] result sumberdana:', rows.length)
      return NextResponse.json({ type: 'sumberdana', data: rows })
    }

    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  } catch (error) {
    console.error('Filter lazy fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch filter data' }, { status: 500 })
  }
}
