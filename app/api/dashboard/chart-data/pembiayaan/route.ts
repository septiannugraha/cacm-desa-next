import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
 

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fiscalYear = session.fiscalYear || new Date().getFullYear()
    console.log('[Dashboard] FiscalYear:', fiscalYear)
    console.log('[Dashboard] User PemdaId:', session.user.pemdaId)
    
    let kdPemda = session.user.pemdakd



    // Test data for this year
    const activeFiscalYear = fiscalYear
    const yearCount = await prisma.ta_AR1_RealisasiAPBDes.count({
      where: { Tahun: activeFiscalYear.toString() }
    })
    console.log('[Dashboard] Records for year', activeFiscalYear, ':', yearCount)

    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get('tahun');
    const kdprov = searchParams.get('kdprov');
    const kdpemda = searchParams.get('kdpemda');
    const kdkec = searchParams.get('kdkec');
    const kddesa = searchParams.get('kddesa');
    const sumberdana = searchParams.get('sumberdana');
  
    const ringkasan_pembiayaan = await prisma.$queryRaw<
    {
      Kategori1: string
      Nilai1: number | null
      Nilai2: number | null
      Nilai3: number | null
    }[]
  >`
          EXEC sp_cacm_dashboard 
            @nmdashboard = ringkasan_pembiayaan,
            @tahun = ${tahun},
            @kdprov = ${kdprov},
            @kdpemda = ${kdpemda},
            @kdkec = ${kdkec},
            @kddesa = ${kddesa},
            @sumberdana = ${sumberdana}
           
        `;
     
  
    const pengeluaran_pembiayaan_persumberdana = await prisma.$queryRaw<
  {
    Kategori1: string
    Nilai1: number | null
    Nilai2?: number | null
  }[]
>`
        EXEC sp_cacm_dashboard 
          @nmdashboard = pengeluaran_pembiayaan_persumberdana,
          @tahun = ${tahun},
          @kdprov = ${kdprov},
          @kdpemda = ${kdpemda},
          @kdkec = ${kdkec},
          @kddesa = ${kddesa},
          @sumberdana = ${sumberdana}
         
      `;

    const penyertaan_modal_tertinggi = await prisma.$queryRaw<
  {
    Kategori1: string
    Nilai1: number | null
    Nilai2?: number | null
  }[]
>`
        EXEC sp_cacm_dashboard 
          @nmdashboard = penyertaan_modal_tertinggi,
          @tahun = ${tahun},
          @kdprov = ${kdprov},
          @kdpemda = ${kdpemda},
          @kdkec = ${kdkec},
          @kddesa = ${kddesa},
          @sumberdana = ${sumberdana}
         
      `;
     
     

          return NextResponse.json({
            ringkasan_pembiayaan,
            pengeluaran_pembiayaan_persumberdana,
            penyertaan_modal_tertinggi
          })
         
  } catch (error) {
    console.error('Dashboard chart data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
