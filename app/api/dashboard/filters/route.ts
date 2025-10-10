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

    
 

    const kodepemda = session.user.pemdakd; // pastikan ini string dan sudah divalidasi

    const kecamatanData = await prisma.$queryRawUnsafe<Array<{ kecamatan: string; Kd_Kec: string }>>(
      `SELECT SUBSTRING(Kd_Kec, 6, 2) + '  ' + Nama_Kecamatan as kecamatan, Kd_Kec
       FROM Ref_Kecamatan
       WHERE Kd_Pemda = '${kodepemda}'
       ORDER BY Kd_Kec`
    );
    
    

    // Desa (include Kd_Kec for grouping)
    const desaRaw = await prisma.$queryRawUnsafe<Array<{ desa: string; Kd_Desa: string; Kd_Kec: string }>>(`
      SELECT SUBSTRING(Kd_Desa, 6, 7) + '  ' + Nama_Desa as desa, Kd_Desa, Kd_Kec
      FROM Ref_Desa
      Where SUBSTRING(Kd_Desa, 1, 4) = '${kodepemda}'
      ORDER BY Kd_Desa
    `);

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

    console.log('[Filters] Fetched data:', {
      kecamatan: kecamatanData.length,
      desaGroups: Object.keys(desaGrouped).length,
      sumberDana: sumberDanaData.length,
    });

    return NextResponse.json({
      kecamatan: kecamatanData,
      desa: desaGrouped,
      sumberDana: sumberDanaData,
    });
  } catch (error) {
    console.error('Filter data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter data' },
      { status: 500 }
    );
  }
}
