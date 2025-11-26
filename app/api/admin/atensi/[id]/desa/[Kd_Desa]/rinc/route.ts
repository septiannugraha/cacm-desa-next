import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all transaction evidence for a village finding
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; Kd_Desa: string }> }
) {
  try {
    // Next.js 15+: params is now a Promise and must be awaited
    const { id, Kd_Desa } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's pemda info
    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { code: true },
    })

    if (!pemda) {
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    }

    const kdPemda = pemda.code.substring(0, 4)
    const fiscalYear = session.fiscalYear || new Date().getFullYear()

    // Fetch all transaction evidence for this village
    const evidence = await prisma.cACM_Atensi_Desa_Rinc.findMany({
      where: {
        Tahun: fiscalYear.toString(),
        Kd_Pemda: kdPemda,
        No_Atensi: id,
        Kd_Desa: Kd_Desa,
      },
      orderBy: [
        { Jns_Atensi: 'asc' },
        { No_Bukti: 'asc' },
      ],
    })

    return NextResponse.json({ evidence })
  } catch (error) {
    console.error('Failed to fetch transaction evidence:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction evidence' }, { status: 500 })
  }
}

// Create new transaction evidence
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; Kd_Desa: string }> }
) {
  try {
    // Next.js 15+: params is now a Promise and must be awaited
    const { id, Kd_Desa } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's pemda info
    const pemda = await prisma.cACM_Pemda.findUnique({
      where: { id: session.user.pemdaId },
      select: { id: true, code: true },
    })

    if (!pemda) {
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    }

    const kdPemda = pemda.code.substring(0, 4)
    const fiscalYear = session.fiscalYear || new Date().getFullYear()

    // Get the parent village finding to get id_Atensi_Desa
    const desaFinding = await prisma.cACM_Atensi_Desa.findUnique({
      where: {
        Tahun_Kd_Pemda_No_Atensi_Kd_Desa: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: id,
          Kd_Desa: Kd_Desa,
        },
      },
      select: { id: true },
    })

    if (!desaFinding) {
      return NextResponse.json({ error: 'Village finding not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const {
      Jns_Atensi,
      No_Bukti,
      Tgl_Bukti,
      Ket_Bukti,
      Tgl_Real,
      Tgl_Std,
      Tgl_Dif,
      Nilai_Real,
      Nilai_Std,
      Nilai_Prc,
      Nilai_Dif,
      isRedflag,
      StatusTL,
      StatusVer,
      NamaTL,
      KomenTL,
      NamaFile,
      NamaVer,
      KomenVer,
    } = body

    // Validate required fields
    if (Jns_Atensi === undefined || !No_Bukti) {
      return NextResponse.json(
        { error: 'Jns_Atensi and No_Bukti are required' },
        { status: 400 }
      )
    }

    // Check if evidence already exists
    const existingEvidence = await prisma.cACM_Atensi_Desa_Rinc.findUnique({
      where: {
        Tahun_Kd_Pemda_No_Atensi_Kd_Desa_Jns_Atensi_No_Bukti: {
          Tahun: fiscalYear.toString(),
          Kd_Pemda: kdPemda,
          No_Atensi: id,
          Kd_Desa: Kd_Desa,
          Jns_Atensi,
          No_Bukti,
        },
      },
    })

    if (existingEvidence) {
      return NextResponse.json(
        { error: 'Transaction evidence already exists with this type and number' },
        { status: 409 }
      )
    }

    // Create new transaction evidence
    const evidence = await prisma.cACM_Atensi_Desa_Rinc.create({
      data: {
        id: crypto.randomUUID(),
        id_Atensi_Desa: desaFinding.id,
        Tahun: fiscalYear.toString(),
        Kd_Pemda: kdPemda,
        No_Atensi: id,
        Kd_Desa: Kd_Desa,
        Jns_Atensi,
        No_Bukti,
        ...(Tgl_Bukti && { Tgl_Bukti: new Date(Tgl_Bukti) }),
        ...(Ket_Bukti && { Ket_Bukti }),
        ...(Tgl_Real && { Tgl_Real: new Date(Tgl_Real) }),
        ...(Tgl_Std && { Tgl_Std: new Date(Tgl_Std) }),
        ...(Tgl_Dif !== undefined && { Tgl_Dif }),
        ...(Nilai_Real !== undefined && { Nilai_Real }),
        ...(Nilai_Std !== undefined && { Nilai_Std }),
        ...(Nilai_Prc !== undefined && { Nilai_Prc }),
        ...(Nilai_Dif !== undefined && { Nilai_Dif }),
        ...(isRedflag !== undefined && { isRedflag }),
        ...(StatusTL !== undefined && { StatusTL }),
        ...(StatusVer !== undefined && { StatusVer }),
        ...(NamaTL && { NamaTL }),
        ...(KomenTL && { KomenTL }),
        ...(NamaFile && { NamaFile }),
        ...(NamaVer && { NamaVer }),
        ...(KomenVer && { KomenVer }),
        create_at: new Date(),
        create_by: session.user.username || session.user.email,
      },
    })

    return NextResponse.json({ evidence }, { status: 201 })
  } catch (error) {
    console.error('Failed to create transaction evidence:', error)
    return NextResponse.json({ error: 'Failed to create transaction evidence' }, { status: 500 })
  }
}
