import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: ambil daftar pemda (hanya nama, kode, level)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pemda = await prisma.cACM_Pemda.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        level: true,
      },
      orderBy: { code: 'asc' },
    })

    return NextResponse.json(pemda)
  } catch (error) {
    console.error('Failed to fetch pemda:', error)
    return NextResponse.json({ error: 'Failed to fetch pemda' }, { status: 500 })
  }
}

// POST: tambah pemda baru (hanya nama, kode, level)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, level } = body

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Nama dan kode wajib diisi' },
        { status: 400 }
      )
    }

    const pemda = await prisma.cACM_Pemda.create({
      data: {
        name,
        code,
        level,
      },
      select: {
        id: true,
        name: true,
        code: true,
        level: true,
      },
    })

    return NextResponse.json(pemda, { status: 201 })
  } catch (error) {
    console.error('Failed to create pemda:', error)
    return NextResponse.json({ error: 'Failed to create pemda' }, { status: 500 })
  }
}