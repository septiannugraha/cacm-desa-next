import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tahun = searchParams.get('tahun');
  const level = searchParams.get('level');
  const kode = searchParams.get('kode') || '';


  function normalizeBigInt(obj: any) {
    return JSON.parse(
      JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  
  if (!tahun || !level) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const map_data_raw = await prisma.$queryRawUnsafe<any[]>(`
      EXEC sp_cacm_publicdashboard 
        @nmdashboard = 'sebaran_anggaran',
        @tahun = '${tahun}',
        @level = '${level}',
        @kode = '${kode}'
    `);
    const map_data = normalizeBigInt(map_data_raw);
    
    const gradation_data_raw = await prisma.$queryRawUnsafe<any[]>(`
      EXEC sp_cacm_publicdashboard 
        @nmdashboard = 'range_sebaran_anggaran',
        @tahun = '${tahun}',
        @level = '${level}',
        @kode = '${kode}'
    `);
    const gradation_data = normalizeBigInt(gradation_data_raw);
  
    console.log('map_data:', map_data);
    console.log('gradation_data:', gradation_data);

    return NextResponse.json({ map_data, gradation_data });
  } catch (error) {
    console.error('Dashboard gradation error:', error);
    return NextResponse.json({ error: 'Failed to fetch gradation data' }, { status: 500 });
  }
}