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

    // Query for Kecamatan
    // Select Substring(kd_Kec,6,2) + '  ' + Nama_Kecamatan as kecamatan from Ref_Kecamatan order by Kd_Kec
    const kecamatanData = await prisma.$queryRaw<Array<{kecamatan: string, Kd_Kec: string}>>`
      SELECT SUBSTRING(Kd_Kec, 6, 2) + '  ' + Nama_Kecamatan as kecamatan, Kd_Kec
      FROM Ref_Kecamatan
      ORDER BY Kd_Kec
    `

    // Query for Desa
    // Select Substring(Kd_Desa,6,7) + '  ' + Nama_Desa as kecamatan from Ref_Desa order by Kd_Desa
    const desaData = await prisma.$queryRaw<Array<{desa: string, Kd_Desa: string}>>`
      SELECT SUBSTRING(Kd_Desa, 6, 7) + '  ' + Nama_Desa as desa, Kd_Desa
      FROM Ref_Desa
      ORDER BY Kd_Desa
    `

    // Query for Sumber Dana
    // Select Kode + '  ' + Nama_Sumber as sumberdana From Ref_SumberDana order by Urut
    const sumberDanaData = await prisma.$queryRaw<Array<{sumberdana: string, Kode: string}>>`
      SELECT Kode + '  ' + Nama_Sumber as sumberdana, Kode
      FROM Ref_SumberDana
      ORDER BY Urut
    `

    console.log('[Filters] Fetched data:', {
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
