import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's pemda code for filtering
    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    });

    if (!pemda) {
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 });
    }

    // Extract Kd_Pemda (first 4 chars of code)
    const kdPemda = pemda.code.substring(0, 4);

    // Kecamatan - FILTERED by user's Pemda
    const kecamatanData = await prisma.$queryRaw<Array<{ kecamatan: string; Kd_Kec: string }>>`
      SELECT SUBSTRING(Kd_Kec, 6, 2) + '  ' + Nama_Kecamatan as kecamatan, Kd_Kec
      FROM Ref_Kecamatan
      WHERE Kd_Pemda = ${kdPemda}
      ORDER BY Kd_Kec
    `;

    // Desa - FILTERED by user's Pemda (include Kd_Kec for grouping)
    const desaRaw = await prisma.$queryRaw<Array<{ desa: string; Kd_Desa: string; Kd_Kec: string }>>`
      SELECT SUBSTRING(d.Kd_Desa, 6, 7) + '  ' + d.Nama_Desa as desa, d.Kd_Desa, d.Kd_Kec
      FROM Ref_Desa d
      INNER JOIN Ref_Kecamatan k ON d.Kd_Kec = k.Kd_Kec
      WHERE k.Kd_Pemda = ${kdPemda}
      ORDER BY d.Kd_Desa
    `;

    // Group desa by Kd_Kec
    const desaGrouped: Record<string, Array<{ desa: string; Kd_Desa: string }>> = {};
    desaRaw.forEach(({ desa, Kd_Desa, Kd_Kec }) => {
      if (!desaGrouped[Kd_Kec]) desaGrouped[Kd_Kec] = [];
      desaGrouped[Kd_Kec].push({ desa, Kd_Desa });
    });

    // Sumber Dana
    const sumberDanaData = await prisma.$queryRaw<Array<{ sumberdana: string; Kode: string }>>`
      SELECT Kode + '  ' + Nama_Sumber as sumberdana, Kode
      FROM Ref_SumberDana
      ORDER BY Urut
    `;

    console.log('[Filters] Pemda:', kdPemda, '- Fetched data:', {
      kecamatan: kecamatanData.length,
      desaGroups: Object.keys(desaGrouped).length,
      totalDesa: desaRaw.length,
      sumberDana: sumberDanaData.length,
    });

    return NextResponse.json({
      kecamatan: kecamatanData,
      desa: desaGrouped,
      sumberDana: sumberDanaData,
    });
  } catch (error) {
    console.error('Filter data fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch filter data' }, { status: 500 });
  }
}
