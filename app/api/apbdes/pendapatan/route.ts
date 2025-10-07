import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Fetch Pendapatan (Revenue) data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tahun = searchParams.get('tahun') || session.fiscalYear.toString()
    const kdDesa = searchParams.get('kdDesa')
    const kdPemda = searchParams.get('kdPemda')

    const where: Record<string, unknown> = {
      Tahun: parseInt(tahun),
    }

    if (kdDesa) where.Kd_Desa = kdDesa
    if (kdPemda) where.Kd_Pemda = kdPemda

    // Fetch revenue realization data
    const pendapatanData = await prisma.taAR3RealisasiPendapatan.findMany({
      where,
      orderBy: [
        { Kd_Rincian: 'asc' },
      ],
    })

    // Calculate totals
    const totals = pendapatanData.reduce(
      (acc, item) => ({
        totalAnggaran: acc.totalAnggaran + (item.JmlAnggaran || 0),
        totalRealisasi: acc.totalRealisasi + (item.JmlRealisasi || 0),
      }),
      { totalAnggaran: 0, totalRealisasi: 0 }
    )

    const persenTotal = totals.totalAnggaran > 0
      ? (totals.totalRealisasi / totals.totalAnggaran) * 100
      : 0

    return NextResponse.json({
      data: pendapatanData,
      summary: {
        totalAnggaran: totals.totalAnggaran,
        totalRealisasi: totals.totalRealisasi,
        persenRealisasi: persenTotal,
        jumlahItem: pendapatanData.length,
      },
    })
  } catch (error) {
    console.error('Error fetching pendapatan data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pendapatan data' },
      { status: 500 }
    )
  }
}
