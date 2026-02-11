import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// GET: Fetch all Ta_Pemda records filtered by Kd_Pemda from session
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the Kd_Pemda from the session
    const kdPemda = session.user.pemdakd

    if (!kdPemda) {
      return NextResponse.json({ error: 'Kd_Pemda not found in session' }, { status: 400 })
    }

    // Fetch all Ta_Pemda records where Kd_Pemda matches the session user Kd_Pemda
    const taPemda = await prisma.ta_Pemda.findMany({
      where: {
        Kd_Pemda: kdPemda, // Filtering based on session's Kd_Pemda
      },
      select: {
        id: true,
        Tahun: true,
        Kd_Pemda: true,
        Nama_Pemda: true,
        Ibukota: true,
        Alamat: true,
        Nm_Bupati: true,
        Jbt_Bupati: true,
        Nm_Inspektur: true,
        NIP_Inspektur: true,
        Jbt_Inspektur: true,
        Alamat_Inspektorat: true,
        Nm_Admin: true,
        HP_Admin: true,
        email_Admin: true,
        isactive: true,
        created_at: true,
        created_by: true,
        update_at: true,
        update_by: true,
      },
      orderBy: { Nama_Pemda: 'asc' },
    })

    return NextResponse.json(taPemda)
  } catch (error) {
    console.error('Failed to fetch Ta_Pemda records:', error)
    return NextResponse.json({ error: 'Failed to fetch Ta_Pemda records' }, { status: 500 })
  }
}
