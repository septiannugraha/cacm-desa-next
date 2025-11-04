import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Ambil query parameter
    const { searchParams } = new URL(request.url)
    const Kd_Pemda = searchParams.get('Kd_Pemda')
    const Tahun = searchParams.get('Tahun')

    // Validasi input
    if (!Kd_Pemda || !Tahun) {
      return NextResponse.json(
        { error: 'Missing Kd_Pemda or Tahun parameter' },
        { status: 400 }
      )
    }

    // Ambil data status terakhir dari database
    const refreshStatus = await prisma.cACM_RefreshStatus.findFirst({
      where: {
        Kd_Pemda: Kd_Pemda,
        Tahun: Tahun,
      },
      orderBy: {
        UpdatedAt: 'desc', // Ambil yang paling baru jika ada lebih dari satu
      },
    })

    // Jika tidak ada data ditemukan
    if (!refreshStatus) {
      return NextResponse.json({
        message: 'No refresh status found for this Pemda and Tahun',
        lastUpdate: null,
        status: 'not_found',
      })
    }

    // Jika ada, kirim response
    return NextResponse.json({
      status: refreshStatus.Status ?? 'unknown',
      lastUpdate: refreshStatus.UpdatedAt ?? null,
    })
  } catch (error) {
    console.error('Error fetching dashboard status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard status' },
      { status: 500 }
    )
  }
}
