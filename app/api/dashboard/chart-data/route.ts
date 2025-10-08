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
    console.log('[Dashboard] FiscalYear:', fiscalYear)
    console.log('[Dashboard] User PemdaId:', session.user.pemdaId)

    // Get pemda code from user's CACM_Pemda
    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })

    if (!pemda) {
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    }

    // Try to extract numeric code from pemda.code
    // If code is already numeric (like "3513"), use it
    // If code is text (like "BANDUNG"), we need to look up the actual code
    let kdPemda = pemda.code
    const numericMatch = pemda.code.match(/\d{4}/)
    if (numericMatch) {
      kdPemda = numericMatch[0]
    } else {
      // For now, we'll try first 4 chars, but log a warning
      kdPemda = pemda.code.substring(0, 4)
      console.warn('[Dashboard] Pemda code is not numeric:', pemda.code)
    }
    console.log('[Dashboard] Pemda Code (full):', pemda.code)
    console.log('[Dashboard] Kd_Pemda for query:', kdPemda)

    // Test data for this year
    let activeFiscalYear = fiscalYear
    const yearCount = await prisma.taAR1RealisasiAPBDes.count({
      where: { Tahun: activeFiscalYear.toString() }
    })
    console.log('[Dashboard] Records for year', activeFiscalYear, ':', yearCount)

    // If no data for this year, try to find what years are available
    if (yearCount === 0) {
      console.log('[Dashboard] No data for year', activeFiscalYear, ', checking available years...')
      const availableYears = await prisma.taAR1RealisasiAPBDes.groupBy({
        by: ['Tahun'],
        _count: { Tahun: true },
        orderBy: { Tahun: 'desc' }
      })
      console.log('[Dashboard] Available years in database:', availableYears)

      // Use the most recent available year
      if (availableYears.length > 0) {
        activeFiscalYear = parseInt(availableYears[0].Tahun)
        console.log('[Dashboard] Falling back to year:', activeFiscalYear)
      }
    }

    // Test data for this pemda
    const pemdaCount = await prisma.taAR1RealisasiAPBDes.count({
      where: { Kd_Pemda: kdPemda }
    })
    console.log('[Dashboard] Records for pemda', kdPemda, ':', pemdaCount)

    // If no data found with this pemda code, try to find what Kd_Pemda values exist
    if (pemdaCount === 0) {
      console.log('[Dashboard] No data for this pemda code, checking available Kd_Pemda values...')
      const availablePemdas = await prisma.taAR1RealisasiAPBDes.groupBy({
        by: ['Kd_Pemda'],
        _count: { Kd_Pemda: true }
      })
      console.log('[Dashboard] Available Kd_Pemda in database:', availablePemdas)

      // Use the first available Kd_Pemda if any exists
      if (availablePemdas.length > 0) {
        kdPemda = availablePemdas[0].Kd_Pemda
        console.log('[Dashboard] Falling back to Kd_Pemda:', kdPemda)
      }
    }

    // 1. Budget Realization by Village Chart
    // Aggregate APBDes data grouped by village
    const villageData = await prisma.taAR1RealisasiAPBDes.groupBy({
      by: ['Kd_Desa'],
      where: {
        Tahun: activeFiscalYear.toString(),
        Kd_Pemda: kdPemda,
      },
      _sum: {
        JmlAnggaran: true,
        JmlRealisasi: true,
      },
      orderBy: {
        _sum: {
          JmlAnggaran: 'desc',
        },
      },
      take: 5,
    })

    console.log('[Dashboard] Village Data Count:', villageData.length)
    if (villageData.length > 0) {
      console.log('[Dashboard] Sample Village Data:', villageData[0])
    } else {
      console.log('[Dashboard] No village data found, checking if any data exists...')
      const anyData = await prisma.taAR1RealisasiAPBDes.findMany({ take: 5 })
      console.log('[Dashboard] Sample raw data (first 5 records):', anyData.map(d => ({
        Tahun: d.Tahun,
        Kd_Pemda: d.Kd_Pemda,
        Kd_Desa: d.Kd_Desa,
        JmlAnggaran: d.JmlAnggaran
      })))
    }

    // Get village names
    const villageCodes = villageData.map(v => v.Kd_Desa)
    const villages = await prisma.taDesa.findMany({
      where: {
        Tahun: activeFiscalYear.toString(),
        Kd_Pemda: kdPemda,
        Kd_Desa: { in: villageCodes },
      },
      select: {
        Kd_Desa: true,
        Nama_Desa: true,
      },
    })

    const villageMap = new Map(villages.map(v => [v.Kd_Desa, v.Nama_Desa || v.Kd_Desa]))

    const budgetRealizationByVillage = villageData.map((village) => ({
      Kategori1: villageMap.get(village.Kd_Desa) || village.Kd_Desa,
      Kategori2: 'APBDes Desa',
      Nilai1: village._sum.JmlAnggaran || 0,
      Nilai2: village._sum.JmlRealisasi || 0,
    }))

    // 2. Budget by Account Type Chart
    // Aggregate by Kelompok (account group)
    const accountData = await prisma.taAR1RealisasiAPBDes.groupBy({
      by: ['Kelompok', 'Nama_Kelompok'],
      where: {
        Tahun: activeFiscalYear.toString(),
        Kd_Pemda: kdPemda,
      },
      _sum: {
        JmlAnggaran: true,
        JmlRealisasi: true,
      },
      orderBy: {
        _sum: {
          JmlAnggaran: 'desc',
        },
      },
      take: 5,
    })

    const budgetByAccountType = accountData.map((account) => ({
      Kategori1: account.Nama_Kelompok || account.Kelompok,
      Kategori2: 'Kategori APBDes',
      Nilai1: account._sum.JmlAnggaran || 0,
      Nilai2: account._sum.JmlRealisasi || 0,
    }))

    console.log('[Dashboard] Account Data Count:', accountData.length)
    if (accountData.length > 0) {
      console.log('[Dashboard] Sample Account Data:', accountData[0])
    }

    // 3. Monthly Trend - Keep dummy data for now as table doesn't have date breakdown
    // TODO: Replace with actual monthly data if available
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

    console.log('[Dashboard] Final Response:', {
      villages: budgetRealizationByVillage.length,
      accounts: budgetByAccountType.length,
      monthly: monthlyTrend.length
    })

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
