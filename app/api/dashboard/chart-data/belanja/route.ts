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
  
    const ringkasan_apbdes = await prisma.$queryRaw<
    {
      Kategori1: string
      Nilai1: number | null
      Nilai2: number | null
      Nilai3: number | null
    }[]
  >`
          EXEC sp_cacm_dashboard 
            @nmdashboard = ringkasan_apbdes,
            @tahun = ${tahun},
            @kdprov = ${kdprov},
            @kdpemda = ${kdpemda},
            @kdkec = ${kdkec},
            @kddesa = ${kddesa},
            @sumberdana = ${sumberdana}
           
        `;
     
  
  const belanja_perkelompok = await prisma.$queryRaw<
  {
    Kategori1: string
    Nilai1: number | null
  }[]
>`
        EXEC sp_cacm_dashboard 
          @nmdashboard = belanja_perkelompok,
          @tahun = ${tahun},
          @kdprov = ${kdprov},
          @kdpemda = ${kdpemda},
          @kdkec = ${kdkec},
          @kddesa = ${kddesa},
          @sumberdana = ${sumberdana}
         
      `;
   
     

      console.log('Params:', { tahun, kdprov, kdpemda, kdkec, kddesa, sumberdana })

      const belanja_pertagging_tertinggi = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_pertagging_tertinggi,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;
       

          const belanja_pertagging_terendah = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_pertagging_terendah,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const realisasi_belanja_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = realisasi_belanja_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const realisasi_belanja_desa_terendah = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = realisasi_belanja_desa_terendah,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;
         
          const realisasi_belanja_desa_tertinggi = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = realisasi_belanja_desa_tertinggi,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;
 
          const belanja_per_bidang = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_per_bidang,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_barjas_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_barjas_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_modal_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_modal_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_pegawai_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_pegawai_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_tidak_terduga_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_tidak_terduga_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_bid_ppd_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_bid_ppd_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_bid_pm_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_bid_pm_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_bid_pk_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_bid_pk_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_bid_pbendes_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_bid_pbendes_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const belanja_bid_ppdes_persumberdana = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = belanja_bid_ppdes_persumberdana,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const desa_belanja_pegawai_tinggi = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = desa_belanja_pegawai_tinggi,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const desa_belanja_pegawai_rendah = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = desa_belanja_pegawai_rendah,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}
             
          `;

          const desa_belanja_modal_tinggi = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = desa_belanja_modal_tinggi,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}

          `;

          const desa_belanja_modal_rendah = await prisma.$queryRaw<
      {
        Kategori1: string
        Nilai1: number | null
      }[]
    >`
            EXEC sp_cacm_dashboard 
              @nmdashboard = desa_belanja_modal_rendah,
              @tahun = ${tahun},
              @kdprov = ${kdprov},
              @kdpemda = ${kdpemda},
              @kdkec = ${kdkec},
              @kddesa = ${kddesa},
              @sumberdana = ${sumberdana}

          `;

    return NextResponse.json({
      belanja_perkelompok,
      ringkasan_apbdes,
      belanja_pertagging_tertinggi,
      belanja_pertagging_terendah,
      belanja_persumberdana,
      realisasi_belanja_persumberdana,
      realisasi_belanja_desa_terendah,
      realisasi_belanja_desa_tertinggi,
      belanja_per_bidang,
      belanja_barjas_persumberdana,
      belanja_modal_persumberdana,
      belanja_pegawai_persumberdana,
      belanja_tidak_terduga_persumberdana,
      belanja_bid_ppd_persumberdana,
      belanja_bid_pm_persumberdana,
      belanja_bid_pk_persumberdana,
      belanja_bid_pbendes_persumberdana,
      belanja_bid_ppdes_persumberdana,
      desa_belanja_pegawai_tinggi,
      desa_belanja_pegawai_rendah,
      desa_belanja_modal_tinggi,
      desa_belanja_modal_rendah
    })
  } catch (error) {
    console.error('Dashboard chart data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
