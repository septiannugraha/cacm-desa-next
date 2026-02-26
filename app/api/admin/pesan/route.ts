import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'   // pastikan ada prisma client di lib/prisma.ts

// GET semua pesan
export async function GET() {
  try {
    const pesan = await prisma.cACM_TempPesan.findMany({
      select: { id: true, APIServer: true, Pesan: true },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(pesan)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch pesan' }, { status: 500 })
  }
}
 