import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Rewrite this to match actual CACM_Atensi schema from database
    // Current schema has: Tahun, Kd_Pemda, No_Atensi, Tgl_Atensi, etc.
    // Not the designed schema with: category, village, reportedBy, status, priority
    // See: prisma/schema.prisma line 21-44

    return NextResponse.json({
      error: 'Atensi feature temporarily disabled - schema mismatch',
      message: 'The CACM_Atensi model structure changed. Needs rewrite to match actual database.'
    }, { status: 501 }) // 501 = Not Implemented
  } catch (error) {
    console.error('Failed to fetch atensi:', error)
    return NextResponse.json({ error: 'Failed to fetch atensi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Rewrite this to match actual CACM_Atensi schema
    return NextResponse.json({
      error: 'Atensi creation temporarily disabled - schema mismatch',
      message: 'The CACM_Atensi model structure changed. Needs rewrite to match actual database.'
    }, { status: 501 })
  } catch (error) {
    console.error('Failed to create atensi:', error)
    return NextResponse.json({ error: 'Failed to create atensi' }, { status: 500 })
  }
}
