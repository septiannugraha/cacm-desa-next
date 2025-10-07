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

    const fiscalYear = session.fiscalYear || new Date().getFullYear()

    // Example: Fetch budget and realization data by village
    // This uses standardized structure: Kategori1, Kategori2, Nilai1, Nilai2
    // You can replace this with actual SQL queries based on your database structure

    // Sample query - adjust based on your actual database schema
    const villages = await prisma.village.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        code: true,
      },
    })

    // Transform to chart data format
    const budgetRealizationByVillage = villages.map((village, index) => ({
      Kategori1: village.name,
      Kategori2: 'Belanja Modal',
      Nilai1: (index + 1) * 150000000, // Replace with actual budget query
      Nilai2: (index + 1) * 135000000, // Replace with actual realization query
    }))

    // Account type distribution
    const budgetByAccountType = [
      {
        Kategori1: 'Belanja Pegawai',
        Kategori2: 'Kategori Belanja',
        Nilai1: 1200000000,
        Nilai2: 1150000000,
      },
      {
        Kategori1: 'Belanja Barang & Jasa',
        Kategori2: 'Kategori Belanja',
        Nilai1: 2100000000,
        Nilai2: 1980000000,
      },
      {
        Kategori1: 'Belanja Modal',
        Kategori2: 'Kategori Belanja',
        Nilai1: 3350000000,
        Nilai2: 3120000000,
      },
      {
        Kategori1: 'Belanja Tidak Terduga',
        Kategori2: 'Kategori Belanja',
        Nilai1: 200000000,
        Nilai2: 180000000,
      },
    ]

    // Monthly trend - could be fetched from database aggregations
    const monthlyTrend = [
      {
        Kategori1: 'Januari',
        Kategori2: 'Bulan',
        Nilai1: 800000000,
        Nilai2: 720000000,
      },
      {
        Kategori1: 'Februari',
        Kategori2: 'Bulan',
        Nilai1: 900000000,
        Nilai2: 850000000,
      },
      {
        Kategori1: 'Maret',
        Kategori2: 'Bulan',
        Nilai1: 950000000,
        Nilai2: 920000000,
      },
      {
        Kategori1: 'April',
        Kategori2: 'Bulan',
        Nilai1: 1100000000,
        Nilai2: 1050000000,
      },
      {
        Kategori1: 'Mei',
        Kategori2: 'Bulan',
        Nilai1: 1200000000,
        Nilai2: 1150000000,
      },
      {
        Kategori1: 'Juni',
        Kategori2: 'Bulan',
        Nilai1: 1150000000,
        Nilai2: 1100000000,
      },
    ]

    return NextResponse.json({
      budgetRealizationByVillage,
      budgetByAccountType,
      monthlyTrend,
    })
  } catch (error) {
    console.error('Dashboard chart data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
