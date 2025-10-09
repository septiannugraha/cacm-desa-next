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

    // Get user's pemda code for filtering
    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })

    if (!pemda) {
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    }

    // Extract Kd_Pemda (first 4 chars of code)
    const kdPemda = pemda.code.substring(0, 4)

    // Query for Kecamatan - FILTERED by user's Pemda
    // Select Substring(kd_Kec,6,2) + '  ' + Nama_Kecamatan as kecamatan from Ref_Kecamatan order by Kd_Kec
    const kecamatanData = await prisma.$queryRaw<Array<{kecamatan: string, Kd_Kec: string}>>`
      SELECT SUBSTRING(Kd_Kec, 6, 2) + '  ' + Nama_Kecamatan as kecamatan, Kd_Kec
      FROM Ref_Kecamatan
      WHERE Kd_Pemda = ${kdPemda}
      ORDER BY Kd_Kec
    `

    // Query for Desa - FILTERED by user's Pemda (via Kecamatan join)
    // Select Substring(Kd_Desa,6,7) + '  ' + Nama_Desa as kecamatan from Ref_Desa order by Kd_Desa
    const desaData = await prisma.$queryRaw<Array<{desa: string, Kd_Desa: string}>>`
      SELECT SUBSTRING(d.Kd_Desa, 6, 7) + '  ' + d.Nama_Desa as desa, d.Kd_Desa
      FROM Ref_Desa d
      INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
      WHERE k.Kd_Pemda = ${kdPemda}
      ORDER BY d.Kd_Desa
    `

    // Query for Sumber Dana
    // Select Kode + '  ' + Nama_Sumber as sumberdana From Ref_SumberDana order by Urut
    const sumberDanaData = await prisma.$queryRaw<Array<{sumberdana: string, Kode: string}>>`
      SELECT Kode + '  ' + Nama_Sumber as sumberdana, Kode
      FROM Ref_SumberDana
      ORDER BY Urut
    `

    console.log('[Filters] Pemda:', kdPemda, '- Fetched data:', {
      kecamatan: kecamatanData.length,
      desa: desaData.length,
      sumberDana: sumberDanaData.length
    })

    return NextResponse.json({
      kecamatan: kecamatanData,
      desa: desaData,
      sumberDana: sumberDanaData
    })
  } catch (error) {
    console.error('Filter data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter data' },
      { status: 500 }
    )
  }
}
