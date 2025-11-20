import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { RegionStatistics, MapLevel } from '@/types/map';

export async function GET(
  request: NextRequest,
  { params }: { params: { level: string; code: string } }
) {
  try {
    const { level, code } = params;

    // Validate level
    if (!['provinsi', 'pemda', 'kecamatan', 'desa'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level. Must be provinsi, pemda, kecamatan, or desa' },
        { status: 400 }
      );
    }

    const mapLevel = level as MapLevel;

    // Fetch statistics based on level
    let statistics: RegionStatistics;

    switch (mapLevel) {
      case 'provinsi':
        statistics = await getProvinsiStatistics(code);
        break;
      case 'pemda':
        statistics = await getPemdaStatistics(code);
        break;
      case 'kecamatan':
        statistics = await getKecamatanStatistics(code);
        break;
      case 'desa':
        statistics = await getDesaStatistics(code);
        break;
      default:
        return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Failed to fetch map statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

async function getProvinsiStatistics(kdProv: string): Promise<RegionStatistics> {
  // Get province name
  const provinsi = await prisma.ref_Provinsi.findUnique({
    where: { Kd_Prov: kdProv },
  });

  // Count total desa in this province
  const totalDesaResult = await prisma.$queryRaw<Array<{ total: number }>>`
    SELECT COUNT(DISTINCT d.Kd_Desa) as total
    FROM Ref_Desa d
    INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
    INNER JOIN Ref_Pemda p ON k.Kd_Pemda = p.Kd_Pemda
    WHERE p.Kd_Prov = ${kdProv}
  `;

  const totalDesa = totalDesaResult[0]?.total || 0;

  // Get budget statistics (example - adjust based on your schema)
  const budgetStats = await prisma.$queryRaw<Array<{ totalBudget: number; avgBudget: number }>>`
    SELECT
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as totalBudget,
      COALESCE(AVG(CAST(Anggaran as BIGINT)), 0) as avgBudget
    FROM Ta_Belanja b
    INNER JOIN Ta_Desa d ON b.Kd_Desa = d.Kd_Desa AND b.Tahun = d.Tahun
    INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
    INNER JOIN Ref_Pemda p ON k.Kd_Pemda = p.Kd_Pemda
    WHERE p.Kd_Prov = ${kdProv}
  `;

  // Get top 5 pemda by budget
  const topRegions = await prisma.$queryRaw<Array<{ Kategori1: string; Kategori2: string; Nilai1: number; Nilai2: number }>>`
    SELECT TOP 5
      pm.Nama_Pemda as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(b.Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(b.Realisasi as BIGINT)), 0) as Nilai2
    FROM Ref_Pemda pm
    LEFT JOIN Ref_Kecamatan k ON pm.Kd_Pemda = k.Kd_Pemda
    LEFT JOIN Ta_Desa d ON k.Kd_Kec = d.Kd_Kec
    LEFT JOIN Ta_Belanja b ON d.Kd_Desa = b.Kd_Desa AND d.Tahun = b.Tahun
    WHERE pm.Kd_Prov = ${kdProv}
    GROUP BY pm.Nama_Pemda
    ORDER BY Nilai1 DESC
  `;

  // Get budget by type (Pendapatan, Belanja, Pembiayaan)
  const budgetByType = await prisma.$queryRaw<Array<{ Kategori1: string; Kategori2: string; Nilai1: number; Nilai2: number }>>`
    SELECT
      'Pendapatan' as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(Realisasi as BIGINT)), 0) as Nilai2
    FROM Ta_Pendapatan pd
    INNER JOIN Ta_Desa d ON pd.Kd_Desa = d.Kd_Desa AND pd.Tahun = d.Tahun
    INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
    INNER JOIN Ref_Pemda p ON k.Kd_Pemda = p.Kd_Pemda
    WHERE p.Kd_Prov = ${kdProv}
    UNION ALL
    SELECT
      'Belanja' as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(Realisasi as BIGINT)), 0) as Nilai2
    FROM Ta_Belanja b
    INNER JOIN Ta_Desa d ON b.Kd_Desa = d.Kd_Desa AND b.Tahun = d.Tahun
    INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
    INNER JOIN Ref_Pemda p ON k.Kd_Pemda = p.Kd_Pemda
    WHERE p.Kd_Prov = ${kdProv}
  `;

  return {
    level: 'provinsi',
    code: kdProv,
    name: provinsi?.Nama_Provinsi || 'Unknown',
    stats: {
      totalDesa: Number(totalDesa),
      totalBudget: Number(budgetStats[0]?.totalBudget || 0),
      avgBudgetPerDesa: Number(budgetStats[0]?.avgBudget || 0),
      avgIDM: 0, // TODO: Add IDM calculation
      totalAudited: 0, // TODO: Add audit count
      auditPercentage: 0,
    },
    chartData: {
      budgetByType: budgetByType || [],
      topRegions: topRegions || [],
    },
  };
}

async function getPemdaStatistics(kdPemda: string): Promise<RegionStatistics> {
  // Get pemda name
  const pemda = await prisma.ref_Pemda.findUnique({
    where: { Kd_Pemda: kdPemda },
  });

  // Count total desa in this pemda
  const totalDesaResult = await prisma.$queryRaw<Array<{ total: number }>>`
    SELECT COUNT(DISTINCT d.Kd_Desa) as total
    FROM Ref_Desa d
    INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
    WHERE k.Kd_Pemda = ${kdPemda}
  `;

  const totalDesa = totalDesaResult[0]?.total || 0;

  // Get budget statistics
  const budgetStats = await prisma.$queryRaw<Array<{ totalBudget: number; avgBudget: number }>>`
    SELECT
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as totalBudget,
      COALESCE(AVG(CAST(Anggaran as BIGINT)), 0) as avgBudget
    FROM Ta_Belanja b
    INNER JOIN Ta_Desa d ON b.Kd_Desa = d.Kd_Desa AND b.Tahun = d.Tahun
    INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
    WHERE k.Kd_Pemda = ${kdPemda}
  `;

  // Get top 5 kecamatan by budget
  const topRegions = await prisma.$queryRaw<Array<{ Kategori1: string; Kategori2: string; Nilai1: number; Nilai2: number }>>`
    SELECT TOP 5
      k.Nama_Kecamatan as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(b.Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(b.Realisasi as BIGINT)), 0) as Nilai2
    FROM Ref_Kecamatan k
    LEFT JOIN Ta_Desa d ON k.Kd_Kec = d.Kd_Kec
    LEFT JOIN Ta_Belanja b ON d.Kd_Desa = b.Kd_Desa AND d.Tahun = b.Tahun
    WHERE k.Kd_Pemda = ${kdPemda}
    GROUP BY k.Nama_Kecamatan
    ORDER BY Nilai1 DESC
  `;

  const budgetByType = await prisma.$queryRaw<Array<{ Kategori1: string; Kategori2: string; Nilai1: number; Nilai2: number }>>`
    SELECT
      'Pendapatan' as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(Realisasi as BIGINT)), 0) as Nilai2
    FROM Ta_Pendapatan pd
    INNER JOIN Ta_Desa d ON pd.Kd_Desa = d.Kd_Desa AND pd.Tahun = d.Tahun
    INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
    WHERE k.Kd_Pemda = ${kdPemda}
    UNION ALL
    SELECT
      'Belanja' as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(Realisasi as BIGINT)), 0) as Nilai2
    FROM Ta_Belanja b
    INNER JOIN Ta_Desa d ON b.Kd_Desa = d.Kd_Desa AND b.Tahun = d.Tahun
    INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
    WHERE k.Kd_Pemda = ${kdPemda}
  `;

  return {
    level: 'pemda',
    code: kdPemda,
    name: pemda?.Nama_Pemda || 'Unknown',
    stats: {
      totalDesa: Number(totalDesa),
      totalBudget: Number(budgetStats[0]?.totalBudget || 0),
      avgBudgetPerDesa: Number(budgetStats[0]?.avgBudget || 0),
      avgIDM: 0,
      totalAudited: 0,
      auditPercentage: 0,
    },
    chartData: {
      budgetByType: budgetByType || [],
      topRegions: topRegions || [],
    },
  };
}

async function getKecamatanStatistics(kdKec: string): Promise<RegionStatistics> {
  const kecamatan = await prisma.ref_Kecamatan.findUnique({
    where: { Kd_Kec: kdKec },
  });

  const totalDesaResult = await prisma.$queryRaw<Array<{ total: number }>>`
    SELECT COUNT(*) as total
    FROM Ref_Desa
    WHERE Kd_Kec = ${kdKec}
  `;

  const totalDesa = totalDesaResult[0]?.total || 0;

  const budgetStats = await prisma.$queryRaw<Array<{ totalBudget: number; avgBudget: number }>>`
    SELECT
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as totalBudget,
      COALESCE(AVG(CAST(Anggaran as BIGINT)), 0) as avgBudget
    FROM Ta_Belanja b
    INNER JOIN Ta_Desa d ON b.Kd_Desa = d.Kd_Desa AND b.Tahun = d.Tahun
    WHERE d.Kd_Kec = ${kdKec}
  `;

  const topRegions = await prisma.$queryRaw<Array<{ Kategori1: string; Kategori2: string; Nilai1: number; Nilai2: number }>>`
    SELECT TOP 5
      rd.Nama_Desa as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(b.Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(b.Realisasi as BIGINT)), 0) as Nilai2
    FROM Ref_Desa rd
    LEFT JOIN Ta_Desa d ON rd.Kd_Desa = d.Kd_Desa
    LEFT JOIN Ta_Belanja b ON d.Kd_Desa = b.Kd_Desa AND d.Tahun = b.Tahun
    WHERE rd.Kd_Kec = ${kdKec}
    GROUP BY rd.Nama_Desa
    ORDER BY Nilai1 DESC
  `;

  const budgetByType = await prisma.$queryRaw<Array<{ Kategori1: string; Kategori2: string; Nilai1: number; Nilai2: number }>>`
    SELECT
      'Pendapatan' as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(Realisasi as BIGINT)), 0) as Nilai2
    FROM Ta_Pendapatan pd
    INNER JOIN Ta_Desa d ON pd.Kd_Desa = d.Kd_Desa AND pd.Tahun = d.Tahun
    WHERE d.Kd_Kec = ${kdKec}
    UNION ALL
    SELECT
      'Belanja' as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(Realisasi as BIGINT)), 0) as Nilai2
    FROM Ta_Belanja b
    INNER JOIN Ta_Desa d ON b.Kd_Desa = d.Kd_Desa AND b.Tahun = d.Tahun
    WHERE d.Kd_Kec = ${kdKec}
  `;

  return {
    level: 'kecamatan',
    code: kdKec,
    name: kecamatan?.Nama_Kecamatan || 'Unknown',
    stats: {
      totalDesa: Number(totalDesa),
      totalBudget: Number(budgetStats[0]?.totalBudget || 0),
      avgBudgetPerDesa: Number(budgetStats[0]?.avgBudget || 0),
      avgIDM: 0,
      totalAudited: 0,
      auditPercentage: 0,
    },
    chartData: {
      budgetByType: budgetByType || [],
      topRegions: topRegions || [],
    },
  };
}

async function getDesaStatistics(kdDesa: string): Promise<RegionStatistics> {
  const desa = await prisma.ref_Desa.findUnique({
    where: { Kd_Desa: kdDesa },
  });

  const budgetStats = await prisma.$queryRaw<Array<{ totalBudget: number }>>`
    SELECT
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as totalBudget
    FROM Ta_Belanja b
    INNER JOIN Ta_Desa d ON b.Kd_Desa = d.Kd_Desa AND b.Tahun = d.Tahun
    WHERE d.Kd_Desa = ${kdDesa}
  `;

  const budgetByType = await prisma.$queryRaw<Array<{ Kategori1: string; Kategori2: string; Nilai1: number; Nilai2: number }>>`
    SELECT
      'Pendapatan' as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(Realisasi as BIGINT)), 0) as Nilai2
    FROM Ta_Pendapatan
    WHERE Kd_Desa = ${kdDesa}
    UNION ALL
    SELECT
      'Belanja' as Kategori1,
      'Budget' as Kategori2,
      COALESCE(SUM(CAST(Anggaran as BIGINT)), 0) as Nilai1,
      COALESCE(SUM(CAST(Realisasi as BIGINT)), 0) as Nilai2
    FROM Ta_Belanja
    WHERE Kd_Desa = ${kdDesa}
  `;

  return {
    level: 'desa',
    code: kdDesa,
    name: desa?.Nama_Desa || 'Unknown',
    stats: {
      totalDesa: 1,
      totalBudget: Number(budgetStats[0]?.totalBudget || 0),
      avgBudgetPerDesa: Number(budgetStats[0]?.totalBudget || 0),
      avgIDM: 0,
      totalAudited: 0,
      auditPercentage: 0,
    },
    chartData: {
      budgetByType: budgetByType || [],
      topRegions: [],
    },
  };
}
