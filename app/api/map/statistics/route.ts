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


    const belanja_persumberdana_raw = await prisma.$queryRawUnsafe<any[]>(`
      EXEC sp_cacm_publicdashboard 
        @nmdashboard = 'belanja_persumberdana',
        @tahun = '${tahun}',
        @level = '${level}',
        @kode = '${kode}'
    `);
    const belanja_persumberdana = normalizeBigInt(belanja_persumberdana_raw);
    



    const belanja_perbidang_raw = await prisma.$queryRawUnsafe<any[]>(`
      EXEC sp_cacm_publicdashboard 
        @nmdashboard = 'belanja_perbidang',
        @tahun = '${tahun}',
        @level = '${level}',
        @kode = '${kode}'
    `);
    const belanja_perbidang = normalizeBigInt(belanja_perbidang_raw);
  



    const trend_belanja_bulanan_raw = await prisma.$queryRawUnsafe<any[]>(`
        EXEC sp_cacm_publicdashboard 
          @nmdashboard = 'trend_belanja_bulanan',
          @tahun = '${tahun}',
          @level = '${level}',
          @kode = '${kode}'
      `);
      const trend_belanja_bulanan = normalizeBigInt(trend_belanja_bulanan_raw);
    
      console.log(NextResponse.json({ belanja_perbidang, belanja_persumberdana, trend_belanja_bulanan }));
    return NextResponse.json({ belanja_perbidang, belanja_persumberdana, trend_belanja_bulanan });
  } catch (error) {
    console.error('Dashboard gradation error:', error);
    return NextResponse.json({ error: 'Failed to fetch gradation data' }, { status: 500 });
  }
}