import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function toDateOrThrow(v: any, fieldName: string): Date {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid datetime for ${fieldName}`)
  }
  return d
}

// GET: Fetch single Ta_Pemda record by ID
export function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return params
    .then(async ({ id }) => {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const kdPemda = session.user.pemdakd
      const fiscalYear = (session.fiscalYear || new Date().getFullYear()).toString()

      return prisma.ta_Pemda.findUnique({
        where: {
          id,
          Kd_Pemda: kdPemda, // Ensure the record matches the user's Kd_Pemda
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
      })
        .then((pemda) => {
          if (!pemda) return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
          return NextResponse.json(pemda)
        })
        .catch((error) => {
          console.error('Failed to fetch Pemda:', error)
          return NextResponse.json({ error: 'Failed to fetch Pemda' }, { status: 500 })
        })
    })
}

// POST: Create a new Ta_Pemda entry
export function POST(request: Request) {
  return getServerSession(authOptions)
    .then((session) => {
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      return request.json().then((body) => {
        const { Tahun, Kd_Pemda, Nama_Pemda, Ibukota, Alamat, Nm_Bupati, Jbt_Bupati, Nm_Inspektur, NIP_Inspektur, Jbt_Inspektur, Alamat_Inspektorat, Nm_Admin, HP_Admin, email_Admin, isactive } = body

        // Validate required fields
        if (!Tahun || !Kd_Pemda || !Nama_Pemda) {
          return NextResponse.json({ error: 'Tahun, Kd_Pemda, Nama_Pemda are required' }, { status: 400 })
        }

        return prisma.ta_Pemda.create({
          data: {
            Tahun,
            Kd_Pemda,
            Nama_Pemda,
            Ibukota,
            Alamat,
            Nm_Bupati,
            Jbt_Bupati,
            Nm_Inspektur,
            NIP_Inspektur,
            Jbt_Inspektur,
            Alamat_Inspektorat,
            Nm_Admin,
            HP_Admin,
            email_Admin,
            isactive,
            created_at: new Date(),
            created_by: session.user.username || session.user.email || null,
          },
        })
          .then((newTaPemda) => {
            return NextResponse.json({ message: 'Ta_Pemda created successfully', data: newTaPemda }, { status: 201 })
          })
          .catch((err) => {
            console.error(err)
            return NextResponse.json({ error: 'Failed to create Ta_Pemda' }, { status: 500 })
          })
      })
    })
}

// PUT: Update existing Ta_Pemda entry by ID
export function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return params
    .then(async ({ id }) => {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const body = await request.json()
      const { Tahun, Kd_Pemda, Nama_Pemda, Ibukota, Alamat, Nm_Bupati, Jbt_Bupati, Nm_Inspektur, NIP_Inspektur, Jbt_Inspektur, Alamat_Inspektorat, Nm_Admin, HP_Admin, email_Admin, isactive } = body

      // Validate required fields
      if (!Tahun || !Kd_Pemda || !Nama_Pemda) {
        return NextResponse.json({ error: 'Tahun, Kd_Pemda, Nama_Pemda are required' }, { status: 400 })
      }

      return prisma.ta_Pemda.update({
        where: { id },
        data: {
          Tahun,
          Kd_Pemda,
          Nama_Pemda,
          Ibukota,
          Alamat,
          Nm_Bupati,
          Jbt_Bupati,
          Nm_Inspektur,
          NIP_Inspektur,
          Jbt_Inspektur,
          Alamat_Inspektorat,
          Nm_Admin,
          HP_Admin,
          email_Admin,
          isactive,
          update_at: new Date(),
          update_by: session.user.username || session.user.email || null,
        },
      })
        .then((updatedTaPemda) => {
          return NextResponse.json({ message: 'Ta_Pemda updated successfully', data: updatedTaPemda })
        })
        .catch((err) => {
          console.error('Failed to update Ta_Pemda:', err)
          return NextResponse.json({ error: 'Failed to update Ta_Pemda' }, { status: 500 })
        })
    })
}

// DELETE: Delete Ta_Pemda by ID
export function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return params
    .then(async ({ id }) => {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      return prisma.ta_Pemda.delete({
        where: { id },
      })
        .then(() => {
          return NextResponse.json({ message: 'Ta_Pemda deleted successfully' })
        })
        .catch((error) => {
          console.error('Failed to delete Ta_Pemda:', error)
          return NextResponse.json({ error: 'Failed to delete Ta_Pemda' }, { status: 500 })
        })
    })
}
