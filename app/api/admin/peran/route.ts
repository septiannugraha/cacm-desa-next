import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: ambil daftar peran (hanya Peran, Keterangan, Menu)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const peran = await prisma.cACM_Peran.findMany({
      select: {
        Peran: true,
        Keterangan: true,
        Menu: true,
      },
      orderBy: { Peran: 'asc' },
    })

    return NextResponse.json(peran)
  } catch (error) {
    console.error('Failed to fetch peran:', error)
    return NextResponse.json({ error: 'Failed to fetch peran' }, { status: 500 })
  }
}

// POST: tambah peran baru (hanya Peran, Keterangan, Menu)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { Peran, Keterangan, Menu } = body

    if (!Peran) {
      return NextResponse.json(
        { error: 'Peran wajib diisi' },
        { status: 400 }
      )
    }

    const newPeran = await prisma.cACM_Peran.create({
      data: {
        Peran,
        Keterangan,
        Menu,
      },
      select: {
        Peran: true,
        Keterangan: true,
        Menu: true,
      },
    })

    return NextResponse.json(newPeran, { status: 201 })
  } catch (error) {
    console.error('Failed to create peran:', error)
    return NextResponse.json({ error: 'Failed to create peran' }, { status: 500 })
  }
}