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
    const activeFiscalYear = fiscalYear

    const { searchParams } = new URL(request.url)
    const tahun = searchParams.get('tahun') ?? activeFiscalYear
    const kdprov = searchParams.get('kdprov')
    const kdpemda = searchParams.get('kdpemda')
    const kdkec = searchParams.get('kdkec')
    const kddesa = searchParams.get('kddesa')
    const sumberdana = searchParams.get('sumberdana')

    console.log('Params:', { tahun, kdprov, kdpemda, kdkec, kddesa, sumberdana })

    /* =====================================================
       1️⃣ EXECUTE RINGKASAN FIRST (BLOCKING)
    ===================================================== */

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
    `

    /* =====================================================
       2️⃣ EXECUTE OTHERS IN PARALLEL
    ===================================================== */

    const [
      pendapatanPerKelompok,
      pendapatanPerSumberDana,
      belanjaPerSumberDana,
      belanjaPerKelompok,
      belanjaTaggingTertinggi,
      belanjaTaggingTerendah
    ] = await Promise.allSettled([

      prisma.$queryRaw`
        EXEC sp_cacm_dashboard 
          @nmdashboard = pendapatan_perkelompok,
          @tahun = ${tahun},
          @kdprov = ${kdprov},
          @kdpemda = ${kdpemda},
          @kdkec = ${kdkec},
          @kddesa = ${kddesa},
          @sumberdana = ${sumberdana}
      `,

      prisma.$queryRaw`
        EXEC sp_cacm_dashboard 
          @nmdashboard = pendapatan_persumberdana,
          @tahun = ${tahun},
          @kdprov = ${kdprov},
          @kdpemda = ${kdpemda},
          @kdkec = ${kdkec},
          @kddesa = ${kddesa},
          @sumberdana = ${sumberdana}
      `,

      prisma.$queryRaw`
        EXEC sp_cacm_dashboard 
          @nmdashboard = belanja_persumberdana,
          @tahun = ${tahun},
          @kdprov = ${kdprov},
          @kdpemda = ${kdpemda},
          @kdkec = ${kdkec},
          @kddesa = ${kddesa},
          @sumberdana = ${sumberdana}
      `,

      prisma.$queryRaw`
        EXEC sp_cacm_dashboard 
          @nmdashboard = belanja_perkelompok,
          @tahun = ${tahun},
          @kdprov = ${kdprov},
          @kdpemda = ${kdpemda},
          @kdkec = ${kdkec},
          @kddesa = ${kddesa},
          @sumberdana = ${sumberdana}
      `,

      prisma.$queryRaw`
        EXEC sp_cacm_dashboard 
          @nmdashboard = belanja_pertagging_tertinggi,
          @tahun = ${tahun},
          @kdprov = ${kdprov},
          @kdpemda = ${kdpemda},
          @kdkec = ${kdkec},
          @kddesa = ${kddesa},
          @sumberdana = ${sumberdana}
      `,

      prisma.$queryRaw`
        EXEC sp_cacm_dashboard 
          @nmdashboard = belanja_pertagging_terendah,
          @tahun = ${tahun},
          @kdprov = ${kdprov},
          @kdpemda = ${kdpemda},
          @kdkec = ${kdkec},
          @kddesa = ${kddesa},
          @sumberdana = ${sumberdana}
      `
    ])

    /* =====================================================
       3️⃣ SAFE RESULT HANDLING
    ===================================================== */

    const safe = (result: PromiseSettledResult<any>) =>
      result.status === 'fulfilled' ? result.value : []

    return NextResponse.json({
      ringkasan_apbdes,
      pendapatan_perkelompok: safe(pendapatanPerKelompok),
      pendapatan_persumberdana: safe(pendapatanPerSumberDana),
      belanja_persumberdana: safe(belanjaPerSumberDana),
      belanja_perkelompok: safe(belanjaPerKelompok),
      belanja_pertagging_tertinggi: safe(belanjaTaggingTertinggi),
      belanja_pertagging_terendah: safe(belanjaTaggingTerendah)
    })

  } catch (error) {
    console.error('Dashboard chart data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}