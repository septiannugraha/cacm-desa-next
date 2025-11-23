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
