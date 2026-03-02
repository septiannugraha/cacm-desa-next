import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireMobileAuth } from '@/lib/get-mobile-session'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireMobileAuth()
    if (!auth.ok) return auth.response

    const session = auth.session
    const kdDesa = session?.mobile?.kd_desa
    const username = session?.mobile?.username

    if (!kdDesa) {
      return NextResponse.json({ error: 'Kd Desa tidak ditemukan' }, { status: 400 })
    }

    // 🔥 EXECUTE SP
    await prisma.$executeRawUnsafe(`
      EXEC SP_CEK_TL
        @Id='${id}',
        @Kd_Desa='${kdDesa}',
        @Username='${username}'
    `)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}