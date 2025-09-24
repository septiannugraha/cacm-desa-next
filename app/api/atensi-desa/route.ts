import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET: List Atensi Desa (Village-level)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const noAtensi = searchParams.get('noAtensi')
    const kdDesa = searchParams.get('kdDesa')
    const tahun = searchParams.get('tahun') || session.fiscalYear.toString()

    const where: any = {
      tahun: parseInt(tahun),
    }

    if (noAtensi) where.noAtensi = noAtensi
    if (kdDesa) where.kdDesa = kdDesa

    // Get pemda from user's pemda
    if (session.user.pemdaId) {
      const pemda = await prisma.pemda.findUnique({
        where: { id: session.user.pemdaId }
      })
      if (pemda?.kdPemda) {
        where.kdPemda = pemda.kdPemda
      }
    }

    const atensiDesa = await prisma.atensiDesa.findMany({
      where,
      include: {
        village: true,
        pemda: true,
        atensi: {
          include: {
            category: true
          }
        },
        rinciItems: {
          include: {
            category: true,
            status: true,
            verifikasi: true
          }
        },
        _count: {
          select: {
            rinciItems: true
          }
        }
      },
      orderBy: [
        { tahun: 'desc' },
        { noAtensi: 'desc' },
        { kdDesa: 'asc' }
      ]
    })

    // Calculate percentage
    const result = atensiDesa.map(ad => ({
      ...ad,
      persen: ad.jlhRF > 0 ? (ad.jlhTL / ad.jlhRF) * 100 : 0
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching atensi desa:', error)
    return NextResponse.json(
      { error: 'Failed to fetch atensi desa' },
      { status: 500 }
    )
  }
}

// POST: Create new Atensi Desa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Generate unique ID for atensi desa
    const idAtensiDesa = `AD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Get pemda code
    const pemda = await prisma.pemda.findUnique({
      where: { id: body.pemdaId || session.user.pemdaId }
    })

    if (!pemda?.kdPemda) {
      return NextResponse.json({ error: 'Pemda code not found' }, { status: 400 })
    }

    const atensiDesa = await prisma.atensiDesa.create({
      data: {
        idAtensiDesa,
        tahun: body.tahun || session.fiscalYear,
        kdPemda: pemda.kdPemda,
        kdDesa: body.kdDesa,
        noAtensi: body.noAtensi,
        atensiId: body.atensiId,
        jlhRF: body.jlhRF || 0,
        jlhTL: body.jlhTL || 0
      },
      include: {
        village: true,
        pemda: true,
        atensi: true
      }
    })

    return NextResponse.json(atensiDesa, { status: 201 })
  } catch (error) {
    console.error('Error creating atensi desa:', error)
    return NextResponse.json(
      { error: 'Failed to create atensi desa' },
      { status: 500 }
    )
  }
}