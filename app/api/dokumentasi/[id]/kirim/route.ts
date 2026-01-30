// File: app/api/dokumentasi/[id]/kirim/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })
    if (!pemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })

    const kdPemda = pemda.code.substring(0, 4)
    const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

    const atensi = await prisma.cACM_Atensi.findUnique({
      where: { id: params.id },
      select: { id: true, Tahun: true, Kd_Pemda: true, No_Atensi: true, isSent: true },
    })
    if (!atensi) return NextResponse.json({ error: 'Atensi not found' }, { status: 404 })

    // Guard scope
    if (atensi.Tahun !== fiscalYear || atensi.Kd_Pemda !== kdPemda) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // (Opsional) kalau sudah isSent, boleh blok
    if (atensi.isSent === true) {
      return NextResponse.json({ error: 'Atensi sudah dikirim' }, { status: 409 })
    }

    // EXEC stored procedure
    // >>> SESUAIKAN NAMA SCHEMA (dbo) & parameter SP Anda
    await prisma.$executeRaw`
      EXEC dbo.sp_kirim_atensi
        @Tahun = ${atensi.Tahun},
        @Kd_Pemda = ${atensi.Kd_Pemda},
        @No_Atensi = ${atensi.No_Atensi}
    `

    // (Opsional) set isSent true setelah SP sukses
    await prisma.cACM_Atensi.update({
      where: { id: atensi.id },
      data: {
        isSent: true,
        update_at: new Date(),
        update_by: session.user.username || session.user.email || null,
      },
    })

    return NextResponse.json({ message: 'Atensi berhasil dikirim' })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || 'Failed to kirim atensi' }, { status: 500 })
  }
}
