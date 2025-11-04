import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { Kd_Pemda, Tahun } = await request.json()
  if (!Kd_Pemda || !Tahun) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

  try {
    // Tandai status sebagai "running"
    await prisma.cACM_RefreshStatus.upsert({
      where: {
        Kd_Pemda_Tahun: {
          Kd_Pemda,
          Tahun,
        },
      },
      update: {
        Status: 'running',
        UpdatedAt: new Date(),
      },
      create: {
        Kd_Pemda,
        Tahun,
        Status: 'running',
      },
    })

    // Jalankan stored procedure pertama
    await prisma.$executeRawUnsafe(`EXEC sp_cacm_data_detail @Kd_Pemda = '${Kd_Pemda}', @Tahun = '${Tahun}'`)

    // Tunggu 4 menit
    await new Promise(resolve => setTimeout(resolve, 240_000))

    // Jalankan stored procedure kedua
    await prisma.$executeRawUnsafe(`EXEC sp_cacm_dashboard @Kd_Pemda = '${Kd_Pemda}', @Tahun = '${Tahun}'`)

    // Tandai status sebagai "completed"
    await prisma.cACM_RefreshStatus.update({
      where: {
        Kd_Pemda_Tahun: {
          Kd_Pemda,
          Tahun,
        },
      },
      data: {
        Status: 'completed',
        UpdatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Refresh error:', error)
    await prisma.cACM_RefreshStatus.update({
      where: {
        Kd_Pemda_Tahun: {
          Kd_Pemda,
          Tahun,
        },
      },
      data: {
        Status: 'error',
        UpdatedAt: new Date(),
      },
    })
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
  }
}