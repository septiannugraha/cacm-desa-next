import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'   // pastikan ada prisma client di lib/prisma.ts

// GET semua pesan
export async function GET() {
  try {
    const pesan = await prisma.cACM_TempPesan.findMany({
      select: { id: true, Pesan: true },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(pesan)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch pesan' }, { status: 500 })
  }
}

// POST pesan baru
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newPesan = await prisma.cACM_TempPesan.create({
      data: {
        Pesan: body.Pesan,
      },
      select: { id: true, Pesan: true },
    })
    return NextResponse.json(newPesan, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create pesan' }, { status: 500 })
  }
}